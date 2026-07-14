const { cmd } = require('../arslan');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "ytmp3",
    alias: ["ytaudio", "ytsong", "downloadmp3"],
    react: "🎵",
    desc: "Download YouTube audio",
    category: "download",
    use: ".ytmp3 song name or URL",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`🎵 *YOUTUBE TO MP3*\n\nDownload audio from YouTube!\nExample: .ytmp3 Shape of You\n\n💡 Supports:\n• Song names\n• YouTube URLs\n• Search queries`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let videoUrl = q;
        let title = 'Audio';

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
            const res = await axios.get(`https://api.cyberzone.tech/ytmp3?url=${encodeURIComponent(videoUrl)}`, {
                timeout: 20000
            });
            if (res.data && res.data.url) {
                downloadUrl = res.data.url;
                source = 'CyberZone API';
            }
        } catch (e) {}

        if (!downloadUrl) {
            try {
                const res = await axios.get(`https://vihanga-api.vercel.app/api/ytmp3?url=${encodeURIComponent(videoUrl)}`, {
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
            return reply(`❌ Failed to download audio.\n\n💡 Try:\n• Different song\n• Use direct YouTube URL\n• Try .play for streaming`);
        }

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mp4',
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: m });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply(`🎵 *${title}*\n\n✅ Audio downloaded successfully!\n📡 Source: ${source}\n📁 Size: Sent as MP3`);

    } catch (error) {
        console.error("YTMP3 error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to download audio.");
    }
});