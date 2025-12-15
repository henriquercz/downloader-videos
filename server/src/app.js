const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const videoRoutes = require('./routes/videoRoutes');

require('dotenv').config({ path: path.join(__dirname, '../.env') }) || require('dotenv').config();

const app = express();
// Necessário para o Render/Heroku/Vercel (Behind Proxy) para o Rate Limit funcionar
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Configurações de Segurança e Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || '*', // Ajustar para URL do frontend em produção
    methods: ['GET', 'POST']
}));
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting Global
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_REQUESTS || 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Rotas
app.use('/api', videoRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Tratamento de Erro Global
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    const status = err.status || 500;
    res.status(status).json({
        error: true,
        message: err.message || 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Inicialização (apenas se não for teste)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📁 Diretório de Downloads: ${process.env.DOWNLOAD_DIR || './downloads'}`);
    });
}

module.exports = app;
