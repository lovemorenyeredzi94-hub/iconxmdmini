const { cmd } = require('../../arslan');
const { generateDesignedMenu } = require('../../arslan');

cmd({
    pattern: "menu",
    alias: ["help", "commands"],
    desc: "Show all bot commands",
    category: "general",
    react: "📋"
},
async(conn, mek, m, { reply, prefix }) => {
    const menu = generateDesignedMenu(prefix);
    
    // Split if too long
    if (menu.length > 4000) {
        const parts = menu.match(/[\s\S]{1,3500}/g) || [menu];
        for (const part of parts) {
            await reply(part);
        }
    } else {
        await reply(menu);
    }
});