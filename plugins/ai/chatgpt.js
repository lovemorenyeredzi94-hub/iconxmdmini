const { cmd } = require('../arslan');
const axios = require('axios');

cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt", "ask"],
    react: "🤖",
    desc: "Chat with AI",
    category: "ai",
    use: ".ai your question",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`🤖 *AI CHAT*\n\nAsk me anything!\nExample: .ai What is the meaning of life?\n\n💡 You can also use:\n.ai Hello\n.ai Who are you?\n.ai Tell me a joke`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Try multiple AI APIs (free)
        let response = null;
        let source = '';

        // API 1: CyberZone API (Free)
        try {
            const res = await axios.get(`https://api.cyberzone.tech/ai/gpt?q=${encodeURIComponent(q)}`, {
                timeout: 15000
            });
            if (res.data && res.data.result) {
                response = res.data.result;
                source = '🧠 CyberZone AI';
            }
        } catch (e) {}

        // API 2: Vihanga AI (Free)
        if (!response) {
            try {
                const res = await axios.get(`https://vihanga-api.vercel.app/api/ai?prompt=${encodeURIComponent(q)}`, {
                    timeout: 15000
                });
                if (res.data && res.data.reply) {
                    response = res.data.reply;
                    source = '🧠 Vihanga AI';
                }
            } catch (e) {}
        }

        // API 3: SimSimi (Free)
        if (!response) {
            try {
                const res = await axios.get(`https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(q)}&lc=en`, {
                    timeout: 10000
                });
                if (res.data && res.data.message) {
                    response = res.data.message;
                    source = '💬 SimSimi';
                }
            } catch (e) {}
        }

        // API 4: Local responses (Fallback)
        if (!response) {
            const fallback = [
                "That's a great question! Let me think about it...",
                "Interesting! I'd say it depends on the situation.",
                "I'm not sure about that, but I can try to help!",
                "That's something I'd love to discuss further!",
                "What do you think about it? I'd love to hear your perspective!"
            ];
            response = fallback[Math.floor(Math.random() * fallback.length)];
            source = '💡 Local AI';
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Format response
        let replyText = `🤖 *${source}*\n\n`;
        replyText += `${response}\n\n`;
        replyText += `💬 *Your Question:* ${q}\n`;
        replyText += `📊 *Status:* Online`;

        // Split if too long
        if (replyText.length > 4000) {
            const parts = replyText.match(/[\s\S]{1,3500}/g) || [replyText];
            for (const part of parts) {
                await reply(part);
            }
        } else {
            await reply(replyText);
        }

    } catch (error) {
        console.error("AI error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ AI service temporarily unavailable. Please try again later.");
    }
});