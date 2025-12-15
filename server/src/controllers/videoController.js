const Joi = require('joi');
const downloader = require('../utils/downloader');
const path = require('path');

// Regex para validação básica
const URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be|instagram\.com|tiktok\.com|twitter\.com|x\.com\.br|facebook\.com|vimeo\.com)\/.+$/;

const detectSchema = Joi.object({
    url: Joi.string().pattern(URL_REGEX).required().messages({
        'string.pattern.base': 'URL não suportada ou inválida. Tente YouTube, Instagram, TikTok, etc.'
    })
});

const downloadSchema = Joi.object({
    url: Joi.string().required(),
    formatId: Joi.string().optional()
});

exports.detectPlatform = async (req, res, next) => {
    try {
        const { error, value } = detectSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: true, message: error.details[0].message });
        }

        const data = await downloader.getFormats(value.url);
        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
};

exports.startDownload = async (req, res, next) => {
    try {
        const { error, value } = downloadSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: true, message: error.details[0].message });
        }

        const result = await downloader.downloadVideo(value.url, value.formatId);

        // Retornar link para download ou stream direto?
        // Vamos retornar o path relativo para o frontend pedir o arquivo
        res.json({
            success: true,
            downloadUrl: `/api/download/file/${result.filename}`,
            filename: result.filename,
            size: result.size
        });

    } catch (err) {
        next(err);
    }
};

exports.serveFile = (req, res) => {
    const { filename } = req.params;

    // Sanitização básica contra Path Traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(downloader.DOWNLOAD_DIR, safeFilename);

    res.download(filePath, safeFilename, (err) => {
        if (err) {
            if (!res.headersSent) {
                res.status(404).json({ error: true, message: 'Arquivo não encontrado ou expirado.' });
            }
        }
    });
};
