// FILE: commands/downloader/tiktok.js
const { cmd } = require("../../arslan");
const axios = require("axios");

cmd({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok videos without watermark",
    category: "downloader",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a TikTok video URL.\nExample: .tiktok https://vm.tiktok.com/...");

        // Validate URL
        if (!q.includes('tiktok.com')) {
            return reply("❌ Please provide a valid TikTok URL.");
        }

        await reply("⏳ Downloading TikTok video...");

        // Using free TikTok API
        const response = await axios.get(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(q)}`);
        
        if (!response.data || !response.data.video_url) {
            return reply("❌ Failed to download TikTok video. Please try again.");
        }

        const videoUrl = response.data.video_url;
        const videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(videoData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            video: buffer,
            caption: `📱 *TIKTOK VIDEO*\n\n🔗 ${q}\n\nDownloaded by ICON-X MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("TikTok Error:", err);
        reply("❌ Failed to download TikTok video. Please try again.");
    }
});