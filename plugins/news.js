const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "news",
    alias: ["headlines", "latestnews"],
    react: "📰",
    desc: "Get latest news",
    category: "search",
    use: ".news topic",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let articles = [];
        let source = '';

        // API 1: NewsAPI (Free)
        try {
            const res = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q || 'latest')}&apiKey=YOUR_NEWS_API_KEY`, {
                timeout: 10000
            });
            if (res.data && res.data.articles && res.data.articles.length > 0) {
                articles = res.data.articles.slice(0, 5);
                source = 'NewsAPI';
            }
        } catch (e) {}

        // API 2: CyberZone News
        if (articles.length === 0) {
            try {
                const res = await axios.get(`https://api.cyberzone.tech/news?q=${encodeURIComponent(q || 'world')}`, {
                    timeout: 10000
                });
                if (res.data && res.data.articles && res.data.articles.length > 0) {
                    articles = res.data.articles.slice(0, 5);
                    source = 'CyberZone API';
                }
            } catch (e) {}
        }

        if (articles.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ No news found${q ? ` for: *${q}*` : ''}\n\n💡 Tips:\n• Try a specific topic\n• Check spelling\n• Use .news technology`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        let text = `📰 *LATEST NEWS*\n\n${q ? `📌 *Topic:* ${q}\n` : ''}📡 *Source:* ${source}\n📊 *Articles:* ${articles.length}\n\n`;

        articles.forEach((article, i) => {
            text += `${i+1}. *${article.title || 'Untitled'}*\n`;
            if (article.source && article.source.name) {
                text += `   📰 ${article.source.name}\n`;
            }
            if (article.description) {
                text += `   📝 ${article.description.substring(0, 150)}...\n`;
            }
            if (article.url) {
                text += `   🔗 ${article.url}\n`;
            }
            text += `\n`;
        });

        reply(text);

    } catch (error) {
        console.error("News error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to fetch news.");
    }
});