const { cmd } = require('../arslan');

cmd({
    pattern: "setdesc",
    alias: ["gdesc", "groupdesc"],
    react: "📝",
    desc: "Change group description",
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
        if (!isBotAdmins) return reply("⚠️ I need to be admin to change description.");

        if (!q) return reply("❓ Provide a new group description!\nExample: .setdesc Welcome to our group!");

        await conn.groupUpdateDescription(from, q);
        reply(`✅ Group description updated!`);
    } catch (error) {
        console.error("Set desc error:", error);
        reply("❌ Failed to change group description.");
    }
});