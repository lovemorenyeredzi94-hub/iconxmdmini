const { cmd } = require('../arslan');
const config = require('../config');

cmd({
    pattern: "anti-call",
    react: "👑",
    alias: ["anticall"],
    desc: "Enable or disable anti-call feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*THIS COMMAND IS ONLY FOR ME 😎*");

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_CALL = "true";
        return reply("*👑 ANTI-CALL ACTIVATED 👑*");
    } else if (status === "off") {
        config.ANTI_CALL = "false";
        return reply("*👑 ANTI-CALL DEACTIVATED 👑*");
    } else {
        return reply(`*TYPE IT LIKE THIS ☺️*\n *❮ANTI-CALL ON❯*`);
    }
});