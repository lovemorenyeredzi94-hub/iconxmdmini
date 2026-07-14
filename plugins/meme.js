const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "meme",
    alias: ["memes", "dankmeme"],
    react: "😂",
    desc: "Get a random meme",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const response = await axios.get('https://meme-api.com/gimme', {
            timeout: 10000
        });

        if (response.data && response.data.url) {
            await conn.sendMessage(from, {
                image: { url: response.data.url },
                caption: `😂 *${response.data.title || 'Random Meme'}*\n\n📊 Upvotes: ${response.data.ups || 'N/A'}\n🔗 r/${response.data.subreddit || 'memes'}`
            }, { quoted: mek });
        } else {
            reply("❌ No memes found. Try again!");
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (error) {
        console.error("Meme error:", error);
        reply("❌ Failed to fetch meme. Try again later!");
    }
});