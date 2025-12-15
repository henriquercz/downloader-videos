const path = require('path');
const fs = require('fs');

// Instância pública principal do Cobalt. 
// Existem outras (https://instances.cobalt.tools) caso esta fique offline.
const COBALT_API_URL = 'https://api.cobalt.tools/api/json';

/**
 * Obtém metadados DO FORMATO que nosso front espera.
 * Como o Cobalt não lista todos os formatos antes de baixar, 
 * vamos simular uma lista com "Melhor Qualidade" disponível.
 */
const getFormats = async (url) => {
    try {
        // Cobalt não tem endpoint de "info" separado público robusto igual yt-dlp.
        // Vamos assumir que se a URL é válida, o Cobalt consegue baixar.
        // Retornamos metadados "fakes" mas funcionais para a UI não quebrar.

        // Tentamos identificar plataforma pelo link
        let platform = 'video';
        if (url.includes('youtube') || url.includes('youtu.be')) platform = 'youtube';
        else if (url.includes('instagram')) platform = 'instagram';
        else if (url.includes('tiktok')) platform = 'tiktok';
        else if (url.includes('twitter') || url.includes('x.com')) platform = 'twitter';

        return {
            title: `Download ${platform.charAt(0).toUpperCase() + platform.slice(1)}`, // Cobalt não retorna título no pre-check facilmente sem baixar
            thumbnail: 'https://placehold.co/600x400/1e293b/FFF?text=Video+Found', // Placeholder elegante
            duration: 0,
            platform: platform,
            formats: [
                {
                    format_id: 'auto',
                    resolution: 'Melhor Qualidade (HP)',
                    note: 'MP4 via Cobalt'
                },
                {
                    format_id: 'audio',
                    resolution: 'Áudio MP3',
                    note: 'Apenas Áudio'
                }
            ]
        };
    } catch (error) {
        throw new Error(`Falha ao preparar download: ${error.message}`);
    }
};

/**
 * Realiza o download (proxy do Cobalt)
 */
const downloadVideo = async (url, formatId) => {
    try {
        const isAudio = formatId === 'audio';

        const requestBody = {
            url: url,
            vCodec: 'h264',
            vQuality: '1080',
            aFormat: 'mp3',
            isAudioOnly: isAudio
        };

        console.log('Solicitando ao Cobalt:', JSON.stringify(requestBody));

        const response = await fetch(COBALT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'NanoBananaPro/1.0'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok || (data.status && data.status === 'error')) {
            throw new Error(data.text || 'Erro na API do Cobalt');
        }

        // Se o Cobalt retornar status "stream" ou "redirect", temos a URL direta
        // Se retornar "picker", pegamos o primeiro item (geralmente vídeo)
        let downloadLink = data.url;
        if (data.status === 'picker' && data.picker && data.picker.length > 0) {
            downloadLink = data.picker[0].url;
        }

        if (!downloadLink) {
            throw new Error('Nenhum link de download retornado pelo provedor.');
        }

        console.log('Link recebido do Cobalt:', downloadLink);

        // Agora nós baixamos o arquivo para nosso servidor para entregar ao cliente
        // (Isso evita bypass de CORS e mantém o nome do arquivo limpo)
        const fileExt = isAudio ? 'mp3' : 'mp4';
        const filename = `download_${Date.now()}.${fileExt}`;
        const downloadDir = process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads');

        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const filePath = path.join(downloadDir, filename);

        // Stream do link remoto para o disco local
        const videoStream = await fetch(downloadLink);
        if (!videoStream.ok) throw new Error(`Falha ao baixar o arquivo final: ${videoStream.statusText}`);

        const fileStream = fs.createWriteStream(filePath);

        // Usando stream pipeline para performance (Node 18+ nativo)
        const { pipeline } = require('stream/promises');
        await pipeline(videoStream.body, fileStream);

        return {
            filename,
            filepath: filePath,
            size: fs.statSync(filePath).size
        };

    } catch (error) {
        console.error('Erro no downloadVideo:', error);
        throw error; // Repassa erro para o controller
    }
};

/**
 * Limpa arquivos antigos
 */
const cleanOldFiles = () => {
    const downloadDir = process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads');
    if (!fs.existsSync(downloadDir)) return;

    const maxAge = parseInt(process.env.MAX_FILE_AGE) || 24 * 60 * 60 * 1000;
    const now = Date.now();

    fs.readdir(downloadDir, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(downloadDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlink(filePath, () => { });
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
    DOWNLOAD_DIR: process.env.DOWNLOAD_DIR || path.join(__dirname, '../../downloads')
};
