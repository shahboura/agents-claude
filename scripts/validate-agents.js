#!/usr/bin/env node
'use strict';

/**
 * Claude agent/skill validator
 * - validates .claude/agents/*.md frontmatter
 * - validates skill entrypoints under .claude/skills/<name>/SKILL.md
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function getFrontmatter(content) {
  const m = content.match(/^---\s*\n([\s\S]+?)\n---/);
  return m ? m[1] : null;
}

function hasField(frontmatter, field) {
  const re = new RegExp(`^(?!\\s*#)\\s*${field}\\s*:`, 'm');
  return re.test(frontmatter);
}

function parseListField(frontmatter, field) {
  const m = frontmatter.match(new RegExp(`^(?!\\s*#)\\s*${field}\\s*:\\s*(.+)$`, 'm'));
  if (!m) return [];
  return m[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function parseField(frontmatter, field) {
  const m = frontmatter.match(new RegExp(`^(?!\\s*#)\\s*${field}\\s*:\\s*(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

function getBody(content) {
  return content.replace(/^---\s*\n[\s\S]+?\n---\s*\n?/, '');
}

function validateAgents(root, errors, warnings) {
  const agentsDir = path.join(root, '.claude', 'agents');
  if (!fs.existsSync(agentsDir)) {
    errors.push('Missing .claude/agents directory');
    return;
  }

  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) {
    warnings.push('No .claude/agents/*.md files found');
    return;
  }

  for (const file of files) {
    const full = path.join(agentsDir, file);
    const content = fs.readFileSync(full, 'utf8');
    const fm = getFrontmatter(content);
    if (!fm) {
      errors.push(`${file}: missing frontmatter`);
      continue;
    }

    for (const required of ['name', 'description']) {
      if (!hasField(fm, required)) {
        errors.push(`${file}: missing required field '${required}'`);
      }
    }

    if (!hasField(fm, 'tools')) {
      warnings.push(`${file}: missing 'tools' field (inherits all tools)`);
    }

    if (hasField(fm, 'mode') || hasField(fm, 'temperature') || hasField(fm, 'steps')) {
      warnings.push(`${file}: appears to include legacy fields (mode/temperature/steps)`);
    }

    const toolList = parseListField(fm, 'tools');
    const hasBash = toolList.some(t => t === 'Bash' || t.startsWith('Bash('));
    if (hasBash && !hasField(fm, 'hooks')) {
      warnings.push(`${file}: Bash enabled without agent-level hooks; ensure project-level PreToolUse guards exist`);
    }
  }
}

function validateSkills(root, errors, warnings) {
  const skillsDir = path.join(root, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) {
    errors.push('Missing .claude/skills directory');
    return;
  }

  const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  if (skillFolders.length === 0) {
    warnings.push('No skills found in .claude/skills');
    return;
  }

  // Hoist agent resolution outside the loop — computed once, reused per skill
  const agentsDir = path.join(root, '.claude', 'agents');
  const knownAgents = new Set(
    fs.existsSync(agentsDir)
      ? fs.readdirSync(agentsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => path.basename(f, '.md'))
      : []
  );

  for (const folder of skillFolders) {
    const skillFile = path.join(skillsDir, folder.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      errors.push(`.claude/skills/${folder.name}: missing SKILL.md`);
      continue;
    }

    const content = fs.readFileSync(skillFile, 'utf8');
    const fm = getFrontmatter(content);
    if (!fm) {
      errors.push(`.claude/skills/${folder.name}/SKILL.md: missing frontmatter`);
      continue;
    }

    if (!hasField(fm, 'name')) {
      warnings.push(`.claude/skills/${folder.name}/SKILL.md: missing 'name' field (folder name will be used)`);
    }
    if (!hasField(fm, 'description')) {
      warnings.push(`.claude/skills/${folder.name}/SKILL.md: missing 'description' field`);
    }

    // Check: command skills (context: fork) must declare a known agent
    if (parseField(fm, 'context') === 'fork') {
      const agent = parseField(fm, 'agent');
      if (!agent) {
        errors.push(`.claude/skills/${folder.name}/SKILL.md: command skill (context: fork) is missing required 'agent:' field`);
      } else if (!knownAgents.has(agent)) {
        errors.push(`.claude/skills/${folder.name}/SKILL.md: command skill references unknown agent '${agent}' (known: ${[...knownAgents].join(', ')})`);
      }

      if (!hasField(fm, 'argument-hint')) {
        warnings.push(`.claude/skills/${folder.name}/SKILL.md: command skill (context: fork) is missing 'argument-hint' field`);
      }
    }

    // Check: skills using $ARGUMENTS should have argument-hint
    const body = getBody(content);
    if (body.includes('$ARGUMENTS') && !hasField(fm, 'argument-hint')) {
      warnings.push(`.claude/skills/${folder.name}/SKILL.md: uses $ARGUMENTS but is missing 'argument-hint' field`);
    }

    // Check: Pattern A skills (no disable-model-invocation) should have a non-trivial body
    if (!hasField(fm, 'disable-model-invocation')) {
      const bodyLines = body.split('\n').filter(l => l.trim().length > 0);
      if (bodyLines.length <= 1) {
        warnings.push(`.claude/skills/${folder.name}/SKILL.md: behavior injection skill has a trivial body (≤ 1 non-empty line); add actionable conventions`);
      }
    }
  }
}

function main() {
  const root = process.cwd();
  const errors = [];
  const warnings = [];

  log(colors.cyan, 'Validating Claude agents and skills...');

  validateAgents(root, errors, warnings);
  validateSkills(root, errors, warnings);

  console.log('');
  log(colors.cyan, '================================');
  log(colors.cyan, 'Validation Results');
  log(colors.cyan, '================================');

  if (errors.length === 0 && warnings.length === 0) {
    log(colors.green, '✅ All checks passed');
    process.exit(0);
  }

  if (errors.length > 0) {
    log(colors.red, `\n❌ ERRORS (${errors.length})`);
    for (const e of errors) log(colors.red, `  • ${e}`);
  }

  if (warnings.length > 0) {
    log(colors.yellow, `\n⚠️ WARNINGS (${warnings.length})`);
    for (const w of warnings) log(colors.yellow, `  • ${w}`);
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main();
