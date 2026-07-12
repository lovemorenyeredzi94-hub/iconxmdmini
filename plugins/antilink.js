const { cmd } = require('../arslan');
const {
    getAntilinkSettings,
    setAntilinkStatus,
    setAntilinkAction,
    setWarnCount,
    getUserWarns,
    resetUserWarns,
    getGroupWarns,
    resetAllWarns,
    checkAntilink
} = require('../lib/database');

// ============ COMMAND HANDLERS ============

cmd({
    pattern: "antilink",
    alias: ["nolink", "linkguard"],
    desc: "Anti-link system management",
    category: "group",
    react: "🔗"
},
async(conn, mek, m, { args, isAdmin, isGroup, reply, from, isBotAdmins }) => {
    if (!isGroup) return reply("*⚠️ THIS COMMAND IS ONLY FOR GROUPS!*");
    if (!isAdmin) return reply("*⚠️ ONLY ADMINS CAN USE THIS COMMAND!*");
    if (!isBotAdmins) return reply("*⚠️ I NEED TO BE ADMIN TO USE THIS FEATURE!*");

    const action = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    const settings = await getAntilinkSettings(from);
    const status = settings.status;
    const currentAction = settings.action;
    const warnCount = settings.warnCount;

    if (!action) {
        const statusText = status ? '✅ *ACTIVE*' : '❌ *INACTIVE*';
        const actionText = {
            delete: '🗑️ DELETE',
            warn: '⚠️ WARN',
            kick: '👢 KICK'
        }[currentAction] || '🗑️ DELETE';

        const help = `📌 *ANTI-LINK SYSTEM*

${statusText}
📋 *Action:* ${actionText}
⚠️ *Max Warnings:* ${warnCount}

*Commands:*
➤ ${m.prefix}antilink on - Activate
➤ ${m.prefix}antilink off - Deactivate
➤ ${m.prefix}antilink delete - Set delete action
➤ ${m.prefix}antilink warn - Set warn action
➤ ${m.prefix}antilink kick - Set kick action
➤ ${m.prefix}antilink warncount <number> - Set max warnings
➤ ${m.prefix}resetwarn @user - Reset user warnings
➤ ${m.prefix}warns - View all warnings`;

        return reply(help);
    }

    try {
        if (action === 'on' || action === 'enable') {
            await setAntilinkStatus(from, true);
            await reply("*✅ ANTI-LINK SYSTEM ACTIVATED!*");
        } 
        else if (action === 'off' || action === 'disable') {
            await setAntilinkStatus(from, false);
            await reply("*❌ ANTI-LINK SYSTEM DEACTIVATED!*");
        } 
        else if (action === 'delete' || action === 'warn' || action === 'kick') {
            await setAntilinkAction(from, action);
            await reply(`*✅ ACTION SET TO: ${action.toUpperCase()}*`);
        } 
        else if (action === 'warncount') {
            if (!value || isNaN(value) || parseInt(value) < 1) {
                return reply(`*⚠️ PLEASE PROVIDE A VALID NUMBER!*\nExample: ${m.prefix}antilink warncount 5`);
            }
            await setWarnCount(from, parseInt(value));
            await reply(`*✅ MAX WARNINGS SET TO: ${value}*`);
        } 
        else {
            reply(`*❌ UNKNOWN COMMAND!*\nUse ${m.prefix}antilink for help.`);
        }
    } catch (error) {
        reply(`*❌ ERROR: ${error.message}*`);
    }
});

cmd({
    pattern: "resetwarn",
    alias: ["resetwarning", "clearwarn"],
    desc: "Reset user warnings",
    category: "group",
    react: "🔄"
},
async(conn, mek, m, { isAdmin, isGroup, reply, from, mentionedJid }) => {
    if (!isGroup) return reply("*⚠️ THIS COMMAND IS ONLY FOR GROUPS!*");
    if (!isAdmin) return reply("*⚠️ ONLY ADMINS CAN USE THIS COMMAND!*");

    if (!mentionedJid || mentionedJid.length === 0) {
        return reply(`*⚠️ MENTION A USER TO RESET THEIR WARNINGS!*\nExample: ${m.prefix}resetwarn @user`);
    }

    const user = mentionedJid[0];
    const userWarns = await getUserWarns(from, user);
    
    if (userWarns > 0) {
        await resetUserWarns(from, user);
        await reply(`*✅ WARNINGS RESET FOR @${user.split('@')[0]}*`, { mentions: [user] });
    } else {
        await reply(`*ℹ️ @${user.split('@')[0]} HAS NO WARNINGS*`, { mentions: [user] });
    }
});

