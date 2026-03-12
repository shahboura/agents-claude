#!/usr/bin/env node

/**
 * Claude Agents Installation Script
 * Cross-platform installer for Windows, Linux, and macOS
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    ensureDir(dest);
    const files = fs.readdirSync(src);
    files.forEach(file => {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

function getGlobalClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

function validatePackageContents(sourceDir) {
  const claudeDir = path.join(sourceDir, '.claude');
  const claudeMd = path.join(sourceDir, 'CLAUDE.md');
  if (!fs.existsSync(claudeDir)) {
    error('Invalid repository structure. Missing .claude directory.');
    return false;
  }
  if (!fs.existsSync(claudeMd)) {
    warning('CLAUDE.md not found in repository root; continuing.');
  }
  return true;
}

function verifyInstallation(projectDir) {
  const claudeDir = path.join(projectDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    error('Missing .claude directory after installation.');
    return false;
  }

  const requiredDirs = ['agents', 'skills'];
  for (const d of requiredDirs) {
    if (!fs.existsSync(path.join(claudeDir, d))) {
      error(`Missing required directory: .claude/${d}`);
      return false;
    }
  }

  const settingsPath = path.join(claudeDir, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    warning('Missing .claude/settings.json (recommended).');
  }

  return true;
}

function checkVersion(sourceDir) {
  try {
    const packagePath = path.join(sourceDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const version = packageData.version;
      info(`Installing Claude Agents v${version}`);
      return version;
    }
  } catch {
    // ignore
  }
  return null;
}

function backupIfExists(targetDir) {
  if (fs.existsSync(targetDir)) {
    const backupDir = `${targetDir}.backup.${Date.now()}`;
    try {
      fs.renameSync(targetDir, backupDir);
      info(`Backed up existing installation to ${backupDir}`);
    } catch (err) {
      warning(`Could not backup existing installation: ${err.message}`);
    }
  }
}

function installGlobal(sourceDir) {
  info('Installing globally into ~/.claude ...');

  const globalClaudeDir = getGlobalClaudeDir();
  ensureDir(globalClaudeDir);

  const sourceClaudeDir = path.join(sourceDir, '.claude');
  if (fs.existsSync(sourceClaudeDir)) {
    const targetClaudeDir = path.join(globalClaudeDir);
    backupIfExists(path.join(globalClaudeDir, 'agents'));
    backupIfExists(path.join(globalClaudeDir, 'skills'));
    backupIfExists(path.join(globalClaudeDir, 'rules'));
    backupIfExists(path.join(globalClaudeDir, 'hooks'));

    copyRecursive(path.join(sourceClaudeDir, 'agents'), path.join(targetClaudeDir, 'agents'));
    copyRecursive(path.join(sourceClaudeDir, 'skills'), path.join(targetClaudeDir, 'skills'));
    copyRecursive(path.join(sourceClaudeDir, 'rules'), path.join(targetClaudeDir, 'rules'));
    copyRecursive(path.join(sourceClaudeDir, 'hooks'), path.join(targetClaudeDir, 'hooks'));

    const sourceSettings = path.join(sourceClaudeDir, 'settings.json');
    const targetSettings = path.join(targetClaudeDir, 'settings.json');
    if (fs.existsSync(sourceSettings)) {
      if (fs.existsSync(targetSettings)) {
        const recommended = `${targetSettings}.recommended.${Date.now()}`;
        fs.copyFileSync(sourceSettings, recommended);
        warning(`Existing global settings preserved. New recommended settings written to ${recommended}`);
      } else {
        fs.copyFileSync(sourceSettings, targetSettings);
        success('✓ Installed global settings.json');
      }
    }

    const sourceSettingsExample = path.join(sourceClaudeDir, 'settings.local.example.json');
    const targetSettingsExample = path.join(targetClaudeDir, 'settings.local.example.json');
    if (fs.existsSync(sourceSettingsExample) && !fs.existsSync(targetSettingsExample)) {
      fs.copyFileSync(sourceSettingsExample, targetSettingsExample);
    }

    success('✅ Global Claude installation completed successfully!');
    info(`Installed into: ${globalClaudeDir}`);
    return true;
  }

  error('Missing .claude directory in package contents.');
  return false;
}

function installProject(sourceDir, projectDir) {
  info(`Installing for project: ${projectDir}`);

  if (!fs.existsSync(projectDir)) {
    error(`Project directory does not exist: ${projectDir}`);
    return false;
  }

  const sourceClaudeDir = path.join(sourceDir, '.claude');
  const sourceClaudeMd = path.join(sourceDir, 'CLAUDE.md');
  const targetClaudeDir = path.join(projectDir, '.claude');
  const targetClaudeMd = path.join(projectDir, 'CLAUDE.md');

  ensureDir(targetClaudeDir);

  copyRecursive(path.join(sourceClaudeDir, 'agents'), path.join(targetClaudeDir, 'agents'));
  copyRecursive(path.join(sourceClaudeDir, 'skills'), path.join(targetClaudeDir, 'skills'));
  copyRecursive(path.join(sourceClaudeDir, 'rules'), path.join(targetClaudeDir, 'rules'));
  copyRecursive(path.join(sourceClaudeDir, 'hooks'), path.join(targetClaudeDir, 'hooks'));

  const sourceSettings = path.join(sourceClaudeDir, 'settings.json');
  const targetSettings = path.join(targetClaudeDir, 'settings.json');
  if (fs.existsSync(sourceSettings)) {
    if (fs.existsSync(targetSettings)) {
      const recommended = `${targetSettings}.recommended.${Date.now()}`;
      fs.copyFileSync(sourceSettings, recommended);
      warning(`Existing project settings preserved. New recommended settings written to ${recommended}`);
    } else {
      fs.copyFileSync(sourceSettings, targetSettings);
      success('✓ Installed project settings.json');
    }
  }

  const sourceSettingsExample = path.join(sourceClaudeDir, 'settings.local.example.json');
  const targetSettingsExample = path.join(targetClaudeDir, 'settings.local.example.json');
  if (fs.existsSync(sourceSettingsExample) && !fs.existsSync(targetSettingsExample)) {
    fs.copyFileSync(sourceSettingsExample, targetSettingsExample);
  }

  if (fs.existsSync(sourceClaudeMd) && !fs.existsSync(targetClaudeMd)) {
    fs.copyFileSync(sourceClaudeMd, targetClaudeMd);
    success('✓ Installed CLAUDE.md');
  }

  if (!verifyInstallation(projectDir)) {
    error('❌ Project installation verification failed.');
    return false;
  }

  success('✅ Project Claude installation completed successfully!');
  info(`Configured for: ${projectDir}`);
  return true;
}

function uninstall() {
  info('Uninstalling Claude agents from current directory...');

  const currentDir = process.cwd();
  const claudeDir = path.join(currentDir, '.claude');
  const claudeMd = path.join(currentDir, 'CLAUDE.md');

  let found = false;
  try {
    if (fs.existsSync(claudeMd)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      fs.renameSync(claudeMd, path.join(currentDir, `CLAUDE.${timestamp}.bk.md`));
      success('✅ Backed up CLAUDE.md');
      found = true;
    }

    if (fs.existsSync(claudeDir)) {
      fs.rmSync(claudeDir, { recursive: true, force: true });
      success('✅ Removed .claude directory');
      found = true;
    }

    if (!found) {
      warning('No Claude installation found in current directory.');
      return false;
    }

    success('✅ Uninstall completed successfully!');
    return true;
  } catch (err) {
    error(`❌ Failed to uninstall: ${err.message}`);
    return false;
  }
}

function uninstallGlobal() {
  info('Uninstalling Claude agents from global ~/.claude ...');

  const root = getGlobalClaudeDir();
  const targets = ['agents', 'skills', 'rules', 'hooks'];
  let removedAny = false;

  for (const name of targets) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      const backup = `${p}.backup.${Date.now()}`;
      try {
        fs.renameSync(p, backup);
        success(`✅ Backed up and removed ${p}`);
        removedAny = true;
      } catch (err) {
        warning(`Could not remove ${p}: ${err.message}`);
      }
    }
  }

  const settingsPath = path.join(root, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    warning('Global settings.json was left in place intentionally. Remove it manually if desired.');
  }

  if (!removedAny) {
    warning('No global Claude agent installation folders found under ~/.claude.');
    return false;
  }

  success('✅ Global uninstall completed.');
  return true;
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
  if (!fs.existsSync(skillsDir)) return;

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
  for (const lang of valid) keep.add(SKILL_MAP[lang]);

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(e => e.isDirectory());
  for (const entry of entries) {
    if (LANGUAGE_SKILLS.has(entry.name) && !keep.has(entry.name)) {
      fs.rmSync(path.join(skillsDir, entry.name), { recursive: true, force: true });
    }
  }

  success(`✓ Filtered skills for: ${valid.join(', ')}`);
}

function showVersion(sourceDir) {
  try {
    const packagePath = path.join(sourceDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log(`Claude Agents v${packageData.version}`);
      console.log('Repository: https://github.com/shahboura/agents-claude');
      return;
    }
  } catch {
    // ignore
  }
  console.log('Claude Agents (version unknown)');
}

function showUsage(exitCode = 0) {
  console.log(`
🤖 Claude Agents Installation Script

USAGE:
  node install.js [OPTIONS]

OPTIONS:
  -g, --global                Install globally to ~/.claude
  -p, --project DIR           Install for a specific project directory
  -U, --update                Update existing installation
  -l, --languages LANGS       Keep language skills only (comma-separated)
                              Available: dotnet,python,typescript,flutter,go,java,node,react,ruby,rust,sql
  -u, --uninstall             Remove from current directory
      --uninstall --global    Remove global Claude folders from ~/.claude (keeps settings.json)
  -v, --version               Show version information
  -h, --help                  Show this help message

EXAMPLES:
  node install.js --global
  node install.js --project .
  node install.js --global --languages python,typescript
  node install.js --update
  node install.js --uninstall
  node install.js --uninstall --global
  npx agents-claude --global

PREREQUISITES:
  - Node.js

NOTES:
  - npx/npm install downloads a published package version
  - Git is not required

INSTALL LOCATIONS:
  Global: ~/.claude/
  Project: ./.claude/ and ./CLAUDE.md

Documentation: https://github.com/shahboura/agents-claude
`);
  process.exit(exitCode);
}

function main() {
  let args = process.argv.slice(2);
  const sourceDir = __dirname;

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    showUsage(0);
  }

  if (args.includes('-u') || args.includes('--uninstall')) {
    if (args.includes('-g') || args.includes('--global')) {
      uninstallGlobal();
    } else {
      uninstall();
    }
    return;
  }

  let languages = null;
  const langIdx = args.findIndex(a => a === '-l' || a === '--languages');
  if (langIdx !== -1) {
    if (langIdx + 1 >= args.length) {
      error('--languages requires a comma-separated list.');
      process.exit(1);
    }
    languages = args[langIdx + 1];
    args.splice(langIdx, 2);
  }

  info('🚀 Starting Claude Agents installation...');
  checkVersion(sourceDir);
  if (!validatePackageContents(sourceDir)) process.exit(1);

  const hasUpdate = args.includes('-U') || args.includes('--update');
  const globalDir = getGlobalClaudeDir();
  const localDir = path.join(process.cwd(), '.claude');

  if (hasUpdate) {
    const hasGlobal = fs.existsSync(globalDir);
    const hasLocal = fs.existsSync(localDir);

    if (!hasGlobal && !hasLocal) {
      error('No existing installation found. Use --global or --project first.');
      process.exit(1);
    }

    if (hasGlobal) {
      installGlobal(sourceDir);
      if (languages) filterSkills(globalDir, languages);
    } else {
      installProject(sourceDir, process.cwd());
      if (languages) filterSkills(path.join(process.cwd(), '.claude'), languages);
    }
    return;
  }

  const command = args[0];
  switch (command) {
    case '-g':
    case '--global': {
      if (!installGlobal(sourceDir)) process.exit(1);
      if (languages) filterSkills(getGlobalClaudeDir(), languages);
      info("\n🎯 Next steps:");
      info("1. Run 'claude' to start using the agents");
      info("2. Use /agents to inspect available subagents");
      info("3. Try: @orchestrator Plan and implement a small feature");
      break;
    }
    case '-p':
    case '--project': {
      if (args.length < 2) {
        error('Project directory required');
        showUsage(1);
      }
      const projectPath = path.resolve(args[1]);
      if (!installProject(sourceDir, projectPath)) process.exit(1);
      if (languages) filterSkills(path.join(projectPath, '.claude'), languages);
      info("\n🎯 Next steps:");
      info(`1. cd ${projectPath}`);
      info("2. Run 'claude' to start using the agents");
      info("3. Use /agents and /memory to inspect configuration");
      break;
    }
    case '-v':
    case '--version':
      showVersion(sourceDir);
      break;
    default:
      error(`Unknown option: ${command}`);
      showUsage(1);
  }
}

if (require.main === module) {
  main();
}
