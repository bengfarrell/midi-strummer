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

const socketMode = process.env.SOCKET_MODE === 'true';

console.log('🔧 Web Dev Server starting...');
console.log('   SOCKET_MODE:', process.env.SOCKET_MODE);
console.log('   socketMode:', socketMode);

export default {
  nodeResolve: {exportConditions: mode === 'dev' ? ['development'] : []},
  open: 'index.html',
  preserveSymlinks: true,
  plugins: [
    {
      name: 'inject-config',
      transform(context) {
        if (context.path === '/index.html') {
          const html = context.body;
          // Inject global config before any scripts
          const configScript = `<script>window.__MIDI_STRUMMER_CONFIG__ = { socketMode: ${socketMode} };</script>`;
          const injected = html.replace('<head>', `<head>\n    ${configScript}`);
          return { body: injected };
        }
      },
    },
  ],
  middleware: [
    function serveSettings(context, next) {
      if (context.url === '/api/settings') {
        // Serve settings.json for dev mode
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
