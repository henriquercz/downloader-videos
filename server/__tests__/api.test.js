const request = require('supertest');
// Nota do Agente C: Como o app.js ainda não existe, este teste falhará se rodado agora.
// Ele serve como contrato (TDD) para o Agente A implementar.
const app = require('../src/app');

describe('API Endpoints Integration', () => {

    it('GET /health - Deve retornar status online', async () => {
        // Rota de healthcheck padrão
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    it('POST /api/detect - Deve rejeitar URL inválida', async () => {
        const res = await request(app)
            .post('/api/detect')
            .send({ url: 'invalid-url' });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    });

    // Este teste mocka o comportamento esperado para uma URL válida
    it('POST /api/detect - Deve retornar metadados para URL válida', async () => {
        // Mock será necessário na implementação real
        const res = await request(app)
            .post('/api/detect')
            .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

        // Agente A: Garanta que seu controller retorne essa estrutura
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('title');
            expect(res.body).toHaveProperty('thumbnail');
            expect(res.body).toHaveProperty('formats');
        }
    });
});
