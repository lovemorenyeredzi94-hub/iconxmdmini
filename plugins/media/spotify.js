// FILE: commands/downloader/spotify.js
const { cmd } = require("../arslan");
const axios = require("axios");

cmd({
    pattern: "spotify",
    alias: ["sp", "spotifydl"],
    desc: "Download Spotify songs",
    category: "download",
    react: "🎶",
    filename: __filename
}, async (conn, mek, m, {
    reply, q
}) => {
    try {
        if (!q) return reply("❌ Please provide a Spotify song URL or name.\nExample: .spotify https://open.spotify.com/track/...");

        // Check if it's a URL or search query
        const isUrl = q.includes('spotify.com');
        
        await reply("⏳ Searching for Spotify song...");

        // Using free Spotify API
        let response;
        if (isUrl) {
            response = await axios.get(`https://api.spotifydown.com/download/${q.split('/track/')[1]?.split('?')[0]}`);
        } else {
            response = await axios.get(`https://api.spotifydown.com/search?q=${encodeURIComponent(q)}`);
        }

        if (!response.data || !response.data.data) {
            return reply("❌ Song not found on Spotify.");
        }

        const song = isUrl ? response.data.data : response.data.data[0];
        const audioUrl = song.audio;

        const audioData = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(audioData.data);

        await conn.sendMessage(mek.key.remoteJid, {
            audio: buffer,
            mimetype: "audio/mp4",
            caption: `🎶 *SPOTIFY SONG*\n\n📝 ${song.title}\n👤 ${song.artist}\n\nDownloaded by Arslan-MD`
        }, { quoted: mek });

    } catch (err) {
        console.error("Spotify Error:", err);
        reply("❌ Failed to download Spotify song. Please try again.");
    }
});