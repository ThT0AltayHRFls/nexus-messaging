const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// In a pnpm workspace the project root and workspace root differ.
// Metro must know about the workspace root so it can resolve symlinked packages.
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the workspace root so Metro resolves cross-package symlinks
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from both the project's own node_modules AND the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Enable symlink support (required for pnpm's non-hoisted layout)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
