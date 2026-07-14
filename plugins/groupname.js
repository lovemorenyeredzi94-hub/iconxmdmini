const { cmd } = require('../arslan');

cmd({
    pattern: "setname",
    alias: ["gname", "groupname"],
    react: "✏️",
    desc: "Change group name",
    category: "admin",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isGroup,
    reply,
    q,
    isAdmins,
    isBotAdmins
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isAdmins) return reply("⚠️ Only group admins can use this.");
        if (!isBotAdmins) return reply("⚠️ I need to be admin to change name.");

        if (!q) return reply("❓ Provide a new group name!\nExample: .setname My Awesome Group");

        await conn.groupUpdateSubject(from, q);
        reply(`✅ Group name changed to: *${q}*`);
    } catch (error) {
        console.error("Set name error:", error);
        reply("❌ Failed to change group name.");
    }
});