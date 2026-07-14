const { cmd } = require('../arslan');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "ytmp4",
    alias: ["ytvideo", "downloadmp4", "ytdl"],
    react: "🎬",
    desc: "Download YouTube video",
    category: "download",
    use: ".ytmp4 song name or URL",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`🎬 *YOUTUBE TO MP4*\n\nDownload videos from YouTube!\nExample: .ytmp4 Shape of You\n\n💡 Supports:\n• Song names\n• YouTube URLs\n• Search queries`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let videoUrl = q;
        let title = 'Video';

        // Check if it's a YouTube URL
        const urlRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)/;
        if (!urlRegex.test(q)) {
            const search = await yts(q);
            if (!search || !search.videos || search.videos.length === 0) {
                await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
                return reply(`❌ No results found for: *${q}*`);
            }
            const video = search.videos[0];
            videoUrl = video.url;
            title = video.title;
        }

        let downloadUrl = null;
        let source = '';

        // Try multiple APIs
        try {
            const res = await axios.get(`https://api.cyberzone.tech/ytdl?url=${encodeURIComponent(videoUrl)}`, {
                timeout: 20000
            });
            if (res.data && res.data.url) {
                downloadUrl = res.data.url;
                source = 'CyberZone API';
            }
        } catch (e) {}

        if (!downloadUrl) {
            try {
                const res = await axios.get(`https://vihanga-api.vercel.app/api/ytdl?url=${encodeURIComponent(videoUrl)}`, {
                    timeout: 20000
                });
                if (res.data && res.data.downloadUrl) {
                    downloadUrl = res.data.downloadUrl;
                    source = 'Vihanga API';
                }
            } catch (e) {}
        }

        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Failed to download video.\n\n💡 Try:\n• Different video\n• Use direct YouTube URL\n• Try .play for streaming`);
        }

        // Send video
        await conn.sendMessage(from, {
            video: { url: downloadUrl },
            caption: `🎬 *${title}*\n\n✅ Video downloaded successfully!\n📡 Source: ${source}`
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("YTMP4 error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to download video.");
    }
});