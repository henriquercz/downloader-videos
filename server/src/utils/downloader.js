const path = require('path');
const fs = require('fs');
const YtDlpWrap = require('yt-dlp-wrap').default;

// Inicializa yt-dlp.
// No Docker (Linux), ele está em /usr/local/bin/yt-dlp
// No Windows (Dev), ele deve estar no PATH ou baixado localmente
const execPath = process.platform === 'linux' ? '/usr/local/bin/yt-dlp' : undefined;
const ytDlp = new YtDlpWrap(execPath);

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR
    ? path.resolve(process.env.DOWNLOAD_DIR)
    : path.resolve(__dirname, '../../downloads');

// Garante que a pasta existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

/**
 * Obtém metadados e formatos do vídeo
 */
const getFormats = async (url) => {
    try {
        // Flags anti-bloqueio para metadados
        const args = [
            url,
            '--dump-json',
            '--no-check-certificate',
            '--geo-bypass',
            // Tentar emular cliente Android (API interna) para evitar 'Sign in as Bot'
            '--extractor-args', 'youtube:player_client=android',
            // Garantir que usa o node instalado no container
            '--js-runtimes', 'node',
            // User Agent mobile genérico
            '--user-agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        ];

        // YtDlpWrap getVideoInfo é um wrapper simples, vamos usar execPromise para controle total
        // ou instanciar args se a lib permitir, mas getVideoInfo geralmente aceita apenas args limitados ou string.
        // Melhor usar o .execPromise com --dump-json manual para garantir as flags.

        const stdout = await ytDlp.execPromise(args);
        const metadata = JSON.parse(stdout);
        return {
            title: metadata.title,
            thumbnail: metadata.thumbnail,
            duration: metadata.duration,
            platform: metadata.extractor_key,
            formats: metadata.formats
                .filter(f => f.ext === 'mp4' && f.acodec !== 'none' && f.vcodec !== 'none') // Filtrar apenas MP4 com áudio e vídeo
                .map(f => ({
                    format_id: f.format_id,
                    resolution: f.resolution || `${f.width}x${f.height}`,
                    filesize: f.filesize,
                    note: f.format_note
                }))
                .slice(0, 10) // Limitar para não poluir UI
        };
    } catch (error) {
        throw new Error(`Falha ao obter formatos: ${error.message}`);
    }
};

/**
 * Realiza o download do vídeo
 */
const downloadVideo = (url, formatId) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const filename = `video_${timestamp}.mp4`;
        const filepath = path.join(DOWNLOAD_DIR, filename);

        const args = [
            url,
            '-f', formatId || 'best[ext=mp4]',
            '-o', filepath,
            '--no-check-certificate',
            '--prefer-free-formats',
            '--geo-bypass',
            '--extractor-args', 'youtube:player_client=android',
            '--js-runtimes', 'node',
            '--user-agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
        ];

        console.log(`Iniciando download: ${url} -> ${filepath}`);

        const ytDlpEventEmitter = ytDlp.exec(args);

        ytDlpEventEmitter
            .on('progress', (progress) => {
                // Aqui poderíamos implementar websocket para progresso real-time
                // console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta);
            })
            .on('error', (error) => {
                reject(new Error(`Erro no download: ${error.message}`));
            })
            .on('close', () => {
                resolve({
                    filename,
                    filepath,
                    size: fs.statSync(filepath).size
                });
            });
    });
};

/**
 * Limpa arquivos antigos (Cron job simples)
 */
const cleanOldFiles = () => {
    const maxAge = parseInt(process.env.MAX_FILE_AGE) || 24 * 60 * 60 * 1000;
    const now = Date.now();

    fs.readdir(DOWNLOAD_DIR, (err, files) => {
        if (err) return console.error('Erro ao ler diretório de downloads:', err);

        files.forEach(file => {
            const filePath = path.join(DOWNLOAD_DIR, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlink(filePath, err => {
                        if (err) console.error(`Erro ao deletar ${file}:`, err);
                        else console.log(`Arquivo limpo: ${file}`);
                    });
                }
            });
        });
    });
};

// Executa limpeza na inicialização
cleanOldFiles();

module.exports = {
    getFormats,
    downloadVideo,
    cleanOldFiles,
    DOWNLOAD_DIR
};
