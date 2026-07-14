const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "lyrics",
    alias: ["lyric", "songlyrics"],
    react: "🎵",
    desc: "Find song lyrics",
    category: "ai",
    use: ".lyrics song name",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`🎵 *LYRICS FINDER*\n\nFind lyrics for any song!\nExample: .lyrics Shape of You\n\n💡 Try:\n.lyrics Bohemian Rhapsody\n.lyrics Someone Like You`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let lyrics = null;
        let title = q;
        let artist = 'Unknown';

        // API 1: Lyrics.ovh
        try {
            const res = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(q)}`, {
                timeout: 10000
            });
            if (res.data && res.data.lyrics) {
                lyrics = res.data.lyrics;
                artist = res.data.artist || 'Unknown';
            }
        } catch (e) {}

        // API 2: PopCat Lyrics
        if (!lyrics) {
            try {
                const res = await axios.get(`https://api.popcat.xyz/lyrics?q=${encodeURIComponent(q)}`, {
                    timeout: 10000
                });
                if (res.data && res.data.lyrics) {
                    lyrics = res.data.lyrics;
                    title = res.data.title || q;
                    artist = res.data.artist || 'Unknown';
                }
            } catch (e) {}
        }

        // If no lyrics found
        if (!lyrics) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Lyrics not found for: *${q}*\n\n💡 Tips:\n• Try spelling the song name correctly\n• Use artist name too: .lyrics Ed Sheeran Shape of You\n• Try another song`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Clean lyrics
        lyrics = lyrics.replace(/\n{3,}/g, '\n\n').trim();

        // Format response
        let caption = `🎵 *${title}*\n👤 *Artist:* ${artist}\n\n${lyrics}`;

        // Split if too long
        if (caption.length > 4000) {
            const parts = caption.match(/[\s\S]{1,3500}/g) || [caption];
            for (let i = 0; i < parts.length; i++) {
                if (i === 0) {
                    await reply(parts[i]);
                } else {
                    await reply(`📝 *Part ${i+1}*\n\n${parts[i]}`);
                }
            }
        } else {
            await reply(caption);
        }

    } catch (error) {
        console.error("Lyrics error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to find lyrics.");
    }
});