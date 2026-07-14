const { cmd, commands, getCategorizedCommands, categories } = require("../arslan");
const moment = require("moment-timezone");
const { fakevCard } = require('../lib/fakevCard');

cmd({
    pattern: "menu",
    alias: ["commandlist", "allmenu", "help", "cmds"],
    desc: "Show all bot commands with categories",
    category: "general",  // ← This will be auto-detected from folder
    filename: __filename,
}, async (conn, mek, m, { reply, prefix, args }) => {
    try {
        // Use the new categorized commands
        const categorized = getCategorizedCommands();
        let totalCommands = 0;
        let menuText = "";

        // Build menu with categories
        for (const [category, cmds] of Object.entries(categorized)) {
            const catInfo = categories[category] || { 
                icon: '📁', 
                name: category.toUpperCase(),
                emoji: '📌'
            };
            
            // Count commands in this category
            const cmdCount = cmds.length;
            totalCommands += cmdCount;
            
            // Category header
            menuText += `\n🧚‍♀️ *${catInfo.icon} ${catInfo.name}* (${cmdCount})\n`;
            
            // Sort commands alphabetically
            const sortedCmds = [...cmds].sort((a, b) => a.pattern.localeCompare(b.pattern));
            
            // List commands with aliases
            for (const cmd of sortedCmds) {
                const aliases = cmd.alias && cmd.alias.length > 0 
                    ? ` (${cmd.alias.join(', ')})` 
                    : '';
                
                // Show description if available
                const desc = cmd.desc ? ` - ${cmd.desc}` : '';
                
                menuText += `💫 ${prefix}${cmd.pattern}${aliases}${desc}\n`;
            }
        }

        // Time and date
        const time = moment().tz("Africa/Zimbabwe").format("HH:mm:ss");
        const date = moment().tz("Africa/Zimbabwe").format("dddd, MMMM Do YYYY");

        // Build final menu
        const caption = `
╭━━━《 *ɪᴄᴏɴ-x ᴍᴅ* 》━━━┈⊷
┃ ✦╭─────────────┈⊷
┃ ✦│▸ Total Commands : *${totalCommands}*
┃ ✦│▸ Categories     : *${Object.keys(categorized).length}*
┃ ✦│▸ Time           : ${time}
┃ ✦│▸ Date           : ${date}
┃ ✦│▸ Platform       : ${process.env.RENDER ? 'Render' : 'Local'}
┃ ✦╰─────────────┈⊷
╰━━━━━━━━━━━━┈⊷
${menuText}
`.trim();

        // Send menu with image
        await conn.sendMessage(m.chat, {
            image: { url: "https://files.catbox.moe/ed0968.jpg" },
            caption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [m.sender],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363426745883545@newsletter",
                    newsletterName: "𝗜𝗖𝗢𝗡-𝗫 𝗠𝗗 𝗨𝗣𝗗𝗔𝗧𝗘𝗦",
                    serverMessageId: 2,
                },
            },
        }, { quoted: fakevCard });

    } catch (err) {
        console.error("AllMenu Error:", err);
        reply("❌ Error while generating menu.");
    }
});