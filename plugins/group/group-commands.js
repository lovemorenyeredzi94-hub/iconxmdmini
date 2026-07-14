const { cmd } = require('../arslan');
const { sleep } = require('../lib/functions');

// ==================== GROUP INFO ====================
cmd({
    pattern: "groupinfo",
    alias: ["ginfo", "gcinfo"],
    desc: "Get detailed group information",
    category: "group",
    react: "📊",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, groupMetadata, isBotAdmins }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");

        const meta = groupMetadata || await conn.groupMetadata(from);
        const participants = meta.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = admins.some(a => a.id === botJid);

        const info = `📊 *GROUP INFORMATION*

👥 *Group Name:* ${meta.subject || 'Unknown'}
🆔 *Group ID:* ${meta.id || from}
👤 *Owner:* @${meta.owner?.split('@')[0] || 'Unknown'}
📅 *Created:* ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString() : 'Unknown'}

👥 *Members:* ${participants.length}
👑 *Admins:* ${admins.length}
🔒 *Restrict:* ${meta.restrict ? '✅ Yes' : '❌ No'}
🔊 *Announce:* ${meta.announce ? '✅ Yes' : '❌ No'}

🤖 *Bot Admin:* ${isBotAdmin ? '✅ Yes' : '❌ No'}
🔗 *Invite Link:* ${meta.inviteCode ? 'https://chat.whatsapp.com/' + meta.inviteCode : 'Not Available'}

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌𝐃』`;

        await conn.sendMessage(from, {
            text: info,
            mentions: [meta.owner, ...admins.map(a => a.id)]
        }, { quoted: mek });

    } catch (error) {
        console.error('Group Info Error:', error);
        reply("❌ Failed to get group info.");
    }
});

// ==================== GROUP SETTINGS ====================
cmd({
    pattern: "groupsettings",
    alias: ["gsettings", "gcsettings"],
    desc: "Change group settings (Admins only)",
    category: "group",
    react: "⚙️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this!");
        if (!isBotAdmins) return reply("⚠️ I need to be admin!");

        const setting = args[0]?.toLowerCase();
        const value = args[1]?.toLowerCase();

        if (!setting || !value) {
            return reply(`⚙️ *GROUP SETTINGS*

Usage:
.groupsettings announce on/off - Toggle announce mode
.groupsettings restrict on/off - Toggle restrict mode
.groupsettings lock on/off - Lock/unlock group

Current Settings:
• Announce: ${await getGroupSetting(conn, from, 'announce') ? 'ON' : 'OFF'}
• Restrict: ${await getGroupSetting(conn, from, 'restrict') ? 'ON' : 'OFF'}

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌𝐃』`);
        }

        let action = '';
        if (setting === 'announce') {
            action = value === 'on' ? 'announce' : 'unannounce';
        } else if (setting === 'restrict') {
            action = value === 'on' ? 'restrict' : 'unrestrict';
        } else if (setting === 'lock') {
            action = value === 'on' ? 'lock' : 'unlock';
        } else {
            return reply("❌ Invalid setting! Use: announce, restrict, or lock");
        }

        await conn.groupSettingUpdate(from, action);
        reply(`✅ Group setting updated: ${setting} is now ${value.toUpperCase()}`);

    } catch (error) {
        console.error('Group Settings Error:', error);
        reply(`❌ Failed to update settings: ${error.message}`);
    }
});

// Helper function to get group setting
async function getGroupSetting(conn, groupId, setting) {
    try {
        const meta = await conn.groupMetadata(groupId);
        return meta[setting] || false;
    } catch {
        return false;
    }
}

// ==================== INVITE LINK ====================
cmd({
    pattern: "invite",
    alias: ["invitelink", "gclink"],
    desc: "Get or reset group invite link",
    category: "group",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this!");
        if (!isBotAdmins) return reply("⚠️ I need to be admin!");

        const action = args[0]?.toLowerCase();

        if (action === 'reset') {
            await conn.groupRevokeInvite(from);
            reply("🔄 Invite link has been reset!");
        }

        const inviteCode = await conn.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        reply(`🔗 *GROUP INVITE LINK*

${inviteLink}

To reset the link: .invite reset

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌𝐃』`);

    } catch (error) {
        console.error('Invite Error:', error);
        reply(`❌ Failed to get invite link: ${error.message}`);
    }
});

