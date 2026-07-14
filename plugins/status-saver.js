const { cmd } = require("../arslan");
const fs = require('fs-extra');
const path = require('path');

cmd({
    pattern: "autosave",
    alias: ["auto", "autostatus", "as"],
    react: "🔄",
    desc: "Enable/disable auto status saving",
    category: "misc",
    use: ".autosave on/off",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, sender, isGroup }) => {
    try {
        // Check if in private chat
        if (isGroup) {
            return reply("❌ This command only works in private chat!");
        }

        const action = args[0]?.toLowerCase();
        const user = sender.split('@')[0];

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return reply(`🔄 *AUTO STATUS SAVER*\n\nEnable or disable auto-saving of statuses.\n\nCommands:\n• \`.autosave on\` - Enable auto-save\n• \`.autosave off\` - Disable auto-save\n\n💡 When enabled, all statuses will be saved automatically.`);
        }

        // Create user settings file
        const settingsDir = path.join(__dirname, '../../data');
        if (!fs.existsSync(settingsDir)) fs.ensureDirSync(settingsDir);

        const settingsFile = path.join(settingsDir, `autosave_${user}.json`);
        let settings = { enabled: false };

        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        const isEnabled = action === 'on' || action === 'enable';
        settings.enabled = isEnabled;
        fs.writeJsonSync(settingsFile, settings);

        const status = isEnabled ? '✅ ENABLED' : '❌ DISABLED';
        reply(`🔄 *AUTO STATUS SAVER*\n\n📌 Status: ${status}\n\n💡 ${isEnabled ? 'All statuses will be saved automatically!' : 'Auto-save is now disabled.'}`);
    } catch (error) {
        console.error("Auto status error:", error);
        reply("❌ Failed to update auto-save settings.");
    }
});

// Auto-save function (runs in background)
module.exports = {
    on: 'body',
    function: async (conn, mek, m, { from, sender }) => {
        try {
            // Only process status broadcasts
            if (from !== "status@broadcast") return;

            // Check if user has auto-save enabled
            const user = sender.split('@')[0];
            const settingsDir = path.join(__dirname, '../../data');
            const settingsFile = path.join(settingsDir, `autosave_${user}.json`);

            if (!fs.existconst { cmd } = require("../../arslan");
const fs = require('fs-extra');
const path = require('path');

cmd({
    pattern: "autosave",
    alias: ["auto", "autostatus", "as"],
    react: "🔄",
    desc: "Enable/disable auto status saving",
    category: "misc",
    use: ".autosave on/off",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, sender, isGroup }) => {
    try {
        // Check if in private chat
        if (isGroup) {
            return reply("❌ This command only works in private chat!");
        }

        const action = args[0]?.toLowerCase();
        const user = sender.split('@')[0];

        if (!action || !['on', 'off', 'enable', 'disable'].includes(action)) {
            return reply(`🔄 *AUTO STATUS SAVER*\n\nEnable or disable auto-saving of statuses.\n\nCommands:\n• \`.autosave on\` - Enable auto-save\n• \`.autosave off\` - Disable auto-save\n\n💡 When enabled, all statuses will be saved automatically.`);
        }

        // Create user settings file
        const settingsDir = path.join(__dirname, '../../data');
        if (!fs.existsSync(settingsDir)) fs.ensureDirSync(settingsDir);

        const settingsFile = path.join(settingsDir, `autosave_${user}.json`);
        let settings = { enabled: false };

        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        const isEnabled = action === 'on' || action === 'enable';
        settings.enabled = isEnabled;
        fs.writeJsonSync(settingsFile, settings);

        const status = isEnabled ? '✅ ENABLED' : '❌ DISABLED';
        reply(`🔄 *AUTO STATUS SAVER*\n\n📌 Status: ${status}\n\n💡 ${isEnabled ? 'All statuses will be saved automatically!' : 'Auto-save is now disabled.'}`);
    } catch (error) {
        console.error("Auto status error:", error);
        reply("❌ Failed to update auto-save settings.");
    }
});

// Auto-save function (runs in background)
module.exports = {
    on: 'body',
    function: async (conn, mek, m, { from, sender }) => {
        try {
            // Only process status broadcasts
            if (from !== "status@broadcast") return;

            // Check if user has auto-save enabled
            const user = sender.split('@')[0];
            const settingsDir = path.join(__dirname, '../../data');
            const settingsFile = path.join(settingsDir, `autosave_${user}.json`);

            if (!fs.existsSync(settingsFile)) return;

            const settings = fs.readJsonSync(settingsFile);
            if (!settings.enabled) return;

            const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) return;

            let msg = {};
            let type = '';

            if (quoted.imageMessage) {
                msg = { image: { url: quoted.imageMessage.url } };
                type = 'Image';
            } else if (quoted.videoMessage) {
                msg = { video: { url: quoted.videoMessage.url } };
                type = 'Video';
            } else {
                return;
            }

            await conn.sendMessage(sender, {
                ...msg,
                caption: `📤 *${type} Status Saved Automatically*\n\n⏰ Time: ${new Date().toLocaleString()}`
            });

            console.log(`✅ Auto-saved ${type} status for ${user}`);

        } catch (error) {
            console.error("Auto status error:", error);
        }
    }
};ync(settingsFile)) return;

            const settings = fs.readJsonSync(settingsFile);
            if (!settings.enabled) return;

            const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) return;

            let msg = {};
            let type = '';

            if (quoted.imageMessage) {
                msg = { image: { url: quoted.imageMessage.url } };
                type = 'Image';
            } else if (quoted.videoMessage) {
                msg = { video: { url: quoted.videoMessage.url } };
                type = 'Video';
            } else {
                return;
            }

            await conn.sendMessage(sender, {
                ...msg,
                caption: `📤 *${type} Status Saved Automatically*\n\n⏰ Time: ${new Date().toLocaleString()}`
            });

            console.log(`✅ Auto-saved ${type} status for ${user}`);

        } catch (error) {
            console.error("Auto status error:", error);
        }
    }
};