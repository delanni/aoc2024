#!/usr/bin/env ts-node-script

import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const args = process.argv.slice(2);

let serveTarget = path.isAbsolute(args[0]) && args[0];
if (!serveTarget) {
  const projectRoot = path.resolve(__dirname, '..');
  serveTarget = path.join(projectRoot, args[0]);

  if (fs.existsSync(serveTarget) && fs.statSync(serveTarget).isDirectory()) {
    // serveTarget
  } else {
    // try resolving it in src/typescript/solutions
    serveTarget = path.join(projectRoot, 'src/typescript/solutions', args[0]);
  }
}

spawnSync('npx', ['serve', serveTarget], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..'),
});
