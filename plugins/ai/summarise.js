const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "summarize",
    alias: ["sum", "summary", "short"],
    react: "📝",
    desc: "Summarize long text",
    category: "ai",
    use: ".summarize your long text here",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q || q.length < 20) {
            return reply(`📝 *TEXT SUMMARIZER*\n\nSummarize long text into key points!\nExample: .summarize Your long text here...\n\n💡 Minimum 20 characters required.`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        let summary = null;
        let source = '';

        // API 1: CyberZone Summary
        try {
            const res = await axios.get(`https://api.cyberzone.tech/ai/summarize?text=${encodeURIComponent(q)}`, {
                timeout: 15000
            });
            if (res.data && res.data.summary) {
                summary = res.data.summary;
                source = '🧠 CyberZone AI';
            }
        } catch (e) {}

        // API 2: Custom summary (fallback)
        if (!summary) {
            // Simple extractive summarization
            const sentences = q.match(/[^.!?]+[.!?]+/g) || [q];
            if (sentences.length > 3) {
                const keySentences = sentences.slice(0, Math.ceil(sentences.length / 3));
                summary = keySentences.join(' ');
            } else {
                summary = q.substring(0, 300) + '...';
            }
            source = '📊 Local AI';
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        const originalLength = q.length;
        const summaryLength = summary.length;
        const reduction = Math.round((1 - summaryLength / originalLength) * 100);

        reply(`📝 *TEXT SUMMARY*\n\n📊 Original Length: ${originalLength} characters\n📊 Summary Length: ${summaryLength} characters\n📉 Reduction: ${reduction}%\n📡 Source: ${source}\n\n📝 *Summary:*\n${summary}`);

    } catch (error) {
        console.error("Summarize error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to summarize text.");
    }
});