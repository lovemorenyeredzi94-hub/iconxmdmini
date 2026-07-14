const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "urban",
    alias: ["ud", "urbandict", "slang"],
    react: "📖",
    desc: "Search Urban Dictionary",
    category: "search",
    use: ".urban word",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`📖 *URBAN DICTIONARY*\n\nSearch slang words!\nExample: .urban yeet\n\n💡 Tips:\n• Try different words\n• Check spelling\n• Discover new slang`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const res = await axios.get(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(q)}`, {
            timeout: 10000
        });

        if (!res.data || !res.data.list || res.data.list.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No Urban Dictionary results for: *${q}*\n\n💡 Tips:\n• Try different spelling\n• Use common slang\n• Check if word exists`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        const definitions = res.data.list.slice(0, 3);
        let text = `📖 *URBAN DICTIONARY*\n\n📌 *Word:* ${q}\n📊 *Definitions:* ${res.data.list.length}\n\n`;

        definitions.forEach((def, i) => {
            text += `${i+1}. *Definition:*\n${def.definition.substring(0, 500)}\n\n`;
            if (def.example) {
                text += `   *Example:* ${def.example.substring(0, 200)}\n\n`;
            }
            text += `   👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}\n\n`;
        });

        if (res.data.list.length > 3) {
            text += `📌 *More definitions:* ${res.data.list.length - 3} more found\n`;
        }

        reply(text);

    } catch (error) {
        console.error("Urban error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to fetch Urban Dictionary.");
    }
});