cmd({
    pattern: "warns",
    alias: ["warnings", "checkwarn"],
    desc: "Check user warnings",
    category: "group",
    react: "📊"
},
async(conn, mek, m, { isAdmin, isGroup, reply, from }) => {
    if (!isGroup) return reply("*⚠️ THIS COMMAND IS ONLY FOR GROUPS!*");
    if (!isAdmin) return reply("*⚠️ ONLY ADMINS CAN USE THIS COMMAND!*");

    const groupWarns = await getGroupWarns(from);
    
    if (!groupWarns || Object.keys(groupWarns).length === 0) {
        return reply("*ℹ️ NO WARNINGS IN THIS GROUP*");
    }

    let warnList = "*📊 WARNING LIST*\n\n";
    let totalWarns = 0;
    
    for (const [user, count] of Object.entries(groupWarns)) {
        if (count > 0) {
            const username = user.split('@')[0];
            warnList += `👤 @${username}: ${count} warning${count > 1 ? 's' : ''}\n`;
            totalWarns += count;
        }
    }
    
    warnList += `\n📊 *Total Warnings:* ${totalWarns}`;
    warnList += `\n👥 *Users Warned:* ${Object.keys(groupWarns).length}`;

    await reply(warnList, { mentions: Object.keys(groupWarns) });
});

cmd({
    pattern: "resetallwarns",
    alias: ["clearallwarns", "resetall"],
    desc: "Reset all warnings in group",
    category: "group",
    react: "🗑️"
},
async(conn, mek, m, { isAdmin, isGroup, reply, from }) => {
    if (!isGroup) return reply("*⚠️ THIS COMMAND IS ONLY FOR GROUPS!*");
    if (!isAdmin) return reply("*⚠️ ONLY ADMINS CAN USE THIS COMMAND!*");
    
    const groupWarns = await getGroupWarns(from);
    if (!groupWarns || Object.keys(groupWarns).length === 0) {
        return reply("*ℹ️ NO WARNINGS TO RESET*");
    }
    
    await resetAllWarns(from);
    reply("*✅ ALL WARNINGS HAVE BEEN RESET!*");
});

cmd({
    pattern: "antilinksettings",
    alias: ["alsettings", "linksettings"],
    desc: "View antilink settings",
    category: "group",
    react: "⚙️"
},
async(conn, mek, m, { isAdmin, isGroup, reply, from }) => {
    if (!isGroup) return reply("*⚠️ THIS COMMAND IS ONLY FOR GROUPS!*");
    
    const settings = await getAntilinkSettings(from);
    const groupWarns = await getGroupWarns(from);
    const totalWarns = Object.values(groupWarns).reduce((a, b) => a + b, 0);
    const warnedUsers = Object.keys(groupWarns).length;
    
    const settingsText = `⚙️ *ANTI-LINK SETTINGS*

📌 Status: ${settings.status ? '✅ ACTIVE' : '❌ INACTIVE'}
🎯 Action: ${settings.action.toUpperCase()}
⚠️ Max Warnings: ${settings.warnCount}
👥 Users Warned: ${warnedUsers}
📊 Total Warnings: ${totalWarns}

${settings.status ? '🛡️ Protection is active!' : '🔓 Protection is inactive!'}`;
    
    reply(settingsText);
});

// ============ AUTO-LINK DETECTION ============
// This runs automatically for every message
// Using the 'body' event from your bot

module.exports = {
    // This will make it run on every message
    on: 'body',
    function: async (conn, mek, m, { from, isGroup, sender, groupMetadata, isBotAdmins, isAdmin }) => {
        try {
            // Only process in groups
            if (!isGroup) return;
            
            // Skip if sender is admin or bot
            if (isAdmin || sender === conn.user.id) return;
            
            // Skip if bot is not admin
            if (!isBotAdmins) return;
            
            // Get text from message
            let text = '';
            const msgType = Object.keys(mek.message)[0];
            
            if (msgType === 'conversation') {
                text = mek.message.conversation;
            } else if (msgType === 'extendedTextMessage') {
                text = mek.message.extendedTextMessage.text;
            } else if (msgType === 'imageMessage') {
                text = mek.message.imageMessage.caption || '';
            } else if (msgType === 'videoMessage') {
                text = mek.message.videoMessage.caption || '';
            } else if (msgType === 'documentMessage') {
                text = mek.message.documentMessage.caption || '';
            }
            
            if (!text) return;
            
            // Check for links
            const result = await checkAntilink(from, sender, text);
            
            if (result) {
                // Delete the message
                if (mek.key) {
                    try {
                        await conn.sendMessage(from, { delete: mek.key });
                    } catch (e) {
                        console.error('Failed to delete message:', e);
                    }
                }
                
                // Send notification
                const mention = `@${sender.split('@')[0]}`;
                let notificationText = `${result.message}\n${mention}`;
                
                // Handle different actions
                if (result.action === 'delete') {
                    await conn.sendMessage(from, {
                        text: notificationText,
                        mentions: [sender]
                    });
                } 
                else if (result.action === 'warn') {
                    const warns = result.warns || 0;
                    const maxWarns = result.maxWarns || 3;
                    notificationText = `${result.message}\n${mention}\n\n⚠️ Warning ${warns}/${maxWarns}`;
                    await conn.sendMessage(from, {
                        text: notificationText,
                        mentions: [sender]
                    });
                } 
                else if (result.action === 'kick') {
                    try {
                        await conn.groupParticipantsUpdate(from, [sender], 'remove');
                        await conn.sendMessage(from, {
                            text: notificationText,
                            mentions: [sender]
                        });
                    } catch (e) {
                        console.error('Failed to kick user:', e);
                    }
                }
            }
            
        } catch (error) {
            console.error('Antilink detection error:', error);
        }
    }
};
