# Fase de Build / Produção
FROM node:20-alpine

# Instalar dependências de sistema necessárias (Python e ffmpeg para yt-dlp)
RUN apk add --no-cache python3 py3-pip ffmpeg

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
# Nota: yt-dlp será instalado via npm (wrapper) ou pip se necessário no script de start
RUN npm install --only=production

# Copiar código fonte
COPY . .

# Criar diretório de downloads
RUN mkdir -p downloads

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "src/server.js"]
