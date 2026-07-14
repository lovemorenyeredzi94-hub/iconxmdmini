const { cmd } = require('../../arslan');
const axios = require('axios');

cmd({
    pattern: "pair",
    alias: ["getpair", "pairing", "clone"],
    react: "✅",
    desc: "Get pairing code for WhatsApp",
    category: "general",
    use: ".pair 263XXXXXXXXX",
    filename: __filename
}, async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply }) => {
    try {
        // Check if in group
        if (isGroup) {
            return await reply("❌ This command only works in private chat. Please message me directly.");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Extract phone number
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply(`❌ Invalid phone number format!\n\nPlease use: \`.pair 263000000000\`\n(Without + sign)`);
        }

        // Check if already connected
        const activeSockets = global.activeSockets || new Map();
        if (activeSockets.has(phoneNumber)) {
            return await reply(`✅ *Already Connected!*\n\n📱 Number: ${phoneNumber}\n⚡ Status: Active`);
        }

        // Send status message
        await reply(`🔐 *Requesting pairing code for:* ${phoneNumber}\n⏳ Please wait...`);

        // Try to use internal arslanPair
        let pairingCode = null;
        let usedInternal = false;

        // Check if arslanPair is available globally
        if (typeof global.arslanPair === 'function') {
            try {
                // Create a promise that resolves when pairing code is generated
                const pairPromise = new Promise((resolve, reject) => {
                    // Store the resolve function globally for the arslanPair to use
                    global._pairResolve = resolve;
                    
                    // Set a timeout
                    setTimeout(() => {
                        reject(new Error('Pairing timeout after 60 seconds'));
                    }, 60000);
                });

                // Call arslanPair with mock response
                const mockRes = {
                    headersSent: false,
                    json: (data) => {
                        if (data && data.code) {
                            global._pairResolve(data.code);
                        }
                    },
                    send: (data) => {
                        if (data && data.code) {
                            global._pairResolve(data.code);
                        }
                    },
                    status: () => mockRes,
                    setHeader: () => {}
                };

                await global.arslanPair(phoneNumber, mockRes);
                pairingCode = await pairPromise;
                usedInternal = true;
                
                // Clean up
                delete global._pairResolve;
                
            } catch (error) {
                console.error('Internal pairing failed:', error.message);
                usedInternal = false;
            }
        }

        // If internal pairing didn't work, use external API as fallback
        if (!pairingCode) {
            try {
                const response = await axios.get(`https://arslan-mini-bot-e4ec84c138eb.herokuapp.com/code?number=${encodeURIComponent(phoneNumber)}`, {
                    timeout: 30000
                });
                
                if (response.data && response.data.code) {
                    pairingCode = response.data.code;
                } else {
                    throw new Error('No code received');
                }
            } catch (error) {
                console.error('External pairing failed:', error.message);
                return await reply(`❌ Failed to get pairing code.\n\nPlease try again later or use the website to pair.`);
            }
        }

        // Send success message with image
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/prkkzj.png" },
            caption: `- *⍴ᥲіrіᥒg ᥴ᥆ძᥱ*\n\nNotification has been sent to your WhatsApp. Please check your phone and copy this code to pair it and get your session id.\n\n*🔢 Pairing Code*: *${pairingCode}*\n\n> *Copy it from below message 👇🏻*`
        }, { quoted: m });

        // Send clean code separately
        await reply(`*${pairingCode}*`);
        
        // Add ✅ reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("Pair command error:", error);
        await reply(`❌ Error: ${error.message || 'Please try again later.'}`);
    }
});

// ============ CHECK CONNECTION STATUS ============
cmd({
    pattern: "pairstatus",
    alias: ["pstatus", "checkpair", "active"],
    react: "📊",
    desc: "Check pairing status",
    category: "general",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const activeSockets = global.activeSockets || new Map();
        const health = global.connectionHealth || new Map();
        
        if (activeSockets.size === 0) {
            return reply("📊 *No active connections*\n\nUse `.pair` to connect a number.");
        }
        
        let msg = "📊 *CONNECTION STATUS*\n\n";
        let count = 0;
        
        for (const [number, socket] of activeSockets) {
            const info = health?.get(number);
            const isHealthy = info?.isHealthy !== undefined ? info.isHealthy : true;
            const status = isHealthy ? '✅ Active' : '⚠️ Unhealthy';
            const uptime = info?.createdAt ? Math.floor((Date.now() - info.createdAt) / 1000) : 0;
            
            const minutes = Math.floor(uptime / 60);
            const hours = Math.floor(minutes / 60);
            const timeStr = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
            
            msg += `${++count}. 📱 *${number}*\n`;
            msg += `   Status: ${status}\n`;
            msg += `   Uptime: ${timeStr}\n\n`;
        }
        
        msg += `📌 Total: ${activeSockets.size} connection(s)`;
        reply(msg);
        
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});

// ============ DISCONNECT COMMAND ============
cmd({
    pattern: "disconnect",
    alias: ["logout", "remove", "unpair"],
    react: "🔌",
    desc: "Disconnect a number",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ Owner only!");
        
        const number = args[0]?.replace(/[^0-9]/g, '');
        if (!number) {
            return reply(`⚠️ Please provide a number to disconnect.\nExample: .disconnect 263XXXXXXXXX`);
        }
        
        const activeSockets = global.activeSockets || new Map();
        if (!activeSockets.has(number)) {
            return reply(`❌ Number ${number} is not connected.`);
        }
        
        // Disconnect the number
        const socket = activeSockets.get(number);
        try {
            socket.ws?.close();
            socket.ev?.removeAllListeners();
        } catch (e) {}
        
        activeSockets.delete(number);
        
        if (global.connectionHealth) {
            global.connectionHealth.delete(number);
        }
        
        // Remove from MongoDB if function exists
        if (typeof global.removeNumberFromMongoDB === 'function') {
            try {
                await global.removeNumberFromMongoDB(number);
            } catch (e) {}
        }
        
        reply(`✅ Successfully disconnected: ${number}`);
        
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});
