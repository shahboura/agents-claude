#!/usr/bin/env node

/**
 * Claude Agents Installation Script
 * Cross-platform installer for Windows, Linux, and macOS
 *
 * Hardening goals:
 * - Scope-aware install/update/uninstall (global/project/all)
 * - Non-destructive updates (manifest tracked + safe settings merge)
 * - Backup sessions with restore hints and retention policy
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { parseArgs, getRequestedScopes, showUsage } = require('./scripts/installer-cli');
const { detectInstallState: detectInstallStateCore } = require('./scripts/installer-detect');

const PACKAGE_NAME = 'agents-claude';
const MANIFEST_FILE = '.agents-claude-manifest.json';
const VERSION_FILE = '.claude-agents-version';
const BACKUP_DIR = '.backups';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(color, prefix, message) {
  console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function info(message) {
  log(colors.blue, 'INFO', message);
}

function success(message) {
  log(colors.green, 'SUCCESS', message);
}

function warning(message) {
  log(colors.yellow, 'WARNING', message);
}

function error(message) {
  log(colors.red, 'ERROR', message);
}

function getHomeDir() {
  return os.homedir();
}

function getGlobalClaudeDir() {
  return path.join(getHomeDir(), '.claude');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function readJsonFile(filePath, labelForError) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    warning(`Could not parse ${labelForError}: ${err.message}`);
    return null;
  }
}

function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function formatBackupTimestamp(date = new Date()) {
  return date.toISOString().replace('T', '_').replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z');
}

function removeDirectoryIfExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function getBackupRoot(paths) {
  return paths.scope === 'project'
    ? path.join(paths.claudeDir, BACKUP_DIR)
    : path.join(paths.rootDir, BACKUP_DIR);
}

function resolveUniqueBackupLocation(backupRoot, baseBackupId) {
  let backupId = baseBackupId;
  let backupDir = path.join(backupRoot, backupId);
  let counter = 1;

  while (fs.existsSync(backupDir)) {
    backupId = `${baseBackupId}--${String(counter).padStart(2, '0')}`;
    backupDir = path.join(backupRoot, backupId);
    counter += 1;
  }

  return { backupId, backupDir };
}

function pruneBackupRetention(backupRoot, maxBackups = 10, maxAgeDays = 30) {
  if (!fs.existsSync(backupRoot)) {
    return 0;
  }

  let prunedCount = 0;
  const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

  const backupDirs = fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()
    .reverse();

  for (const dirName of backupDirs.slice(maxBackups)) {
    removeDirectoryIfExists(path.join(backupRoot, dirName));
    prunedCount += 1;
  }

  const remainingDirs = fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  for (const dirName of remainingDirs) {
    const backupPath = path.join(backupRoot, dirName);
    try {
      const stat = fs.statSync(backupPath);
      if (stat.mtimeMs < cutoffMs) {
        removeDirectoryIfExists(backupPath);
        prunedCount += 1;
      }
    } catch {
      // ignore retention errors
    }
  }

  return prunedCount;
}

function createBackupSession(paths, operation) {
  const createdAt = new Date();
  const stamp = formatBackupTimestamp(createdAt);
  const baseBackupId = `${stamp}--${operation}--${paths.scope}`;
  const backupRoot = getBackupRoot(paths);
  const { backupId, backupDir } = resolveUniqueBackupLocation(backupRoot, baseBackupId);
  const entries = [];
  const seen = new Set();

  function backupFile(absolutePath, relativePathFromRoot) {
    if (!fs.existsSync(absolutePath)) {
      return false;
    }

    const normalizedRelativePath = relativePathFromRoot || path.relative(paths.rootDir, absolutePath);
    if (!normalizedRelativePath || seen.has(normalizedRelativePath)) {
      return false;
    }

    const targetPath = path.join(backupDir, normalizedRelativePath);
    ensureDir(path.dirname(targetPath));
    fs.copyFileSync(absolutePath, targetPath);
    entries.push({ path: normalizedRelativePath });
    seen.add(normalizedRelativePath);
    return true;
  }

  function finalize() {
    if (entries.length === 0) {
      removeDirectoryIfExists(backupDir);
      return { created: false, backupDir: null, backupId: null, count: 0, prunedCount: 0 };
    }

    const manifest = {
      schemaVersion: 1,
      package: PACKAGE_NAME,
      operation,
      scope: paths.scope,
      createdAt: createdAt.toISOString(),
      rootDir: paths.rootDir,
      files: entries,
    };
    writeJsonFile(path.join(backupDir, 'backup-manifest.json'), manifest);
    const prunedCount = pruneBackupRetention(backupRoot);

    return {
      created: true,
      backupDir,
      backupId,
      count: entries.length,
      prunedCount,
    };
  }

  return { backupFile, finalize };
}

function printBackupRestoreHint(backupResult) {
  if (!backupResult || !backupResult.created) {
    return;
  }
  info(`Restore hint: review ${path.join(backupResult.backupDir, 'backup-manifest.json')} and copy files back to original paths.`);
}

function validatePackageContents(sourceDir) {
  const claudeDir = path.join(sourceDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    error('Invalid package structure. Missing .claude directory.');
    return false;
  }

  const claudeMd = path.join(sourceDir, 'CLAUDE.md');
  if (!fs.existsSync(claudeMd)) {
    warning('CLAUDE.md not found in package root; project installs will skip CLAUDE.md copy.');
  }

  return true;
}

function checkVersion(sourceDir) {
  try {
    const packagePath = path.join(sourceDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = readJsonFile(packagePath, 'package.json');
      if (packageData && packageData.version) {
        info(`Installing Claude Agents v${packageData.version}`);
        return packageData.version;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function showVersion(sourceDir) {
  try {
    const packagePath = path.join(sourceDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = readJsonFile(packagePath, 'package.json');
      if (packageData && packageData.version) {
        console.log(`Claude Agents v${packageData.version}`);
        console.log('Repository: https://github.com/shahboura/agents-claude');
        return;
      }
    }
    console.log('Claude Agents (version unknown)');
  } catch {
    console.log('Claude Agents (version check failed)');
  }
}

function listFilesRecursive(rootDir) {
  const files = [];

  function walk(currentDir, relativeBase = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = relativeBase ? path.join(relativeBase, entry.name) : entry.name;
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  walk(rootDir);
  return files;
}

function getManagedSourceFiles(sourceClaudeDir) {
  const allFiles = listFilesRecursive(sourceClaudeDir);
  return allFiles.filter(relativePath => {
    if (relativePath === 'settings.json') {
      return false;
    }

    if (relativePath.includes(`node_modules${path.sep}`) || relativePath === 'node_modules') {
      return false;
    }

    if (relativePath === BACKUP_DIR || relativePath.startsWith(`${BACKUP_DIR}${path.sep}`)) {
      return false;
    }

    if (/\.backup\./.test(relativePath)) {
      return false;
    }

    return true;
  });
}

function filesEqual(pathA, pathB) {
  try {
    const statA = fs.statSync(pathA);
    const statB = fs.statSync(pathB);
    if (statA.size !== statB.size) {
      return false;
    }
    const contentA = fs.readFileSync(pathA);
    const contentB = fs.readFileSync(pathB);
    return contentA.equals(contentB);
  } catch {
    return false;
  }
}

function getScopePaths(scope, projectDir) {
  if (scope === 'global') {
    const rootDir = getGlobalClaudeDir();
    return {
      scope,
      rootDir,
      claudeDir: rootDir,
      manifestPath: path.join(rootDir, MANIFEST_FILE),
      versionPath: path.join(rootDir, VERSION_FILE),
      settingsPath: path.join(rootDir, 'settings.json'),
      claudeMdPath: null,
    };
  }

  const resolvedProjectDir = path.resolve(projectDir || process.cwd());
  return {
    scope,
    rootDir: resolvedProjectDir,
    claudeDir: path.join(resolvedProjectDir, '.claude'),
    manifestPath: path.join(resolvedProjectDir, '.claude', MANIFEST_FILE),
    versionPath: path.join(resolvedProjectDir, VERSION_FILE),
    settingsPath: path.join(resolvedProjectDir, '.claude', 'settings.json'),
    claudeMdPath: path.join(resolvedProjectDir, 'CLAUDE.md'),
  };
}

function toManagedPath(scope, relativeClaudeFile) {
  if (scope === 'global') {
    return relativeClaudeFile;
  }
  return path.join('.claude', relativeClaudeFile);
}

function installManagedTree(sourceClaudeDir, sourceFiles, destinationClaudeDir, scope, backupSession) {
  ensureDir(destinationClaudeDir);

  let copiedCount = 0;
  let skippedCount = 0;
  let backupCount = 0;

  for (const relativeFile of sourceFiles) {
    const src = path.join(sourceClaudeDir, relativeFile);
    const dest = path.join(destinationClaudeDir, relativeFile);
    ensureDir(path.dirname(dest));

    if (fs.existsSync(dest)) {
      if (filesEqual(src, dest)) {
        skippedCount += 1;
        continue;
      }

      try {
        if (backupSession && backupSession.backupFile(dest, toManagedPath(scope, relativeFile))) {
          backupCount += 1;
        }
      } catch (err) {
        warning(`Could not back up existing file ${dest}: ${err.message}`);
      }
    }

    fs.copyFileSync(src, dest);
    copiedCount += 1;
  }

  return {
    copiedCount,
    skippedCount,
    backupCount,
  };
}

function buildManagedFilesFromSource(scope, sourceFiles, paths) {
  const managedFiles = [];

  for (const relativeFile of sourceFiles) {
    const managedPath = toManagedPath(scope, relativeFile);
    const absoluteManagedPath = path.join(paths.rootDir, managedPath);
    if (fs.existsSync(absoluteManagedPath)) {
      managedFiles.push(managedPath);
    }
  }

  return managedFiles;
}

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(v => typeof v === 'string');
}

function mergeInstallerSettings(targetSettingsPath, sourceSettings, onBeforeWrite) {
  const patch = {
    createdFile: false,
    skipped: false,
    changed: false,
    addedPermissionsObject: false,
    addedPermissionDefaultMode: false,
    addedPermissionAllow: [],
    addedPermissionDeny: [],
    addedSandbox: false,
    addedHooks: false,
  };

  if (!sourceSettings || !isObject(sourceSettings)) {
    patch.skipped = true;
    return patch;
  }

  if (!fs.existsSync(targetSettingsPath)) {
    writeJsonFile(targetSettingsPath, sourceSettings);
    patch.createdFile = true;
    patch.changed = true;
    patch.addedPermissionsObject = isObject(sourceSettings.permissions);
    patch.addedPermissionDefaultMode = Boolean(sourceSettings.permissions && sourceSettings.permissions.defaultMode !== undefined);
    patch.addedPermissionAllow = normalizeArray(sourceSettings.permissions && sourceSettings.permissions.allow);
    patch.addedPermissionDeny = normalizeArray(sourceSettings.permissions && sourceSettings.permissions.deny);
    patch.addedSandbox = sourceSettings.sandbox !== undefined;
    patch.addedHooks = sourceSettings.hooks !== undefined;
    return patch;
  }

  const existing = readJsonFile(targetSettingsPath, `existing settings at ${targetSettingsPath}`);
  if (!existing || !isObject(existing)) {
    warning(`Skipping settings merge for ${targetSettingsPath} because existing settings are invalid JSON.`);
    patch.skipped = true;
    return patch;
  }

  if (isObject(sourceSettings.permissions)) {
    if (existing.permissions === undefined) {
      existing.permissions = {};
      patch.addedPermissionsObject = true;
      patch.changed = true;
    }

    if (!isObject(existing.permissions)) {
      warning(`Skipping permission merge for ${targetSettingsPath}; existing permissions is not an object.`);
    } else {
      const sourcePermissions = sourceSettings.permissions;

      if (sourcePermissions.defaultMode !== undefined && existing.permissions.defaultMode === undefined) {
        existing.permissions.defaultMode = sourcePermissions.defaultMode;
        patch.addedPermissionDefaultMode = true;
        patch.changed = true;
      }

      const sourceAllow = normalizeArray(sourcePermissions.allow);
      if (sourceAllow.length > 0) {
        if (existing.permissions.allow === undefined) {
          existing.permissions.allow = [];
        }
        if (Array.isArray(existing.permissions.allow)) {
          for (const item of sourceAllow) {
            if (!existing.permissions.allow.includes(item)) {
              existing.permissions.allow.push(item);
              patch.addedPermissionAllow.push(item);
              patch.changed = true;
            }
          }
        } else {
          warning(`Skipping permissions.allow merge for ${targetSettingsPath}; existing allow is not an array.`);
        }
      }

      const sourceDeny = normalizeArray(sourcePermissions.deny);
      if (sourceDeny.length > 0) {
        if (existing.permissions.deny === undefined) {
          existing.permissions.deny = [];
        }
        if (Array.isArray(existing.permissions.deny)) {
          for (const item of sourceDeny) {
            if (!existing.permissions.deny.includes(item)) {
              existing.permissions.deny.push(item);
              patch.addedPermissionDeny.push(item);
              patch.changed = true;
            }
          }
        } else {
          warning(`Skipping permissions.deny merge for ${targetSettingsPath}; existing deny is not an array.`);
        }
      }
    }
  }

  if (sourceSettings.sandbox !== undefined && existing.sandbox === undefined) {
    existing.sandbox = sourceSettings.sandbox;
    patch.addedSandbox = true;
    patch.changed = true;
  }

  if (sourceSettings.hooks !== undefined && existing.hooks === undefined) {
    existing.hooks = sourceSettings.hooks;
    patch.addedHooks = true;
    patch.changed = true;
  }

  if (patch.changed) {
    if (typeof onBeforeWrite === 'function') {
      onBeforeWrite();
    }
    writeJsonFile(targetSettingsPath, existing);
  }

  return patch;
}

function mergeSettingsPatches(existingPatch, currentPatch) {
  const base = {
    createdFile: false,
    skipped: false,
    changed: false,
    addedPermissionsObject: false,
    addedPermissionDefaultMode: false,
    addedPermissionAllow: [],
    addedPermissionDeny: [],
    addedSandbox: false,
    addedHooks: false,
  };

  const prior = isObject(existingPatch) ? existingPatch : {};
  const next = isObject(currentPatch) ? currentPatch : {};

  const allow = new Set([
    ...(Array.isArray(prior.addedPermissionAllow) ? prior.addedPermissionAllow : []),
    ...(Array.isArray(next.addedPermissionAllow) ? next.addedPermissionAllow : []),
  ]);

  const deny = new Set([
    ...(Array.isArray(prior.addedPermissionDeny) ? prior.addedPermissionDeny : []),
    ...(Array.isArray(next.addedPermissionDeny) ? next.addedPermissionDeny : []),
  ]);

  return {
    ...base,
    ...prior,
    ...next,
    createdFile: Boolean(prior.createdFile || next.createdFile),
    skipped: Boolean(prior.skipped || next.skipped),
    changed: Boolean(prior.changed || next.changed),
    addedPermissionsObject: Boolean(prior.addedPermissionsObject || next.addedPermissionsObject),
    addedPermissionDefaultMode: Boolean(prior.addedPermissionDefaultMode || next.addedPermissionDefaultMode),
    addedPermissionAllow: [...allow],
    addedPermissionDeny: [...deny],
    addedSandbox: Boolean(prior.addedSandbox || next.addedSandbox),
    addedHooks: Boolean(prior.addedHooks || next.addedHooks),
  };
}

function revertInstallerSettings(targetSettingsPath, settingsPatch, sourceSettings, onBeforeMutate) {
  if (!settingsPatch) {
    return { changed: false, removedFile: false };
  }

  if (!fs.existsSync(targetSettingsPath)) {
    return { changed: false, removedFile: false };
  }

  if (settingsPatch.createdFile) {
    if (typeof onBeforeMutate === 'function') {
      onBeforeMutate();
    }
    fs.unlinkSync(targetSettingsPath);
    return { changed: true, removedFile: true };
  }

  const existing = readJsonFile(targetSettingsPath, `existing settings at ${targetSettingsPath}`);
  if (!existing || !isObject(existing)) {
    warning(`Could not revert settings changes for ${targetSettingsPath}; invalid JSON.`);
    return { changed: false, removedFile: false };
  }

  const sourcePermissions = isObject(sourceSettings && sourceSettings.permissions)
    ? sourceSettings.permissions
    : null;

  let changed = false;

  if (isObject(existing.permissions)) {
    if (Array.isArray(existing.permissions.allow) && Array.isArray(settingsPatch.addedPermissionAllow)) {
      for (const item of settingsPatch.addedPermissionAllow) {
        if (!existing.permissions.allow.includes(item)) {
          continue;
        }
        if (sourcePermissions && Array.isArray(sourcePermissions.allow) && !sourcePermissions.allow.includes(item)) {
          continue;
        }
        existing.permissions.allow = existing.permissions.allow.filter(v => v !== item);
        changed = true;
      }
      if (existing.permissions.allow.length === 0) {
        delete existing.permissions.allow;
        changed = true;
      }
    }

    if (Array.isArray(existing.permissions.deny) && Array.isArray(settingsPatch.addedPermissionDeny)) {
      for (const item of settingsPatch.addedPermissionDeny) {
        if (!existing.permissions.deny.includes(item)) {
          continue;
        }
        if (sourcePermissions && Array.isArray(sourcePermissions.deny) && !sourcePermissions.deny.includes(item)) {
          continue;
        }
        existing.permissions.deny = existing.permissions.deny.filter(v => v !== item);
        changed = true;
      }
      if (existing.permissions.deny.length === 0) {
        delete existing.permissions.deny;
        changed = true;
      }
    }

    if (
      settingsPatch.addedPermissionDefaultMode &&
      sourcePermissions &&
      sourcePermissions.defaultMode !== undefined &&
      existing.permissions.defaultMode === sourcePermissions.defaultMode
    ) {
      delete existing.permissions.defaultMode;
      changed = true;
    }

    if (settingsPatch.addedPermissionsObject && Object.keys(existing.permissions).length === 0) {
      delete existing.permissions;
      changed = true;
    }
  }

  if (
    settingsPatch.addedSandbox &&
    sourceSettings &&
    sourceSettings.sandbox !== undefined &&
    existing.sandbox !== undefined
  ) {
    if (deepEqual(existing.sandbox, sourceSettings.sandbox)) {
      delete existing.sandbox;
      changed = true;
    } else {
      warning(`Keeping modified sandbox settings in ${targetSettingsPath}; values differ from installer defaults.`);
    }
  }

  if (
    settingsPatch.addedHooks &&
    sourceSettings &&
    sourceSettings.hooks !== undefined &&
    existing.hooks !== undefined
  ) {
    if (deepEqual(existing.hooks, sourceSettings.hooks)) {
      delete existing.hooks;
      changed = true;
    } else {
      warning(`Keeping modified hooks in ${targetSettingsPath}; values differ from installer defaults.`);
    }
  }

  if (changed) {
    if (typeof onBeforeMutate === 'function') {
      onBeforeMutate();
    }
    writeJsonFile(targetSettingsPath, existing);
  }

  return { changed, removedFile: false };
}

function writeManifest(manifestPath, manifest) {
  writeJsonFile(manifestPath, manifest);
}

function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  const manifest = readJsonFile(manifestPath, `manifest at ${manifestPath}`);
  if (!manifest || !isObject(manifest)) {
    return null;
  }
  return manifest;
}

function removeIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  fs.unlinkSync(filePath);
  return true;
}

function pruneEmptyDirectories(directories, stopAtDirectory) {
  const sorted = [...directories].sort((a, b) => b.length - a.length);
  let prunedCount = 0;

  for (const dirPath of sorted) {
    if (!fs.existsSync(dirPath)) {
      continue;
    }
    if (path.resolve(dirPath) === path.resolve(stopAtDirectory)) {
      continue;
    }

    try {
      const entries = fs.readdirSync(dirPath);
      if (entries.length === 0) {
        fs.rmdirSync(dirPath);
        prunedCount += 1;
      }
    } catch {
      // ignore pruning errors
    }
  }

  return prunedCount;
}

function verifyInstallation(claudeDir, scope) {
  try {
    const requiredDirs = ['agents', 'skills'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(claudeDir, dir);
      if (!fs.existsSync(dirPath)) {
        error(`Missing required directory '${dir}' in ${scope} installation.`);
        return false;
      }
    }

    const agentDir = path.join(claudeDir, 'agents');
    const agents = fs.readdirSync(agentDir).filter(file => file.endsWith('.md'));
    if (agents.length === 0) {
      error(`No agent files found in ${agentDir}`);
      return false;
    }

    return true;
  } catch (err) {
    error(`Installation verification failed: ${err.message}`);
    return false;
  }
}

function legacySettingsCleanup(settingsPath, sourceSettings, onBeforeMutate) {
  if (!fs.existsSync(settingsPath)) {
    return { changed: false, removedFile: false };
  }

  const existing = readJsonFile(settingsPath, `existing settings at ${settingsPath}`);
  if (!existing || !isObject(existing)) {
    warning(`Skipping legacy settings cleanup; invalid JSON at ${settingsPath}.`);
    return { changed: false, removedFile: false };
  }

  if (sourceSettings && deepEqual(existing, sourceSettings)) {
    if (typeof onBeforeMutate === 'function') {
      onBeforeMutate();
    }
    fs.unlinkSync(settingsPath);
    return { changed: true, removedFile: true };
  }

  let changed = false;
  if (
    sourceSettings &&
    isObject(sourceSettings.permissions) &&
    isObject(existing.permissions)
  ) {
    if (Array.isArray(sourceSettings.permissions.allow) && Array.isArray(existing.permissions.allow)) {
      for (const item of sourceSettings.permissions.allow) {
        if (existing.permissions.allow.includes(item)) {
          existing.permissions.allow = existing.permissions.allow.filter(v => v !== item);
          changed = true;
        }
      }
      if (existing.permissions.allow.length === 0) {
        delete existing.permissions.allow;
      }
    }

    if (Array.isArray(sourceSettings.permissions.deny) && Array.isArray(existing.permissions.deny)) {
      for (const item of sourceSettings.permissions.deny) {
        if (existing.permissions.deny.includes(item)) {
          existing.permissions.deny = existing.permissions.deny.filter(v => v !== item);
          changed = true;
        }
      }
      if (existing.permissions.deny.length === 0) {
        delete existing.permissions.deny;
      }
    }

    if (
      sourceSettings.permissions.defaultMode !== undefined &&
      existing.permissions.defaultMode === sourceSettings.permissions.defaultMode
    ) {
      delete existing.permissions.defaultMode;
      changed = true;
    }
  }

  if (changed) {
    if (typeof onBeforeMutate === 'function') {
      onBeforeMutate();
    }
    writeJsonFile(settingsPath, existing);
  }

  return { changed, removedFile: false };
}

function loadSourceSettings(sourceDir) {
  const sourceSettingsPath = path.join(sourceDir, '.claude', 'settings.json');
  if (!fs.existsSync(sourceSettingsPath)) {
    return null;
  }
  const sourceSettings = readJsonFile(sourceSettingsPath, 'package .claude/settings.json');
  if (!sourceSettings || !isObject(sourceSettings)) {
    error('Could not parse package .claude/settings.json.');
    process.exit(1);
  }
  return sourceSettings;
}

function detectInstallState(scope, projectDir, sourceSettings) {
  return detectInstallStateCore(getScopePaths(scope, projectDir), sourceSettings);
}

function installScope(options) {
  const {
    sourceSettings,
    sourceClaudeDir,
    sourceManagedFiles,
    sourceVersion,
    operation,
    scope,
    projectDir,
    languages,
  } = options;

  const paths = getScopePaths(scope, projectDir);
  const existingManifest = readManifest(paths.manifestPath);

  if (scope === 'project' && !fs.existsSync(paths.rootDir)) {
    error(`Project directory does not exist: ${paths.rootDir}`);
    return false;
  }

  ensureDir(paths.claudeDir);
  info(`Installing ${PACKAGE_NAME} (${scope}) at ${paths.rootDir}`);

  const backupSession = createBackupSession(paths, operation || 'install');

  const treeResult = installManagedTree(sourceClaudeDir, sourceManagedFiles, paths.claudeDir, scope, backupSession);
  success(`✓ Installed/updated ${treeResult.copiedCount} file(s); ${treeResult.skippedCount} unchanged`);

  if (languages) {
    filterSkills(paths.claudeDir, languages);
  }

  let settingsBackedUp = false;
  const backupSettingsBeforeWrite = () => {
    if (settingsBackedUp || !fs.existsSync(paths.settingsPath)) {
      return;
    }
    if (backupSession.backupFile(paths.settingsPath, scope === 'global' ? 'settings.json' : '.claude/settings.json')) {
      settingsBackedUp = true;
    }
  };

  const settingsPatch = mergeInstallerSettings(paths.settingsPath, sourceSettings, backupSettingsBeforeWrite);
  if (settingsPatch.skipped) {
    warning('Settings merge skipped due to invalid existing JSON or missing source settings; continuing with agent files only.');
  } else if (settingsPatch.createdFile) {
    success(`✓ Created settings: ${paths.settingsPath}`);
  } else if (settingsPatch.changed) {
    success(`✓ Updated settings safely: ${paths.settingsPath}`);
  } else {
    info(`No settings changes needed in ${paths.settingsPath}`);
  }

  if (fs.existsSync(paths.versionPath)) {
    backupSession.backupFile(paths.versionPath, path.relative(paths.rootDir, paths.versionPath));
  }
  fs.writeFileSync(paths.versionPath, `${sourceVersion || 'unknown'}\n`);

  let managedFiles = buildManagedFilesFromSource(scope, sourceManagedFiles, paths);

  if (scope === 'project') {
    const sourceClaudeMd = path.join(path.dirname(sourceClaudeDir), 'CLAUDE.md');
    const hadManagedClaudeMd = Boolean(
      existingManifest && Array.isArray(existingManifest.managedFiles) && existingManifest.managedFiles.includes('CLAUDE.md')
    );

    if (!fs.existsSync(paths.claudeMdPath) && fs.existsSync(sourceClaudeMd)) {
      fs.copyFileSync(sourceClaudeMd, paths.claudeMdPath);
      success('✓ Installed CLAUDE.md');
      managedFiles.push('CLAUDE.md');
    } else if (hadManagedClaudeMd && fs.existsSync(paths.claudeMdPath)) {
      managedFiles.push('CLAUDE.md');
    }
  }

  managedFiles = [...new Set(managedFiles)];

  const manifest = {
    schemaVersion: 1,
    package: PACKAGE_NAME,
    scope,
    rootDir: paths.rootDir,
    sourceVersion: sourceVersion || 'unknown',
    updatedAt: new Date().toISOString(),
    managedFiles,
    settingsPatch,
  };

  const effectiveSettingsPatch = mergeSettingsPatches(existingManifest ? existingManifest.settingsPatch : null, settingsPatch);

  if (existingManifest && existingManifest.installedAt) {
    manifest.installedAt = existingManifest.installedAt;
  } else {
    manifest.installedAt = manifest.updatedAt;
  }
  manifest.settingsPatch = effectiveSettingsPatch;

  if (fs.existsSync(paths.manifestPath)) {
    backupSession.backupFile(paths.manifestPath, path.relative(paths.rootDir, paths.manifestPath));
  }
  writeManifest(paths.manifestPath, manifest);

  const backupResult = backupSession.finalize();
  if (backupResult.created) {
    info(`Backup saved: ${backupResult.backupDir} (${backupResult.count} file(s))`);
    printBackupRestoreHint(backupResult);
    if (backupResult.prunedCount > 0) {
      info(`Pruned ${backupResult.prunedCount} old backup session(s) by retention policy.`);
    }
  }

  if (treeResult.backupCount > 0) {
    info(`Backed up ${treeResult.backupCount} overwritten managed file(s).`);
  }

  if (!verifyInstallation(paths.claudeDir, scope)) {
    error(`❌ ${scope} installation verification failed.`);
    return false;
  }

  success(`✅ ${scope} installation completed successfully.`);
  info(`Manifest: ${paths.manifestPath}`);
  return true;
}

function uninstallScope(options) {
  const {
    sourceSettings,
    sourceManagedFiles,
    scope,
    projectDir,
  } = options;

  const paths = getScopePaths(scope, projectDir);
  const manifest = readManifest(paths.manifestPath);

  let removedFiles = 0;
  let prunedDirs = 0;
  let settingsChanged = false;
  let removedSettingsFile = false;
  const touchedDirectories = new Set();
  const backupSession = createBackupSession(paths, 'uninstall');
  let settingsBackedUp = false;

  const backupSettingsBeforeMutate = () => {
    if (settingsBackedUp || !fs.existsSync(paths.settingsPath)) {
      return;
    }
    if (backupSession.backupFile(paths.settingsPath, scope === 'global' ? 'settings.json' : '.claude/settings.json')) {
      settingsBackedUp = true;
    }
  };

  const removeManagedFile = (absolutePath, relativePathFromRoot) => {
    if (!fs.existsSync(absolutePath)) {
      return;
    }
    backupSession.backupFile(absolutePath, relativePathFromRoot || path.relative(paths.rootDir, absolutePath));
    fs.unlinkSync(absolutePath);
    removedFiles += 1;
    touchedDirectories.add(path.dirname(absolutePath));
  };

  if (manifest && Array.isArray(manifest.managedFiles)) {
    info(`Using manifest uninstall for ${scope} scope.`);

    for (const managedPath of manifest.managedFiles) {
      const absolutePath = path.join(paths.rootDir, managedPath);
      removeManagedFile(absolutePath, managedPath);
    }

    const revertResult = revertInstallerSettings(paths.settingsPath, manifest.settingsPatch, sourceSettings, backupSettingsBeforeMutate);
    settingsChanged = revertResult.changed;
    removedSettingsFile = revertResult.removedFile;

    if (fs.existsSync(paths.versionPath)) {
      backupSession.backupFile(paths.versionPath, path.relative(paths.rootDir, paths.versionPath));
    }
    if (removeIfExists(paths.versionPath)) {
      removedFiles += 1;
    }
    if (fs.existsSync(paths.manifestPath)) {
      backupSession.backupFile(paths.manifestPath, path.relative(paths.rootDir, paths.manifestPath));
    }
    if (removeIfExists(paths.manifestPath)) {
      removedFiles += 1;
      touchedDirectories.add(path.dirname(paths.manifestPath));
    }
  } else {
    warning(`No install manifest found for ${scope}. Attempting safe legacy cleanup.`);

    const legacyManagedFiles = sourceManagedFiles.map(relative => toManagedPath(scope, relative));

    for (const legacyManagedPath of legacyManagedFiles) {
      const absolutePath = path.join(paths.rootDir, legacyManagedPath);
      removeManagedFile(absolutePath, legacyManagedPath);
    }

    const legacySettingsResult = legacySettingsCleanup(paths.settingsPath, sourceSettings, backupSettingsBeforeMutate);
    settingsChanged = legacySettingsResult.changed;
    removedSettingsFile = legacySettingsResult.removedFile;

    if (scope === 'project' && fs.existsSync(paths.claudeMdPath)) {
      info('Leaving existing CLAUDE.md untouched during legacy cleanup (non-manifest path).');
    }

    if (fs.existsSync(paths.versionPath)) {
      backupSession.backupFile(paths.versionPath, path.relative(paths.rootDir, paths.versionPath));
    }
    if (removeIfExists(paths.versionPath)) {
      removedFiles += 1;
    }
  }

  prunedDirs += pruneEmptyDirectories(touchedDirectories, paths.rootDir);

  if (scope === 'project' && fs.existsSync(paths.claudeDir)) {
    try {
      const entries = fs.readdirSync(paths.claudeDir);
      if (entries.length === 0) {
        fs.rmdirSync(paths.claudeDir);
        prunedDirs += 1;
      }
    } catch {
      // ignore
    }
  }

  if (removedFiles === 0 && !settingsChanged && !removedSettingsFile) {
    warning(`No ${PACKAGE_NAME} installation artifacts found for ${scope} scope at ${paths.rootDir}.`);
    return true;
  }

  const backupResult = backupSession.finalize();
  if (backupResult.created) {
    info(`Backup saved: ${backupResult.backupDir} (${backupResult.count} file(s))`);
    printBackupRestoreHint(backupResult);
    if (backupResult.prunedCount > 0) {
      info(`Pruned ${backupResult.prunedCount} old backup session(s) by retention policy.`);
    }
  }

  if (removedSettingsFile) {
    success(`✅ Removed settings file: ${paths.settingsPath}`);
  } else if (settingsChanged) {
    success(`✅ Reverted installer-managed settings entries in: ${paths.settingsPath}`);
  }

  success(`✅ Removed ${removedFiles} managed file(s) for ${scope} scope.`);
  if (prunedDirs > 0) {
    info(`Pruned ${prunedDirs} empty directory(ies).`);
  }

  return true;
}

function isInstalled(scope, projectDir, sourceSettings) {
  return detectInstallState(scope, projectDir, sourceSettings).installed;
}

function showStatus(sourceSettings) {
  const globalState = detectInstallState('global', undefined, sourceSettings);
  const projectState = detectInstallState('project', process.cwd(), sourceSettings);

  console.log('Claude Agents installation status:\n');
  console.log(`- Global (~/.claude): ${globalState.installed ? 'installed' : 'not installed'}${globalState.installed ? ` (${globalState.reason})` : ''}`);
  console.log(`- Project (${process.cwd()}): ${projectState.installed ? 'installed' : 'not installed'}${projectState.installed ? ` (${projectState.reason})` : ''}`);
  console.log('\nConfig precedence reminder: project settings override global settings.');
}

const SKILL_MAP = {
  dotnet: 'dotnet',
  python: 'python',
  typescript: 'typescript',
  flutter: 'flutter',
  go: 'go',
  java: 'java-spring',
  node: 'node-express',
  react: 'react-next',
  ruby: 'ruby-rails',
  rust: 'rust',
  sql: 'sql-migrations',
};

const LANGUAGE_SKILLS = new Set(Object.values(SKILL_MAP));

const ALWAYS_KEEP_SKILLS = new Set([
  'blogger',
  'brutal-critic',
  'docs-validation',
  'agent-diagnostics',
  'project-bootstrap',
]);

function filterSkills(claudeDir, languages) {
  const skillsDir = path.join(claudeDir, 'skills');
  if (!fs.existsSync(skillsDir)) {
    warning('No skills directory found — skipping language filter.');
    return;
  }

  const validLanguages = Object.keys(SKILL_MAP);
  const requested = languages
    .split(',')
    .map(l => l.trim().toLowerCase())
    .filter(Boolean);

  const invalid = requested.filter(l => !validLanguages.includes(l));
  if (invalid.length > 0) {
    warning(`Unknown language(s): ${invalid.join(', ')}`);
    info(`Available: ${validLanguages.join(', ')}`);
  }

  const valid = requested.filter(l => validLanguages.includes(l));
  if (valid.length === 0) {
    warning('No valid languages specified — keeping all skills.');
    return;
  }

  const keep = new Set(ALWAYS_KEEP_SKILLS);
  for (const lang of valid) {
    keep.add(SKILL_MAP[lang]);
  }

  const entries = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  let removed = 0;
  for (const entry of entries) {
    if (LANGUAGE_SKILLS.has(entry.name) && !keep.has(entry.name)) {
      fs.rmSync(path.join(skillsDir, entry.name), { recursive: true, force: true });
      removed += 1;
    }
  }

  success(`✓ Applied language filter: ${valid.join(', ')}`);
  if (removed > 0) {
    info(`Removed ${removed} language skill folder(s).`);
  }
}

function main() {
  const sourceDir = __dirname;
  const sourceClaudeDir = path.join(sourceDir, '.claude');
  let parsed;

  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    error(err.message);
    showUsage(1);
    return;
  }

  if (parsed.help || process.argv.slice(2).length === 0) {
    showUsage(0);
    return;
  }

  if (parsed.version) {
    showVersion(sourceDir);
    return;
  }

  if (!validatePackageContents(sourceDir)) {
    process.exit(1);
  }

  const sourceManagedFiles = getManagedSourceFiles(sourceClaudeDir);
  const sourceSettings = loadSourceSettings(sourceDir);

  if (parsed.status) {
    showStatus(sourceSettings);
    return;
  }

  if (parsed.uninstall && parsed.update) {
    error('Cannot combine --uninstall and --update.');
    process.exit(1);
  }

  if (parsed.uninstall) {
    if (parsed.languages) {
      warning('--languages is ignored during uninstall.');
    }

    const scopes = getRequestedScopes(parsed, 'uninstall', scope => isInstalled(scope, scope === 'project' ? process.cwd() : undefined, sourceSettings));
    for (const scope of scopes) {
      const projectDir = scope === 'project' ? (parsed.project || process.cwd()) : null;
      info(`Uninstalling ${PACKAGE_NAME} from ${scope} scope...`);
      const ok = uninstallScope({
        sourceSettings,
        sourceManagedFiles,
        scope,
        projectDir,
      });
      if (!ok) {
        process.exit(1);
      }
    }

    success('Uninstallation completed!');
    return;
  }

  if (parsed.update) {
    const version = checkVersion(sourceDir);
    const scopes = getRequestedScopes(parsed, 'update', scope => isInstalled(scope, scope === 'project' ? process.cwd() : undefined, sourceSettings));

    if (scopes.length === 0) {
      error('No existing installation found. Use --global or --project to install first.');
      process.exit(1);
    }

    info('🔄 Updating Claude Agents installation...');
    if (version) {
      info(`📦 Updating to version ${version}`);
    }

    for (const scope of scopes) {
      const projectDir = scope === 'project' ? (parsed.project || process.cwd()) : null;
      const ok = installScope({
        sourceSettings,
        sourceClaudeDir,
        sourceManagedFiles,
        sourceVersion: version,
        operation: 'update',
        scope,
        projectDir,
        languages: parsed.languages,
      });
      if (!ok) {
        process.exit(1);
      }
    }

    success('Update completed!');
    return;
  }

  if (parsed.global && parsed.project !== null) {
    error('Choose one install target: --global or --project (not both).');
    process.exit(1);
  }

  if (!parsed.global && parsed.project === null) {
    error('Install target required: use --global or --project [DIR].');
    showUsage(1);
    return;
  }

  const version = checkVersion(sourceDir);
  info('🚀 Starting Claude Agents installation...');
  if (version) {
    info(`📦 Installing version ${version}`);
  }

  if (parsed.global) {
    const ok = installScope({
      sourceSettings,
      sourceClaudeDir,
      sourceManagedFiles,
      sourceVersion: version,
      operation: 'install',
      scope: 'global',
      projectDir: null,
      languages: parsed.languages,
    });
    if (!ok) {
      process.exit(1);
    }
  } else {
    const ok = installScope({
      sourceSettings,
      sourceClaudeDir,
      sourceManagedFiles,
      sourceVersion: version,
      operation: 'install',
      scope: 'project',
      projectDir: parsed.project || process.cwd(),
      languages: parsed.languages,
    });
    if (!ok) {
      process.exit(1);
    }
  }

  info('\n🎯 Next steps:');
  info("1. Run 'claude' to start using the agents");
  info("2. Use /agents to inspect available subagents");
  info("3. Try: @orchestrator Plan and implement a small feature");
  info('\n📚 Documentation: https://github.com/shahboura/agents-claude');
}

if (require.main === module) {
  main();
}
