const { cmd } = require('../arslan');

cmd({
    pattern: "creator",
    alias: ["about", "info"],
    react: "👨‍💻",
    desc: "Bot creator information",
    category: "misc",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const info = `👨‍💻 *BOT CREATOR*\n\n` +
            `🤖 *Name:* ICON-X MD\n` +
            `👤 *Creator:* MR ELEPHANT\n` +
            `📡 *Version:* 1.0.0\n` +
            `📅 *Created:* 2026\n` +
            `💡 *Prefix:* .\n` +
            `📚 *Commands:* Multiple\n\n` +
            `🌟 *Features:*\n` +
            `┃ • AI Chat\n` +
            `┃ • Media Download\n` +
            `┃ • Group Management\n` +
            `┃ • Fun Commands\n` +
            `┃ • Search Tools\n` +
            `┃ • And more...\n\n` +
            `💬 *Support:* Contact @${m.sender.split('@')[0]}`;

        reply(info, { mentions: [m.sender] });
    } catch (error) {
        console.error("Creator error:", error);
        reply("❌ Failed to get creator info.");
    }
});