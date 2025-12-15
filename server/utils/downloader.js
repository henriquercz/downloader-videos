/**
 * Modulo Core do Downloader
 * @module utils/downloader
 * @description Encapsula a lógica de interação com o yt-dlp e gerenciamento de arquivos.
 */

const path = require('path');
const fs = require('fs');
// yt-dlp-exec é um wrapper promise-based para o binário
const ytDlp = require('yt-dlp-exec');

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads');
const MAX_FILE_AGE = process.env.MAX_FILE_AGE || 3600000; // 1 hora em ms

/**
 * Obtém os formatos disponíveis e metadados de um vídeo.
 * @param {string} url - URL do vídeo
 * @returns {Promise<Object>} Metadados formatados
 */
const getFormats = async (url) => {
    try {
        const output = await ytDlp(url, {
            dumpJson: true,
            noPlaylist: true,
            // Opções para evitar bloqueios ou erros
            noCheckCertificate: true,
            geoBypass: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        return {
            title: output.title,
            thumbnail: output.thumbnail,
            duration: output.duration,
            platform: output.extractor,
            formats: output.formats
                .filter(f => f.video_ext !== 'none' || f.acodec !== 'none') // Filtra formatos inúteis
                .map(f => ({
                    format_id: f.format_id,
                    ext: f.ext,
                    resolution: f.resolution || `${f.width}x${f.height}`,
                    filesize: f.filesize,
                    note: f.format_note,
                    hasAudio: f.acodec !== 'none',
                    hasVideo: f.vcodec !== 'none'
                }))
        };
    } catch (error) {
        console.error('[Downloader] Erro ao obter formatos:', error.message);
        throw new Error('Falha ao processar URL. Verifique se o link é válido e público.');
    }
};

/**
 * Baixa o vídeo solicitado.
 * @param {string} url - URL do vídeo
 * @param {string} formatId - ID do formato desejado
 * @returns {Promise<string>} Caminho absoluto do arquivo baixado
 */
const downloadVideo = async (url, formatId) => {
    const timestamp = Date.now();
    // Template de output seguro
    const outputTemplate = path.join(DOWNLOAD_DIR, `${timestamp}_%(title)s.%(ext)s`);

    try {
        console.log(`[Downloader] Iniciando download: ${url} (Formato: ${formatId})`);

        // Executa e aguarda o download
        await ytDlp(url, {
            format: formatId,
            output: outputTemplate,
            noPlaylist: true,
            noCheckCertificate: true,
            // User agent simulado
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        });

        // Como o nome do arquivo final pode variar dependendo do título, precisamos encontrá-lo
        // O template usa o timestamp como prefixo único
        const files = fs.readdirSync(DOWNLOAD_DIR);
        const downloadedFile = files.find(f => f.startsWith(`${timestamp}_`));

        if (!downloadedFile) {
            throw new Error('Arquivo não encontrado após download.');
        }

        return path.join(DOWNLOAD_DIR, downloadedFile);

    } catch (error) {
        console.error('[Downloader] Erro no download:', error.stderr || error.message);
        throw new Error('Falha ao baixar o vídeo. Tente outro formato.');
    }
};

/**
 * Limpa arquivos temporários antigos.
 */
const cleanOldFiles = () => {
    if (!fs.existsSync(DOWNLOAD_DIR)) return;

    fs.readdir(DOWNLOAD_DIR, (err, files) => {
        if (err) return console.error('[Cleaner] Erro ao ler diretório:', err);

        console.log(`[Cleaner] Verificando ${files.length} arquivos...`);
        const now = Date.now();

        files.forEach(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;

                if (now - stats.mtimeMs > MAX_FILE_AGE) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error(`[Cleaner] Falha ao deletar ${file}:`, err);
                        else console.log(`[Cleaner] Arquivo expirado removido: ${file}`);
                    });
                }
            });
        });
    });
};

module.exports = {
    getFormats,
    downloadVideo,
    cleanOldFiles
};
