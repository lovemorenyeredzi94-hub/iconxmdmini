const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "wiki",
    alias: ["wikipedia", "wikisearch"],
    react: "📚",
    desc: "Search Wikipedia",
    category: "search",
    use: ".wiki query",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`📚 *WIKIPEDIA SEARCH*\n\nSearch articles on Wikipedia!\nExample: .wiki Albert Einstein\n\n💡 Tips:\n• Use exact names\n• Check spelling\n• Try different language (en/es/fr)`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Search Wikipedia
        const searchRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json`, {
            timeout: 10000
        });

        if (!searchRes.data || !searchRes.data.query || !searchRes.data.query.search || searchRes.data.query.search.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No Wikipedia results found for: *${q}*\n\n💡 Tips:\n• Try different spelling\n• Use English terms\n• Check if topic exists`);
        }

        const article = searchRes.data.query.search[0];
        const title = article.title;

        // Get full article
        const contentRes = await axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`, {
            timeout: 10000
        });

        const pages = contentRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const extract = pages[pageId].extract || 'No content available';

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Format response
        let text = `📚 *WIKIPEDIA*\n\n📌 *Title:* ${title}\n📊 *Word Count:* ${extract.split(' ').length}\n\n📝 *Summary:*\n${extract.substring(0, 2000)}`;

        if (extract.length > 2000) {
            text += `\n\n📌 *More at:* https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
        }

        if (text.length > 4000) {
            const parts = text.match(/[\s\S]{1,3500}/g) || [text];
            for (const part of parts) {
                await reply(part);
            }
        } else {
            await reply(text);
        }

    } catch (error) {
        console.error("Wiki error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to fetch Wikipedia article.");
    }
});