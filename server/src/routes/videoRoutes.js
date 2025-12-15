const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// POST /api/detect - Detecta plataforma e formatos
router.post('/detect', videoController.detectPlatform);

// POST /api/download - Inicia processamento
router.post('/download', videoController.startDownload);

// GET /api/download/file/:filename - Baixa o arquivo físico
router.get('/download/file/:filename', videoController.serveFile);

module.exports = router;
