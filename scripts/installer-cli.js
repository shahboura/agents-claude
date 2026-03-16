'use strict';

function parseArgs(argv) {
  const parsed = {
    global: false,
    project: null,
    update: false,
    uninstall: false,
    all: false,
    languages: null,
    status: false,
    version: false,
    help: false,
  };

  const args = [...argv];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '-g':
      case '--global':
        parsed.global = true;
        break;
      case '-p':
      case '--project': {
        const next = args[i + 1];
        if (!next || next.startsWith('-')) {
          parsed.project = process.cwd();
        } else {
          parsed.project = next;
          i += 1;
        }
        break;
      }
      case '--all':
        parsed.all = true;
        break;
      case '-U':
      case '--update':
        parsed.update = true;
        break;
      case '-u':
      case '--uninstall':
        parsed.uninstall = true;
        break;
      case '-l':
      case '--languages': {
        const next = args[i + 1];
        if (!next || next.startsWith('-')) {
          throw new Error('--languages requires a comma-separated language list');
        }
        parsed.languages = next;
        i += 1;
        break;
      }
      case '--status':
        parsed.status = true;
        break;
      case '-v':
      case '--version':
        parsed.version = true;
        break;
      case '-h':
      case '--help':
        parsed.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}

function getRequestedScopes(parsed, mode, isInstalled) {
  const scopes = [];

  if (parsed.all) {
    scopes.push('global');
    scopes.push('project');
  } else {
    if (parsed.global) {
      scopes.push('global');
    }
    if (parsed.project !== null) {
      scopes.push('project');
    }
  }

  if (scopes.length === 0) {
    if (mode === 'uninstall') {
      return ['project'];
    }
    if (mode === 'update') {
      const inferred = [];
      if (isInstalled('global')) {
        inferred.push('global');
      }
      if (isInstalled('project')) {
        inferred.push('project');
      }
      return inferred;
    }
  }

  return [...new Set(scopes)];
}

function showUsage(exitCode = 0) {
  console.log(`
🤖 Claude Agents Installation Script

USAGE:
  node install.js [OPTIONS]

INSTALL OPTIONS:
  -g, --global                Install agents globally (~/.claude)
  -p, --project [DIR]         Install for project directory (defaults to current)
  -l, --languages LANGS       Keep language skills only (comma-separated)
                              Available: dotnet,python,typescript,flutter,go,java,node,react,ruby,rust,sql

LIFECYCLE OPTIONS:
  -U, --update                Update existing installation(s)
  -u, --uninstall             Uninstall installation(s)
      --all                   Target both global and project scopes (update/uninstall)
      --status                Show detected install scopes

GENERAL:
  -v, --version               Show version information
  -h, --help                  Show this help message

EXAMPLES:
  node install.js --global
  node install.js --project .
  node install.js --global --languages python,typescript
  node install.js --update                    # updates detected installs
  node install.js --update --all              # force update global + project
  node install.js --uninstall                 # uninstall current project scope
  node install.js --uninstall --global        # uninstall global scope
  node install.js --uninstall --all           # uninstall both scopes
  node install.js --status
  npx @shahboura/agents-claude --global

INSTALLATION LOCATIONS:
  Global:  ~/.claude/
  Project: <project>/.claude/ + <project>/CLAUDE.md

NOTES:
  - npx/npm installs from the published npm package version.
  - Config updates merge only missing defaults where safe.
  - Uninstall removes installer-managed files using install manifest tracking.
  - Backups: <scope>/.backups/<timestamp>--<operation>--<scope>/
  - Retention: keeps latest 10 sessions and prunes sessions older than 30 days.

Documentation: https://github.com/shahboura/agents-claude
`);
  process.exit(exitCode);
}

module.exports = {
  parseArgs,
  getRequestedScopes,
  showUsage,
};
