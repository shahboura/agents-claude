#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = process.cwd();
const installScript = path.join(repoRoot, 'install.js');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runInstaller(args, options = {}) {
  return execFileSync('node', [installScript, ...args], {
    cwd: options.cwd || repoRoot,
    env: { ...process.env, ...(options.env || {}) },
    encoding: 'utf8',
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function createDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function listProjectBackupSessions(projectDir) {
  const backupRoot = path.join(projectDir, '.claude', '.backups');
  if (!fs.existsSync(backupRoot)) {
    return [];
  }
  return fs
    .readdirSync(backupRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(backupRoot, entry.name))
    .sort();
}

function hasBackedUpFile(sessionDir, relativePath) {
  return fs.existsSync(path.join(sessionDir, relativePath));
}

function testNoopUninstallDoesNotBackupClaudeMd(tmpRoot) {
  const projectDir = path.join(tmpRoot, 'noop-project');
  createDir(projectDir);
  fs.writeFileSync(path.join(projectDir, 'CLAUDE.md'), '# local session\n');

  runInstaller(['--uninstall', '--project', '.'], { cwd: projectDir });

  assert(fs.existsSync(path.join(projectDir, 'CLAUDE.md')), 'CLAUDE.md should remain for no-op uninstall');
  assert(listProjectBackupSessions(projectDir).length === 0, 'No backup session should be created for no-op uninstall');
}

function testProjectInstallAndUninstall(tmpRoot) {
  const projectDir = path.join(tmpRoot, 'project-install');
  createDir(projectDir);

  runInstaller(['--project', '.'], { cwd: projectDir });

  const manifestPath = path.join(projectDir, '.claude', '.agents-claude-manifest.json');
  assert(fs.existsSync(manifestPath), 'Project manifest should exist after install');
  assert(fs.existsSync(path.join(projectDir, 'CLAUDE.md')), 'CLAUDE.md should be installed for project scope');

  runInstaller(['--uninstall', '--project', '.'], { cwd: projectDir });

  assert(!fs.existsSync(manifestPath), 'Project manifest should be removed after uninstall');
  assert(!fs.existsSync(path.join(projectDir, 'CLAUDE.md')), 'CLAUDE.md should be removed on manifest uninstall');

  const sessions = listProjectBackupSessions(projectDir);
  assert(sessions.length >= 1, 'Backup session should be created on real uninstall');

  const latestSession = sessions[sessions.length - 1];
  const sessionName = path.basename(latestSession);
  assert(
    /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}Z--uninstall--project(?:--\d{2})?$/.test(sessionName),
    'Backup session folder should be readable and sortable'
  );
  assert(hasBackedUpFile(latestSession, 'CLAUDE.md'), 'Backup session should include CLAUDE.md');
  assert(hasBackedUpFile(latestSession, 'backup-manifest.json'), 'Backup session should include backup-manifest.json');
}

function testPreexistingClaudeMdSurvivesUninstall(tmpRoot) {
  const projectDir = path.join(tmpRoot, 'preexisting-claude');
  createDir(projectDir);
  const claudeMdPath = path.join(projectDir, 'CLAUDE.md');
  const original = '# preexisting\nproject-owned instructions\n';
  fs.writeFileSync(claudeMdPath, original);

  runInstaller(['--project', '.'], { cwd: projectDir });

  const manifestPath = path.join(projectDir, '.claude', '.agents-claude-manifest.json');
  const manifest = readJson(manifestPath);
  assert(!manifest.managedFiles.includes('CLAUDE.md'), 'Preexisting CLAUDE.md should not be tracked as managed');

  runInstaller(['--uninstall', '--project', '.'], { cwd: projectDir });

  assert(fs.existsSync(claudeMdPath), 'Preexisting CLAUDE.md should survive uninstall');
  assert(fs.readFileSync(claudeMdPath, 'utf8') === original, 'Preexisting CLAUDE.md content should remain unchanged');
}

function testStatusDetectionUsesManifestAndVersion(tmpRoot) {
  const homeDir = path.join(tmpRoot, 'status-home');
  const projectDir = path.join(tmpRoot, 'status-project');
  createDir(homeDir);
  createDir(projectDir);

  const env = {
    HOME: homeDir,
    USERPROFILE: homeDir,
  };

  const initialStatus = runInstaller(['--status'], { cwd: projectDir, env });
  assert(initialStatus.includes('Global (~/.claude): not installed'), 'Initial global status should be not installed');
  assert(initialStatus.includes('Project ('), 'Status should include project line');
  assert(initialStatus.includes('not installed'), 'Initial project status should be not installed');

  runInstaller(['--global'], { cwd: projectDir, env });
  const globalStatus = runInstaller(['--status'], { cwd: projectDir, env });
  assert(globalStatus.includes('Global (~/.claude): installed (manifest)'), 'Global status should report manifest install');

  runInstaller(['--project', '.'], { cwd: projectDir, env });
  const bothStatus = runInstaller(['--status'], { cwd: projectDir, env });
  assert(bothStatus.includes('Project ('), 'Status should keep project line after install');
  assert(bothStatus.includes('installed (manifest)'), 'Project status should report manifest install');
}

function testVersionMarkerDetection(tmpRoot) {
  const homeDir = path.join(tmpRoot, 'version-home');
  const projectDir = path.join(tmpRoot, 'version-project');
  createDir(homeDir);
  createDir(projectDir);

  const env = {
    HOME: homeDir,
    USERPROFILE: homeDir,
  };

  runInstaller(['--global'], { cwd: projectDir, env });

  const globalManifestPath = path.join(homeDir, '.claude', '.agents-claude-manifest.json');
  const globalVersionPath = path.join(homeDir, '.claude', '.claude-agents-version');
  assert(fs.existsSync(globalManifestPath), 'Global manifest should exist after install for version-marker test');
  assert(fs.existsSync(globalVersionPath), 'Global version file should exist after install for version-marker test');

  fs.unlinkSync(globalManifestPath);

  const status = runInstaller(['--status'], { cwd: projectDir, env });
  assert(status.includes('Global (~/.claude): installed (version-marker)'), 'Global status should detect version-marker fallback');
}

function testSettingsMergePreservesUserData(tmpRoot) {
  const projectDir = path.join(tmpRoot, 'settings-merge');
  createDir(projectDir);
  createDir(path.join(projectDir, '.claude'));

  const settingsPath = path.join(projectDir, '.claude', 'settings.json');
  writeJson(settingsPath, {
    permissions: {
      allow: ['Read'],
      deny: ['Bash(ls)'],
    },
    sandbox: {
      enabled: false,
    },
  });

  runInstaller(['--project', '.'], { cwd: projectDir });

  const installedSettings = readJson(settingsPath);
  assert(installedSettings.permissions.allow.includes('Read'), 'Existing allow permissions should remain intact');
  assert(installedSettings.permissions.deny.includes('Bash(ls)'), 'Existing deny permissions should remain intact');
  assert(
    installedSettings.permissions.deny.includes('Bash(rm -rf *)'),
    'Installer deny defaults should be merged safely'
  );
  assert(installedSettings.sandbox.enabled === false, 'Existing sandbox settings should remain unchanged');

  runInstaller(['--uninstall', '--project', '.'], { cwd: projectDir });

  const revertedSettings = readJson(settingsPath);
  assert(revertedSettings.permissions.deny.includes('Bash(ls)'), 'User deny permissions should remain after uninstall');
  assert(
    !revertedSettings.permissions.deny.includes('Bash(rm -rf *)'),
    'Installer-added deny defaults should be removed on uninstall'
  );
}

function testGlobalAndProjectLifecycle(tmpRoot) {
  const homeDir = path.join(tmpRoot, 'home');
  const projectDir = path.join(tmpRoot, 'both-scopes');
  createDir(homeDir);
  createDir(projectDir);

  const env = {
    HOME: homeDir,
    USERPROFILE: homeDir,
  };

  const globalManifest = path.join(homeDir, '.claude', '.agents-claude-manifest.json');
  const projectManifest = path.join(projectDir, '.claude', '.agents-claude-manifest.json');

  runInstaller(['--global'], { cwd: projectDir, env });
  runInstaller(['--project', '.'], { cwd: projectDir, env });

  assert(fs.existsSync(globalManifest), 'Global manifest should exist after global install');
  assert(fs.existsSync(projectManifest), 'Project manifest should exist after project install');

  runInstaller(['--update'], { cwd: projectDir, env });
  runInstaller(['--uninstall', '--all'], { cwd: projectDir, env });

  assert(!fs.existsSync(globalManifest), 'Global manifest should be removed after uninstall --all');
  assert(!fs.existsSync(projectManifest), 'Project manifest should be removed after uninstall --all');
}

function main() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agents-claude-installer-'));

  try {
    console.log('Running installer lifecycle tests...');

    testNoopUninstallDoesNotBackupClaudeMd(tmpRoot);
    testProjectInstallAndUninstall(tmpRoot);
    testPreexistingClaudeMdSurvivesUninstall(tmpRoot);
    testSettingsMergePreservesUserData(tmpRoot);
    testGlobalAndProjectLifecycle(tmpRoot);
    testStatusDetectionUsesManifestAndVersion(tmpRoot);
    testVersionMarkerDetection(tmpRoot);

    console.log('✅ Installer lifecycle tests passed');
  } catch (err) {
    console.error('❌ Installer lifecycle tests failed');
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {
      // ignore cleanup failures
    }
  }
}

main();
