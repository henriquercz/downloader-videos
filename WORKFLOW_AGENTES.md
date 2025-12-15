# Plano de Trabalho Paralelizado: Video Downloader Multi-Platform

Este documento descreve a divisão de tarefas para 3 Agentes de IA trabalharem simultaneamente no projeto.
**Atenção Agentes:** Sigam rigorosamente as instruções de sua seção. Suponham que os outros agentes entregarão suas partes conforme o contrato de interface (API routes, Component names, etc.).

---

## 🟢 Agente C (Líder de Infra): Setup, DevOps e QA
*Este agente deve iniciar o trabalho executando a Tarefa C1 antes dos outros, ou garantir que a estrutura de pastas exista.*

### Tarefa C1: Estrutura e Ambiente (Prompts 1 e 11)
1. **Estrutura de Pastas:** Crie a raiz do projeto contendo as pastas `client` e `server`.
2. **Variáveis de Ambiente:** Crie um arquivo `.env.example` na raiz (ou dentro de server) com as chaves:
   - `NODE_ENV` (development/production)
   - `PORT` (padrão 3001 para backend)
   - `REACT_APP_API_URL` (padrão http://localhost:3001)
   - `DOWNLOAD_DIR` (caminho para salvar vídeos temporariamente)
   - `MAX_FILE_AGE` (tempo para expurgo de arquivos)
   - `RATE_LIMIT_REQUESTS` e `RATE_LIMIT_WINDOW`
   - Documente cada variável com comentários.

### Tarefa C2: Containerização Docker (Prompt 8)
1. **Server Dockerfile:** Criar `server/Dockerfile` usando `node:20-alpine`, multi-stage build se possível.
2. **Client Dockerfile:** Criar `client/Dockerfile`.
3. **Orquestração:** Criar `docker-compose.yml` na raiz que suba frontend e backend juntos.
4. **Scripts:** Criar `.dockerignore` e scripts de entrypoint se necessário.
5. **Requisito:** Otimizar para tamanho mínimo de imagem.

### Tarefa C3: Testes Automatizados (Prompt 9)
Criar infraestrutura de testes (Jest + Testing Library):
1. Testes unitários para funções de detecção de plataforma (Regex).
2. Testes para controller de validação de URL.
3. Testes de integração para as rotas da API (usando mocks).
4. Localização: `server/__tests__` ou `server/**/*.test.js`.
5. Meta: Cobertura > 80% nas funções core.

### Tarefa C4: Documentação (Prompt 10)
Criar `README.md` profissional na raiz contendo:
1. Descrição do projeto e features.
2. Tech stack (React, Node, Docker, yt-dlp).
3. Guia de instalação e execução (Local e Docker).
4. Documentação dos Endpoints da API (POST /detect, POST /download, etc).
5. Seção de Troubleshooting.

---

## 🔵 Agente A: Backend Specialist (Inicia em paralelo após C1)
*Responsável por toda lógica server-side, Node.js e manuseio de arquivos.*

### Tarefa A1: Configuração Express (Prompt 2)
No diretório `server`:
1. Criar servidor Express (`server.js` ou `app.js`).
2. Configurar Middlewares: `cors`, `morgan` (logging), `express.json`.
3. Definir Rotas Base:
   - `POST /api/detect`: Recebe URL, retorna metadados da plataforma.
   - `POST /api/download`: Inicia o processo de download.
   - `GET /api/formats/:id`: Retorna formatos disponíveis para um vídeo.
4. Implementar Middleware de Erro global robusto.

### Tarefa A2: Core do Downloader (Prompt 3)
Criar módulo `server/utils/downloader.js`:
1. Integrar **yt-dlp** via `child_process`. **Importante:** Se yt-dlp falhar, prever alternativa ou erro claro.
2. Funções exportáveis:
   - `getFormats(url)`: Retorna lista de qualidades.
   - `downloadVideo(url, options)`: Baixa o vídeo para pasta temporária.
   - `cleanOldFiles()`: Remove arquivos > 24h.
3. Implementar lógica de timeout e rate limiting na execução do processo.

### Tarefa A3: Controllers e Validação (Prompt 4)
Criar `server/controllers/videoController.js`:
1. **Validação:** Regex para identificar YouTube, TikTok, Instagram, Facebook, Twitter/X.
2. **Métodos:**
   - `detectPlatform`: Identifica origem e valida URL.
   - `startDownload`: Chama o downloader e gerencia resposta.
   - `getDownloadStatus`: (Opcional) polling de status.
3. Tratamento de erros HTTP corretos (400 Bad Request, 404 Not Found, 500 Internal Server Error).

### Tarefa A4: Segurança (Prompt 12)
Refinar o código implementando:
1. **Helmet.js** para headers de segurança.
2. **Rate Limiting** (express-rate-limit) para evitar abuso.
3. **Sanitização:** Limpar nomes de arquivos para evitar Path Traversal.
4. Validação de inputs com `joi` ou `zod`.

---

## 🟠 Agente B: Frontend Specialist (Inicia em paralelo após C1)
*Responsável pela interface React, UX e integração com API.*

### Tarefa B1: Setup React (Prompt 6)
No diretório `client`:
1. Inicializar projeto React + TypeScript + Vite.
2. Configurar **Tailwind CSS**.
3. Estrutura de pastas: `src/pages`, `src/components`, `src/services`, `src/types`.
4. Configurar `src/services/api.ts` com instância Axios e interceptors.

### Tarefa B2: UI/UX & Layout (Prompt 7)
Criar componentes visuais em `src/components`:
1. `Layout.tsx`: Header (Logo), Footer (Copyright), Main Container.
2. UI Elements: Botões com estados (loading, disabled), Inputs estilizados, Spinners de carregamento, Toasts para notificações.
3. Estética: Design moderno, gradientes suaves, sombras, responsividade mobile-first.

### Tarefa B3: Funcionalidade Principal (Prompt 5)
Desenvolver `src/components/VideoDownloader.tsx`:
1. **Input de URL:** Com validação visual.
2. **Fluxo:**
   - Usuário cola link -> Chama `/api/detect`.
   - Backend retorna info -> Exibe Card com Thumbnail/Título.
   - Usuário escolhe formato -> Chama `/api/download`.
   - Exibe progresso/loading -> Recebe arquivo (blob) ou link.
3. **Histórico:** Salvar últimos downloads no `localStorage`.
4. **Tratamento de Erro:** Exibir mensagens amigáveis se a API falhar.

---

**Nota de Integração:**
- Frontend deve esperar a API em `http://localhost:3001/api`.
- Backend deve permitir CORS de `http://localhost:5173` (ou porta do Vite).
- Ambos devem compartilhar o entendimento dos DTOs (Data Transfer Objects) JSON.
