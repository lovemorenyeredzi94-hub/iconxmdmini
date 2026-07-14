const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "google",
    alias: ["g", "search", "gsearch"],
    react: "🔍",
    desc: "Search Google",
    category: "search",
    use: ".google query",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`🔍 *GOOGLE SEARCH*\n\nSearch anything on Google!\nExample: .google WhatsApp bot\n\n💡 Tips:\n• Use specific keywords\n• Use quotes for exact match\n• Try .google site:example.com`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let results = null;
        let source = '';

        // API 1: CyberZone Google Search
        try {
            const res = await axios.get(`https://api.cyberzone.tech/google?q=${encodeURIComponent(q)}`, {
                timeout: 10000
            });
            if (res.data && res.data.results) {
                results = res.data.results;
                source = 'CyberZone API';
            }
        } catch (e) {}

        // API 2: Custom Google Search (Fallback)
        if (!results) {
            try {
                const res = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`, {
                    timeout: 10000
                });
                if (res.data && res.data.AbstractText) {
                    results = [{ title: 'DuckDuckGo', snippet: res.data.AbstractText, link: res.data.AbstractURL }];
                    source = 'DuckDuckGo';
                }
            } catch (e) {}
        }

        if (!results || results.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No results found for: *${q}*\n\n💡 Tips:\n• Try different keywords\n• Check spelling\n• Use specific terms`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        let text = `🔍 *GOOGLE SEARCH*\n\n📌 *Query:* ${q}\n📡 *Source:* ${source}\n📊 *Results:* ${results.length}\n\n`;

        const topResults = results.slice(0, 5);
        topResults.forEach((result, i) => {
            text += `${i+1}. *${result.title || 'Untitled'}*\n`;
            text += `   📝 ${result.snippet || 'No description'}\n`;
            text += `   🔗 ${result.link || 'No link'}\n\n`;
        });

        if (results.length > 5) {
            text += `📌 *More results:* ${results.length - 5} more found`;
        }

        // Split if too long
        if (text.length > 4000) {
            const parts = text.match(/[\s\S]{1,3500}/g) || [text];
            for (const part of parts) {
                await reply(part);
            }
        } else {
            await reply(text);
        }

    } catch (error) {
        console.error("Google error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to search. Please try again.");
    }
});