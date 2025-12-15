const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Rota para detecção de metadados e formatos
router.post('/detect', videoController.detectPlatform);

// Rota para iniciar o download
router.post('/download', videoController.startDownload);

// Rota auxiliar para obter formatos de um ID específico (se necessário no futuro)
// router.get('/formats/:id', videoController.getFormatsById);

module.exports = router;
