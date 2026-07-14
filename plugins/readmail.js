// FILE: commands/temp-mail/readmail.js
const { cmd } = require("../arslan");
const axios = require("axios");

const API_BASE = "https://api.1secmail.com/v1";

cmd({
    pattern: "readmail",
    alias: ["read", "showmail"],
    desc: "Read a specific email from temp inbox",
    category: "tools",
    react: "📖",
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
            return reply("❌ Please provide a message ID.\nExample: .readmail 123456");
        }

        const [username, domain] = session.email.split('@');

        await reply("⏳ Reading message...");

        const response = await axios.get(`${API_BASE}/read/${username}/${domain}/${id}`);

        if (!response.data) {
            return reply("❌ Message not found.");
        }

        const msg = response.data;
        const text = `📖 *EMAIL*\n\n📩 Subject: ${msg.subject || 'No subject'}\n👤 From: ${msg.from}\n📅 Date: ${new Date(msg.date).toLocaleString()}\n\n📝 Content:\n${msg.body || 'No content'}`;

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("ReadMail Error:", err);
        reply("❌ Failed to read message. Please try again.");
    }
});