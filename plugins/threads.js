// FILE: commands/downloader/threads.js
const { cmd } = require("../arslan");
const axios = require("axios");

cmd({
    pattern: "threads",
    alias: ["th", "threadsdl"],
    desc: "Download Threads videos",
    category: "download",
    react: "🧵",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a Threads post URL.\nExample: .threads https://www.threads.net/...");

        if (!q.includes('threads.net')) {
            return reply("❌ Please provide a valid Threads URL.");
        }

        await reply("⏳ Downloading Threads video...");

        const response = await axios.get(`https://threads-api.com/api/posts?url=${encodeURIComponent(q)}`);

        if (!response.data || !response.data.media) {
            return reply("❌ Failed to get Threads video.");
        }

        const videoUrl = response.data.media;
        const videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(videoData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            video: buffer,
            caption: `🧵 *THREADS VIDEO*\n\n🔗 ${q}\n\nDownloaded by Arslan-MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("Threads Error:", err);
        reply("❌ Failed to download Threads video. Please try again.");
    }
});