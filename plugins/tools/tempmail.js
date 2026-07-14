// FILE: commands/temp-mail/tempmail.js
const { cmd } = require("../arslan");
const axios = require("axios");

// Temp Mail API - Using 1secmail.com (Free)
const API_BASE = "https://api.1secmail.com/v1";

// Store user sessions
const mailSessions = new Map();

cmd({
    pattern: "tempmail",
    alias: ["tm", "tempemail"],
    desc: "Create a temporary email address",
    category: "tools",
    react: "📧",
    filename: __filename
}, async (conn, mek, m, {
    reply, args, sender
}) => {
    try {
        // Check if user already has a session
        if (mailSessions.has(sender)) {
            const session = mailSessions.get(sender);
            return reply(`📧 *TEMP MAIL SESSION*\n\n📨 Email: ${session.email}\n📬 Inbox: ${session.inboxCount || 0} messages\n\n📋 Commands:\n.tempinbox - View inbox\n.readmail <id> - Read message\n.delmail <id> - Delete message`);
        }

        const action = args[0]?.toLowerCase();
        
        if (action === 'create' || !action) {
            // Generate random email
            const domains = ['1secmail.com', '1secmail.net', '1secmail.org'];
            const domain = domains[Math.floor(Math.random() * domains.length)];
            const username = Math.random().toString(36).substring(2, 10);
            const email = `${username}@${domain}`;

            mailSessions.set(sender, {
                email: email,
                messages: [],
                inboxCount: 0
            });

            return reply(`📧 *TEMP MAIL CREATED*\n\n📨 Email: ${email}\n\n📋 Commands:\n.tempinbox - Check inbox\n.readmail <id> - Read message\n.delmail <id> - Delete message\n\n💡 Use .tempmail delete to remove session`);
        }

        if (action === 'delete') {
            mailSessions.delete(sender);
            return reply("✅ Temp mail session deleted.");
        }

        return reply(`❌ Unknown command.\n\n📋 Available:\n.tempmail - Create new email\n.tempmail create - Create new email\n.tempmail delete - Delete session`);

    } catch (err) {
        console.error("TempMail Error:", err);
        reply("❌ Failed to create temp mail.");
    }
});