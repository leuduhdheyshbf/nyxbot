/**
 * Nyx Bot V2 - Safe Plugin Loader
 * Impede que um plugin quebrado derrube o bot inteiro.
 */

const fs = require('fs');
const path = require('path');

function loadPluginsSafely(pluginsDir, onError = console.error) {
    const loaded = [];
    const failed = [];

    if (!fs.existsSync(pluginsDir)) {
        console.warn(`[SafeLoader] Pasta de plugins não encontrada: ${pluginsDir}`);
        return { loaded, failed };
    }

    function walk(dir) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                walk(fullPath);
            } else if (file.name.endsWith('.js')) {
                try {
                    // Limpa cache do require para permitir hot-reload se necessário
                    delete require.cache[require.resolve(fullPath)];
                    const plugin = require(fullPath);

                    if (plugin && (typeof plugin === 'object' || typeof plugin === 'function')) {
                        loaded.push({ path: fullPath, plugin });
                        console.log(`[SafeLoader] ✓ Carregado: ${path.relative(process.cwd(), fullPath)}`);
                    }
                } catch (err) {
                    failed.push({ path: fullPath, error: err.message });
                    onError(`[SafeLoader] ✗ Falha ao carregar ${path.relative(process.cwd(), fullPath)}: ${err.message}`);
                    // Continua para o próximo plugin
                }
            }
        }
    }

    walk(pluginsDir);

    console.log(`[SafeLoader] Resultado: ${loaded.length} ok | ${failed.length} falharam`);
    return { loaded, failed };
}

module.exports = { loadPluginsSafely };
