// FILE: commands/tools/gdrive.js
const { cmd } = require("../arslan");
const axios = require("axios");

cmd({
    pattern: "gdrive",
    alias: ["gdrive", "googledrive"],
    desc: "Download files from Google Drive",
    category: "tools",
    react: "☁️",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a Google Drive file URL.\nExample: .gdrive https://drive.google.com/...");

        if (!q.includes('drive.google.com')) {
            return reply("❌ Please provide a valid Google Drive URL.");
        }

        await reply("⏳ Fetching Google Drive file...");

        // Extract file ID
        const fileIdMatch = q.match(/[-\w]{25,}/);
        if (!fileIdMatch) {
            return reply("❌ Invalid Google Drive URL.");
        }
        const fileId = fileIdMatch[0];

        // Get file info
        const fileInfo = await axios.get(`https://drive.google.com/uc?export=download&id=${fileId}`, {
            maxRedirects: 0,
            validateStatus: (status) => status < 400
        });

        let downloadUrl;
        let fileName = 'file';

        if (fileInfo.headers.location) {
            downloadUrl = fileInfo.headers.location;
            fileName = downloadUrl.split('/').pop().split('?')[0];
        } else {
            // Parse HTML to get download URL
            const html = fileInfo.data;
            const confirmMatch = html.match(/confirm=([^&]+)/);
            if (confirmMatch) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`;
            } else {
                return reply("❌ Failed to get download link.");
            }
        }

        const fileData = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(fileData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            document: buffer,
            fileName: fileName || 'file',
            caption: `☁️ *GOOGLE DRIVE FILE*\n\n📁 ${fileName || 'file'}\n🔗 ${q}\n\nDownloaded by Arslan-MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("GDrive Error:", err);
        reply("❌ Failed to download Google Drive file. Please try again.");
    }
});