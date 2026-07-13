// FILE: commands/temp-mail/delmail.js
const { cmd } = require("../../arslan");
const axios = require("axios");

const API_BASE = "https://api.1secmail.com/v1";

cmd({
    pattern: "delmail",
    alias: ["deletemail", "rmmail"],
    desc: "Delete a specific email from temp inbox",
    category: "tools",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, {
    reply, args, sender
}) => {
    try {
        const session = mailSessions.get(sender);
        if (!session) {
            return reply("❌ No temp mail session found.\nUse .tempmail to create one.");
        }

        const id = args[0];
        if (!id) {
            return reply("❌ Please provide a message ID.\nExample: .delmail 123456");
        }

        const [username, domain] = session.email.split('@');

        await reply("⏳ Deleting message...");

        const response = await axios.delete(`${API_BASE}/delete/${username}/${domain}/${id}`);

        // Remove from session
        session.messages = session.messages.filter(msg => msg.id !== parseInt(id));
        session.inboxCount = session.messages.length;

        return reply(`✅ Message ${id} deleted successfully.`);

    } catch (err) {
        console.error("DelMail Error:", err);
        reply("❌ Failed to delete message. Please try again.");
    }
});