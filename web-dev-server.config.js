/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.env.MODE || 'dev';
if (!['dev', 'prod'].includes(mode)) {
  throw new Error(`MODE must be "dev" or "prod", was "${mode}"`);
}

export default {
  nodeResolve: {exportConditions: mode === 'dev' ? ['development'] : []},
  open: 'index.html',
  preserveSymlinks: true,
  middleware: [
    function serveSettings(context, next) {
      if (context.url === '/api/settings') {
        const settingsPath = join(__dirname, 'settings.json');
        const settings = readFileSync(settingsPath, 'utf-8');
        return {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: settings,
        };
      }
      return next();
    },
  ],
};
