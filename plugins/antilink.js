const { cmd } = require("../arslan");

global.antiLink = global.antiLink || {};

cmd({
    pattern: "antilink",
    desc: "Enable or disable anti-link.",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { args, isGroup, isAdmins, reply }) => {

    if (!isGroup) return reply("❌ This command is only for groups.");
    if (!isAdmins) return reply("❌ Admin only.");

    let option = (args[0] || "").toLowerCase();

    if (!option) {
        return reply(`*ANTI LINK SETTINGS*

.antilink on
.antilink off
.antilink warn
.antilink delete
.antilink kick`);
    }

    if (option === "off") {
        delete global.antiLink[m.chat];
        return reply("✅ AntiLink disabled.");
    }

    if (option === "on") {
        global.antiLink[m.chat] = {
            enabled: true,
            action: "delete"
        };
        return reply("✅ AntiLink enabled.\nAction: DELETE");
    }

    if (["warn", "delete", "kick"].includes(option)) {
        global.antiLink[m.chat] = {
            enabled: true,
            action: option
        };

        return reply(`✅ AntiLink enabled.\nAction: ${option.toUpperCase()}`);
    }

    reply("Invalid option.");
});
