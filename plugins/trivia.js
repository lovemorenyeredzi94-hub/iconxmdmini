const { cmd } = require('../../arslan');
const axios = require('axios');

cmd({
    pattern: "trivia",
    alias: ["quiz", "triviaquiz"],
    react: "🧠",
    desc: "Answer a trivia question",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', {
            timeout: 10000
        });

        if (!response.data || !response.data.results || response.data.results.length === 0) {
            return reply("❌ No trivia questions available. Try again!");
        }

        const question = response.data.results[0];
        const options = [...question.incorrect_answers, question.correct_answer];
        const shuffled = options.sort(() => Math.random() - 0.5);

        const emojis = ['🔴', '🟢', '🔵', '🟡'];
        let text = `🧠 *TRIVIA QUIZ*\n\n`;
        text += `📚 Category: ${question.category}\n`;
        text += `📊 Difficulty: ${question.difficulty.toUpperCase()}\n\n`;
        text += `❓ ${question.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'")}\n\n`;
        text += `*Options:*\n`;
        shuffled.forEach((opt, i) => {
            text += `${emojis[i]} ${opt.replace(/&quot;/g, '"').replace(/&#039;/g, "'")}\n`;
        });
        text += `\n💡 Answer: ${question.correct_answer}`;

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply(text);

    } catch (error) {
        console.error("Trivia error:", error);
        reply("❌ Failed to fetch trivia. Try again!");
    }
});