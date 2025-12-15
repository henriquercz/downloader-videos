/**
 * Video Downloader Server - Entry Point
 * @module server
 * @description Configuração principal do servidor Express, Middlewares e Rotas.
 * @version 1.0.0
 * @author Agente A
 */

require('dotenv').config({ path: '../.env' }); // Carrega .env da raiz se existir, ou local
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;
const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || path.join(__dirname, 'downloads');

// Garantir que diretório de downloads existe
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// --- Middlewares de Segurança e Utilidades (Tarefas A1 e A4) ---

// 1. Helmet para Headers de Segurança
app.use(helmet());

// 2. CORS (Permitir frontend)
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Ajustar conforme Vite
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Logger HTTP
app.use(morgan('dev'));

// 4. Rate Limiting (Proteção contra abuso)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requisições por IP
    message: 'Muitas requisições criadas a partir deste IP, por favor tente novamente após 15 minutos.'
});
app.use('/api/', limiter);

// 5. Parser de JSON
app.use(express.json());

// --- Rotas ---

// Rota de Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime() });
});

// Registrar rotas da API
app.use('/api', apiRoutes);

// --- Middleware Global de Erro (Tarefa A1) ---
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err.stack);
    res.status(err.status || 500).json({
        error: true,
        message: err.message || 'Erro Interno do Servidor',
        path: req.path
    });
});

// --- Inicialização ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📂 Pasta de downloads: ${DOWNLOAD_DIR}`);
    });
}

module.exports = app;
