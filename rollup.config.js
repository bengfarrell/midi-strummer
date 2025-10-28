import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import clean from 'rollup-plugin-clean';
import html from '@web/rollup-plugin-html';
import copy from 'rollup-plugin-copy';

export default {
    input: 'index.html',
    output: {
        dir: 'server/public',
        sourcemap: true,
    },
    plugins: [
        clean(),
        copy({
            targets: [
                { src: 'assets/favicon.svg', dest: 'server/public/assets' }
            ]
        }),
        html({
            minimize: true,
            transformHtml: [
                (html) => {
                    // Inject socket mode config for production build
                    const configScript = `<script>window.__MIDI_STRUMMER_CONFIG__ = { socketMode: true };</script>`;
                    return html.replace('<head>', `<head>\n    ${configScript}`);
                }
            ]
        }),
        nodeResolve(),
        sourcemaps(),
    ],
};
