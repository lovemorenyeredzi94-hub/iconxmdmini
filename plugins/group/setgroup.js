const { cmd } = require('../arslan');

cmd({
    pattern: "setgroup",
    alias: ["groupsetting", "gsetting"],
    react: "⚙️",
    desc: "Quick group settings",
    category: "admin",
    filename: __filename
}, async (conn, mek, m, {
    from,
    isGroup,
    reply,
    args,
    isAdmins,
    isBotAdmins
}) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups.");
        if (!isAdmins) return reply("⚠️ Only group admins can use this.");
        if (!isBotAdmins) return reply("⚠️ I need to be admin to change settings.");

        const action = args[0]?.toLowerCase();

        if (!action) {
            return reply(`⚙️ *GROUP SETTINGS*\n\nAvailable settings:\n\n🔇 .setgroup mute - Mute group\n🔊 .setgroup unmute - Unmute group\n✏️ .setgroup open - Allow anyone to join\n🔒 .setgroup closed - Require admin approval\n\nExample: .setgroup mute`);
        }

        switch(action) {
            case 'mute':
                await conn.groupSettingUpdate(from, 'announcement');
                reply("🔇 Group muted! Only admins can send messages.");
                break;
            case 'unmute':
                await conn.groupSettingUpdate(from, 'not_announcement');
                reply("🔊 Group unmuted! Everyone can send messages.");
                break;
            case 'open':
                await conn.groupSettingUpdate(from, 'unlocked');
                reply("🔓 Group opened! Anyone can join without approval.");
                break;
            case 'closed':
                await conn.groupSettingUpdate(from, 'locked');
                reply("🔒 Group closed! Admin approval needed to join.");
                break;
            default:
                reply(`❌ Unknown setting: ${action}\n\nAvailable: mute, unmute, open, closed`);
        }
    } catch (error) {
        console.error("Set group error:", error);
        reply("❌ Failed to change group setting.");
    }
});