// FILE: commands/temp-mail/tempinbox.js
const { cmd } = require("../../arslan");
const axios = require("axios");

const API_BASE = "https://api.1secmail.com/v1";

cmd({
    pattern: "tempinbox",
    alias: ["inbox", "mailinbox"],
    desc: "Check temporary email inbox",
    category: "tools",
    react: "📬",
    filename: __filename
}, async (conn, mek, m, {
    reply, sender
}) => {
    try {
        const session = mailSessions.get(sender);
        if (!session) {
            return reply("❌ No temp mail session found.\nUse .tempmail to create one.");
        }

        const [username, domain] = session.email.split('@');
        
        await reply("⏳ Fetching inbox...");

        const response = await axios.get(`${API_BASE}/messages/${username}/${domain}`);

        if (!response.data || response.data.length === 0) {
            return reply(`📬 *INBOX*\n\n📨 ${session.email}\n📭 No messages.`);
        }

        const messages = response.data;
        session.messages = messages;
        session.inboxCount = messages.length;

        let text = `📬 *INBOX*\n\n📨 ${session.email}\n📬 ${messages.length} messages\n\n`;

        messages.slice(0, 10).forEach((msg, i) => {
            const date = new Date(msg.date).toLocaleString();
            text += `${i+1}. 📩 ${msg.subject || 'No subject'}\n`;
            text += `   👤 From: ${msg.from}\n`;
            text += `   📅 ${date}\n`;
            text += `   📋 ID: ${msg.id}\n\n`;
        });

        text += `📋 Commands:\n.readmail <id> - Read message\n.delmail <id> - Delete message`;

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("TempInbox Error:", err);
        reply("❌ Failed to fetch inbox. Please try again.");
    }
});