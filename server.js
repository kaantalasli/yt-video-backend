const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/clip', (req, res) => {
    const { url, start, end, resolution, format } = req.body;
    
    if (!url || !start || !end) {
        return res.status(400).json({ error: "Eksik parametre." });
    }

    const outputFilename = `${uuidv4()}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
    const outputPath = path.join(__dirname, outputFilename);

    // Format ayarları (Hataları azaltmak için daha stabil bir mp4 kodu eklendi)
    let formatCmd = '';
    if (format === 'mp3') {
        formatCmd = `--extract-audio --audio-format mp3 --audio-quality ${resolution === '320' ? '0' : '5'}`;
    } else {
        formatCmd = `-f "bestvideo[height<=${resolution}][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4`;
    }

    // Playlistleri atla ve zorla kes komutu
    const cmd = `yt-dlp ${formatCmd} --no-playlist --download-sections "*${start}-${end}" --force-keyframes-at-cuts "${url}" -o "${outputPath}"`;

    console.log(`İşlem başladı: ${url} | Aralık: ${start} - ${end}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error("Kesme Hatası:", stderr);
            // YENİ EKLENEN KISIM: Sabit mesaj yerine yt-dlp'nin gerçek hatasını (stderr) ekrana gönderiyoruz!
            return res.status(500).json({ error: stderr || error.message || "Bilinmeyen bir hata oluştu." });
        }

        res.download(outputPath, `kirpilmis-video.${format === 'mp3' ? 'mp3' : 'mp4'}`, (err) => {
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath); 
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kırpıcı motoru ${PORT} portunda çalışıyor...`));
