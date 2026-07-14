const { cmd } = require('../arslan');

cmd({
    pattern: "sticker",
    alias: ["s", "sticker"],
    react: "🎨",
    desc: "Make sticker from image/video",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
    try {
        if (!quoted) return reply("❌ Reply to an image or video!");

        const msg = quoted.message;
        const mediaType = Object.keys(msg).find(key => 
            ['imageMessage', 'videoMessage', 'stickerMessage'].includes(key)
        );

        if (!mediaType) return reply("❌ Reply to an image, video, or sticker!");

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: mek.key } });

        const buffer = await quoted.download();
        if (!buffer) return reply("❌ Failed to download media!");

        if (mediaType === 'stickerMessage') {
            return await conn.sendMessage(m.chat, { 
                sticker: buffer 
            }, { quoted: mek });
        }

        let stickerOptions = {
            sticker: buffer,
            packname: 'ICON-X MD',
            author: 'Mr Elephant'
        };

        if (mediaType === 'videoMessage') {
            stickerOptions.isVideo = true;
            stickerOptions.gifPlayback = true;
        }

        await conn.sendMessage(m.chat, stickerOptions, { quoted: mek });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Sticker error:", error);
        reply("❌ Failed to create sticker!");
    }
});