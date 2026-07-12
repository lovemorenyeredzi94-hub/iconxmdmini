const { cmd, commands } = require('../arslan');
const config = require('../config');
const os = require('os');

// =================================================================
// 🏓 PING COMMAND (Speedtest Style)
// =================================================================
cmd({
    pattern: "Uptime",
    alias: ["speed"],
    desc: "Check latency and resources",
    category: "general",
    react: "👑"
},
async(conn, mek, m, { from, reply, myquoted }) => {
    try {
        const start = Date.now();
        
        // 1. Waiting message
        const msg = await conn.sendMessage(from, { text: '*T E S T I N G....*' }, { quoted: myquoted });
        
        const end = Date.now();
        const latency = end - start;
        
        // 2. Calculate Memory (RAM)
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const freeMem = (os.freem() / 1024 / 1024).toFixed(0);
        const usedMem = (totalMem - freeMem).toFixed(0);

        // 3. Final Stylish Message
        const pingMsg = `
*👑 ICON-X MD UPTIME 👑* ⚡

* PING :❯  ${latency}ms*

*👑 RAM :❯ ${usedMem}MB / ${totalMem}MB*

`;

        // 4. Edit message (Visual effect)
        await conn.sendMessage(from, { text: pingMsg, edit: msg.key });

    } catch (e) {
        reply("Error: " + e.message);
    }
});

// =================================================================
// 👑 OWNER COMMAND (Business Card)
// =================================================================
cmd({
    pattern: "owner",
    desc: "Contact the creator",
    category: "general",
    react: "👑"
},
async(conn, mek, m, { from, myquoted }) => {
    const ownerNumber = config.OWNER_NUMBER;
    
    // Create a vCard (Contact card)
    const vcard = 'BEGIN:VCARD\n' +
                  'VERSION:3.0\n' +
                  'FN:ArslanMD (Owner)\n' +
                  'ORG:ArslanMD Corp;\n' +
                  `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` +
                  'END:VCARD';

    await conn.sendMessage(from, {
        contacts: {
            displayName: 'ɪᴄᴏɴ-x ᴍᴅ',
            contacts: [{ vcard }]
        }
    }, { quoted: myquoted });
});