// FILE: commands/group/openclose.js
const { cmd } = require("../../arslan");
const { fakevCard } = require("../../lib/fakevCard");

cmd({
    pattern: "open",
    alias: ["opengc", "unlockgc"],
    desc: "Open group (allow all members to send messages)",
    category: "group",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights.");

        await conn.groupSettingUpdate(from, "announcement", "off");
        reply("🔓 Group has been *OPENED*.\n\nAll members can now send messages.");

    } catch (err) {
        console.error("Open Error:", err);
        reply("❌ Failed to open group.");
    }
});

cmd({
    pattern: "close",
    alias: ["closegc", "lockgc"],
    desc: "Close group (only admins can send messages)",
    category: "group",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, reply
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights.");

        await conn.groupSettingUpdate(from, "announcement", "on");
        reply("🔒 Group has been *CLOSED*.\n\nOnly admins can send messages.");

    } catch (err) {
        console.error("Close Error:", err);
        reply("❌ Failed to close group.");
    }
});

cmd({
    pattern: "closetime",
    alias: ["closetime", "autoclose"],
    desc: "Close group for a specific time (seconds)",
    category: "group",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, reply, args
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights.");

        const duration = parseInt(args[0]);
        if (!duration || duration < 1 || duration > 86400) {
            return reply("❌ Please provide a valid duration (1-86400 seconds).\nExample: .closetime 3600 (1 hour)");
        }

        await conn.groupSettingUpdate(from, "announcement", "on");
        
        const minutes = Math.floor(duration / 60);
        const hours = Math.floor(minutes / 60);
        const timeStr = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''}`;

        reply(`🔒 Group closed for *${timeStr}*.\n\nOnly admins can send messages.`);

        setTimeout(async () => {
            try {
                await conn.groupSettingUpdate(from, "announcement", "off");
                await conn.sendMessage(from, {
                    text: "🔓 Group has been *OPENED*. All members can now send messages."
                }, { quoted: fakevCard });
            } catch (e) {
                console.error("Auto-open error:", e);
            }
        }, duration * 1000);

    } catch (err) {
        console.error("CloseTime Error:", err);
        reply("❌ Failed to close group for time.");
    }
});

cmd({
    pattern: "opentime",
    alias: ["opentime", "autoopen"],
    desc: "Open group after a specific time (seconds)",
    category: "group",
    react: "⏰",
    filename: __filename
}, async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, reply, args
}) => {
    try {
        if (!isGroup) return reply("❌ This command only works in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights.");

        const duration = parseInt(args[0]);
        if (!duration || duration < 1 || duration > 86400) {
            return reply("❌ Please provide a valid duration (1-86400 seconds).\nExample: .opentime 3600 (1 hour)");
        }

        const minutes = Math.floor(duration / 60);
        const hours = Math.floor(minutes / 60);
        const timeStr = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${minutes} minute${minutes > 1 ? 's' : ''}`;

        reply(`🔓 Group will open in *${timeStr}*.\n\nCurrently closed.`);

        await conn.groupSettingUpdate(from, "announcement", "on");

        setTimeout(async () => {
            try {
                await conn.groupSettingUpdate(from, "announcement", "off");
                await conn.sendMessage(from, {
                    text: "🔓 Group has been *OPENED*. All members can now send messages."
                }, { quoted: fakevCard });
            } catch (e) {
                console.error("Auto-open error:", e);
            }
        }, duration * 1000);

    } catch (err) {
        console.error("OpenTime Error:", err);
        reply("❌ Failed to schedule group open.");
    }
});