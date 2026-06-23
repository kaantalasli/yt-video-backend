FROM node:18-alpine

# FFmpeg ve Python (yt-dlp için) kurulumu
RUN apk add --no-cache ffmpeg python3

# yt-dlp aracını indir ve kur
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]