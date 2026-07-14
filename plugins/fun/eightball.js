const { cmd } = require('../arslan');

cmd({
    pattern: "8ball",
    alias: ["magic8ball", "eightball"],
    react: "🔮",
    desc: "Ask the magic 8 ball a question",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, q }) => {
    try {
        if (!q) {
            return reply(`🔮 *MAGIC 8 BALL*\n\nAsk me anything!\nExample: .8ball Will I win the lottery?`);
        }

        const responses = [
            "🎯 Yes, definitely!",
            "🔮 It is certain.",
            "✅ Without a doubt.",
            "🌅 You may rely on it.",
            "💫 Most likely.",
            "🤔 Outlook good.",
            "🌈 Yes, in time.",
            "❓ Ask again later.",
            "🤷 Cannot predict now.",
            "🌙 Concentrate and ask again.",
            "❌ Don't count on it.",
            "😬 My sources say no.",
            "😤 Outlook not so good.",
            "😢 Very doubtful.",
            "🎲 Better not tell you now.",
            "⭐ It is decidedly so."
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];
        
        reply(`🔮 *Magic 8 Ball*\n\n❓ Question: ${q}\n\n✨ Answer: ${answer}`);
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});