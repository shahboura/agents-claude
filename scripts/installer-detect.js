'use strict';

const fs = require('fs');
const path = require('path');

const LEGACY_MANAGED_DIRS = ['agents', 'skills', 'hooks', 'rules'];
const REQUIRED_AGENT_SIGNATURE = ['codebase.md', 'orchestrator.md', 'review.md'];

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(v => typeof v === 'string');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function settingsLooksManaged(settingsPath, sourceSettings) {
  if (!fs.existsSync(settingsPath)) {
    return false;
  }

  const settings = readJsonFile(settingsPath);
  if (!settings || !isObject(settings)) {
    return false;
  }

  if (!sourceSettings || !isObject(sourceSettings.permissions) || !isObject(settings.permissions)) {
    return false;
  }

  const sourceDeny = normalizeArray(sourceSettings.permissions.deny);
  const currentDeny = normalizeArray(settings.permissions.deny);
  for (const item of sourceDeny) {
    if (currentDeny.includes(item)) {
      return true;
    }
  }

  return false;
}

function hasManagedAgentSignature(claudeDir) {
  const agentsDir = path.join(claudeDir, 'agents');
  if (!fs.existsSync(agentsDir)) {
    return false;
  }

  let files;
  try {
    files = fs.readdirSync(agentsDir);
  } catch {
    return false;
  }

  return REQUIRED_AGENT_SIGNATURE.every(file => files.includes(file));
}

function hasLegacyManagedInstall(paths, sourceSettings) {
  const managedDirCount = LEGACY_MANAGED_DIRS.reduce((count, dirName) => {
    return count + (fs.existsSync(path.join(paths.claudeDir, dirName)) ? 1 : 0);
  }, 0);

  if (managedDirCount < 2) {
    return false;
  }

  return hasManagedAgentSignature(paths.claudeDir) || settingsLooksManaged(paths.settingsPath, sourceSettings);
}

function detectInstallState(paths, sourceSettings) {
  if (fs.existsSync(paths.manifestPath)) {
    return { installed: true, reason: 'manifest' };
  }

  if (fs.existsSync(paths.versionPath)) {
    return { installed: true, reason: 'version-marker' };
  }

  if (hasLegacyManagedInstall(paths, sourceSettings)) {
    return { installed: true, reason: 'legacy-signature' };
  }

  return { installed: false, reason: 'none' };
}

module.exports = {
  detectInstallState,
};
