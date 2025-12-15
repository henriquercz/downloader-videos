/**
 * Video Controller
 * @module controllers/videoController
 * @description Gerencia a lógica das requisições de info e download de vídeos.
 */

const downloader = require('../utils/downloader');
const path = require('path');
const fs = require('fs');

// --- Validação (Regex) ---
const PLATFORM_REGEX = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    tiktok: /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+$/,
    instagram: /^(https?:\/\/)?(www\.)?(instagram\.com)\/.+$/,
    facebook: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/,
    twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/
};

const isValidUrl = (url) => {
    return Object.values(PLATFORM_REGEX).some(regex => regex.test(url));
};

/**
 * Detecta plataforma e recupera metadados do vídeo.
 * Endpoint: POST /api/detect
 */
const detectPlatform = async (req, res, next) => {
    try {
        const { url } = req.body;

        // 1. Validação Básica
        if (!url) {
            return res.status(400).json({ error: true, message: 'URL é obrigatória.' });
        }

        if (!isValidUrl(url)) {
            return res.status(400).json({
                error: true,
                message: 'Plataforma não suportada ou URL inválida. Suportamos: YouTube, TikTok, Instagram, Facebook, Twitter.'
            });
        }

        // 2. Chamada ao Core
        console.log(`[API] Detectando vídeo: ${url}`);
        const metadata = await downloader.getFormats(url);

        // 3. Resposta
        res.json({
            success: true,
            data: metadata
        });

    } catch (error) {
        next(error); // Passa para o middleware de erro global
    }
};

/**
 * Inicia o download e envia o arquivo.
 * Endpoint: POST /api/download
 */
const startDownload = async (req, res, next) => {
    try {
        const { url, formatId } = req.body;

        if (!url || !formatId) {
            return res.status(400).json({ error: true, message: 'URL e Format ID são obrigatórios.' });
        }

        // 1. Executar Download
        console.log(`[API] Solicitando download: ${url}`);
        const filePath = await downloader.downloadVideo(url, formatId);

        // 2. Verificar existência
        if (!fs.existsSync(filePath)) {
            throw new Error('Arquivo final não foi gerado corretamente.');
        }

        // 3. Enviar Arquivo usando res.download
        // O callback remove o arquivo após o envio para economizar espaço (Cleanup imediato)
        res.download(filePath, (err) => {
            if (err) {
                console.error('[API] Erro ao enviar arquivo:', err);
                // Se headers já foram enviados, não podemos enviar erro JSON
                if (!res.headersSent) {
                    res.status(500).send('Erro no download do arquivo.');
                }
            }

            // Remover arquivo temporário após envio (sucesso ou erro de rede)
            try {
                fs.unlinkSync(filePath);
                console.log(`[API] Arquivo temporário removido: ${filePath}`);
            } catch (unlinkErr) {
                console.error('[API] Falha ao remover arquivo temporário:', unlinkErr);
            }
        });

    } catch (error) {
        next(error);
    }
};

// Executar limpeza de arquivos antigos periodicamente (ex: a cada 1 hora)
setInterval(() => {
    console.log('[Cron] Executando limpeza periódica...');
    downloader.cleanOldFiles();
}, 3600000);

module.exports = {
    detectPlatform,
    startDownload
};