// ==================== MUTE GROUP ====================
cmd({
    pattern: "mute",
    alias: ["mutegc", "silence"],
    desc: "Mute/unmute group (Admins only)",
    category: "group",
    react: "🔇",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this!");
        if (!isBotAdmins) return reply("⚠️ I need to be admin!");

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off'].includes(action)) {
            return reply(`🔇 *MUTE GROUP*

Usage:
.mute on - Mute group (only admins can send)
.mute off - Unmute group (everyone can send)

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌𝐃』`);
        }

        await conn.groupSettingUpdate(from, action === 'on' ? 'announce' : 'unannounce');
        reply(`✅ Group ${action === 'on' ? 'muted' : 'unmuted'} successfully!`);

    } catch (error) {
        console.error('Mute Error:', error);
        reply(`❌ Failed to mute group: ${error.message}`);
    }
});

// ==================== TOTAL MEMBERS ====================
cmd({
    pattern: "totalmembers",
    alias: ["total", "membercount", "mcount"],
    desc: "Get total member count",
    category: "group",
    react: "👥",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, groupMetadata }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");

        const meta = groupMetadata || await conn.groupMetadata(from);
        const participants = meta.participants || [];
        const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
        const bots = participants.filter(p => p.id.includes('bot') || p.id.includes('whatsapp'));
        const humans = participants.filter(p => !p.id.includes('bot') && !p.id.includes('whatsapp'));

        const msg = `👥 *MEMBER STATISTICS*

📊 Total Members: ${participants.length}
👑 Admins: ${admins.length}
🤖 Bots: ${bots.length}
👤 Humans: ${humans.length}

📈 Group Growth: ${participants.length > 10 ? '📈' : '📉'}

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌𝐃』`;

        reply(msg);

    } catch (error) {
        console.error('Total Members Error:', error);
        reply("❌ Failed to get member count.");
    }
});

// ==================== RANK ====================
cmd({
    pattern: "rank",
    alias: ["rankuser", "memberrank"],
    desc: "Get user's role in group",
    category: "group",
    react: "🎖️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, reply, sender, mentionedJid, groupMetadata }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");

        const target = mentionedJid?.[0] || sender;
        const meta = groupMetadata || await conn.groupMetadata(from);
        const participant = meta.participants.find(p => p.id === target);

        if (!participant) return reply("❌ User not found in this group!");

        let role = '👤 Member';
        if (participant.admin === 'superadmin') role = '👑 Super Admin';
        else if (participant.admin === 'admin') role = '👑 Admin';
        else if (participant.id === meta.owner) role = '👑 Group Owner';

        const msg = `🎖️ *USER RANK*

@${target.split('@')[0]}
📊 Role: ${role}

Group: ${meta.subject}
Total Members: ${meta.participants.length}

> © 『𝐈𝐂𝐎𝐍-𝐗 𝐌』`;

        await reply(msg, { mentions: [target] });

    } catch (error) {
        console.error('Rank Error:', error);
        reply("❌ Failed to get user rank.");
    }
});

// ==================== KICK ALL BOTS ====================
cmd({
    pattern: "kickbots",
    alias: ["removebots", "botsremove"],
    desc: "Remove all bots from group",
    category: "admin",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, groupMetadata }) => {
    try {
        if (!isGroup) return reply("⚠️ This command only works in groups!");
        if (!isAdmins) return reply("⚠️ Only admins can use this!");
        if (!isBotAdmins) return reply("⚠️ I need to be admin!");

        const meta = groupMetadata || await conn.groupMetadata(from);
        const bots = meta.participants.filter(p => 
            p.id.includes('bot') || 
            p.id.includes('whatsapp') || 
            p.id.includes('s.whatsapp.net') && !p.id.includes(conn.user.id)
        );

        if (bots.length === 0) return reply("✅ No bots found in this group!");

        const botIds = bots.map(p => p.id);
        await conn.groupParticipantsUpdate(from, botIds, 'remove');
        
        reply(`✅ Removed ${botIds.length} bots from the group!`);

    } catch (error) {
        console.error('Kick Bots Error:', error);
        reply("❌ Failed to remove bots.");
    }
});