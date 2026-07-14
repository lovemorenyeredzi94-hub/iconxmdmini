const { cmd } = require('../arslan');
cmd({
    pattern: "seticon",
    alias: ["gicon", "groupicon"],
    react: "🖼️",
    desc: "Change group icon (reply to image)",
    category: "admin",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isGroup,
    reply,
    quoted,
    isAdmins,
    isBotAdmins
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isAdmins) return reply("⚠️ Only group admins can use this.");
        if (!isBotAdmins) return reply("⚠️ I need to be admin to change icon.");

        if (!quoted) return reply("❓ Reply to an image to set as group icon!\nExample: Reply to an image with .seticon");

        const msg = quoted.message;
        if (!msg.imageMessage) return reply("❌ Please reply to an image!");

        const buffer = await quoted.download();
        if (!buffer) return reply("❌ Failed to download image.");

        await conn.groupUpdateProfilePicture(from, buffer);
        reply("✅ Group icon updated successfully!");
    } catch (error) {
        console.error("Set icon error:", error);
        reply("❌ Failed to change group icon.");
    }
});