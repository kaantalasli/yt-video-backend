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

    // Daha esnek format seçimi (Sadece çözünürlüğe bakar, en iyisini alıp mp4'e birleştirir)
    let formatCmd = '';
    if (format === 'mp3') {
        formatCmd = `--extract-audio --audio-format mp3 --audio-quality ${resolution === '320' ? '0' : '5'}`;
    } else {
        formatCmd = `-f "bestvideo[height<=${resolution}]+bestaudio/best" --merge-output-format mp4`;
    }

    // ANDROID TAKLİDİ SİLİNDİ: Artık sadece senin kimlik kartını (cookies.txt) kullanacak
    const bypassArgs = `--cookies cookies.txt --geo-bypass`;
    
    const cmd = `yt-dlp ${formatCmd} ${bypassArgs} --no-playlist --download-sections "*${start}-${end}" --force-keyframes-at-cuts "${url}" -o "${outputPath}"`;

    console.log(`İşlem başladı: ${url} | Aralık: ${start} - ${end}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error("Kesme Hatası:", stderr);
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
