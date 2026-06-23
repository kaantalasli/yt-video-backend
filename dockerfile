FROM python:3.11-alpine

# FFmpeg ve JavaScript şifrelerini çözmesi için Node.js kuruyoruz
RUN apk add --no-cache ffmpeg nodejs npm

# yt-dlp aracını tüm yan eklentileriyle birlikte resmi yoldan (pip) kuruyoruz
RUN pip install -U yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
