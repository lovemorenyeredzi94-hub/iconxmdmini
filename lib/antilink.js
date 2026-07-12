const {
    getAntilinkSettings,
    setAntilinkStatus,
    getAntilinkStatus,
    setAntilinkAction,
    getAntilinkAction,
    setWarnCount,
    getWarnCount,
    getUserWarns,
    addUserWarn,
    resetUserWarns,
    getGroupWarns,
    resetAllWarns,
    checkAntilink,
    hasLinks
} = require('./database');

class AntilinkManager {
    constructor() {
        this.db = {
            getAntilinkSettings,
            setAntilinkStatus,
            getAntilinkStatus,
            setAntilinkAction,
            getAntilinkAction,
            setWarnCount,
            getWarnCount,
            getUserWarns,
            addUserWarn,
            resetUserWarns,
            getGroupWarns,
            resetAllWarns,
            checkAntilink,
            hasLinks
        };
    }

    // Check if user is admin
    isAdmin(participant, groupMetadata) {
        if (!groupMetadata || !groupMetadata.participants) return false;
        const participantData = groupMetadata.participants.find(p => p.id === participant);
        return participantData && (participantData.admin === 'admin' || participantData.admin === 'superadmin');
    }

    // Check if bot is admin
    isBotAdmin(botId, groupMetadata) {
        if (!groupMetadata || !groupMetadata.participants) return false;
        const botData = groupMetadata.participants.find(p => p.id === botId);
        return botData && (botData.admin === 'admin' || botData.admin === 'superadmin');
    }

    // Process message
    async processMessage(conn, m, groupMetadata) {
        try {
            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;
            
            if (!from || !from.endsWith('@g.us')) return null;
            
            // Skip if sender is bot
            if (sender === conn.user.id) return null;
            
            // Skip if sender is admin
            if (this.isAdmin(sender, groupMetadata)) return null;
            
            // Check if bot is admin
            if (!this.isBotAdmin(conn.user.id, groupMetadata)) {
                return { 
                    error: true, 
                    message: '⚠️ I need to be admin to use anti-link features!'
                };
            }
            
            // Extract text from message
            let text = '';
            const msgType = Object.keys(m.message)[0];
            
            if (msgType === 'conversation') {
                text = m.message.conversation;
            } else if (msgType === 'extendedTextMessage') {
                text = m.message.extendedTextMessage.text;
            } else if (msgType === 'imageMessage') {
                text = m.message.imageMessage.caption || '';
            } else if (msgType === 'videoMessage') {
                text = m.message.videoMessage.caption || '';
            } else if (msgType === 'documentMessage') {
                text = m.message.documentMessage.caption || '';
            }
            
            if (!text) return null;
            
            // Check antilink
            const result = await this.db.checkAntilink(from, sender, text);
            
            if (result) {
                return {
                    ...result,
                    sender,
                    messageKey: m.key,
                    groupId: from
                };
            }
            
            return null;
            
        } catch (error) {
            console.error('Error processing antilink:', error);
            return null;
        }
    }

    // Execute action
    async executeAction(conn, result) {
        try {
            const { action, message, sender, messageKey, groupId } = result;
            
            // Delete the message
            if (messageKey) {
                try {
                    await conn.sendMessage(groupId, { delete: messageKey });
                } catch (e) {
                    console.error('Failed to delete message:', e);
                }
            }
            
            // Send notification
            const mention = `@${sender.split('@')[0]}`;
            let notificationText = `${message}\n${mention}`;
            
            // Handle different actions
            if (action === 'delete') {
                await conn.sendMessage(groupId, {
                    text: notificationText,
                    mentions: [sender]
                });
            } 
            else if (action === 'warn') {
                const warns = result.warns || 0;
                const maxWarns = result.maxWarns || 3;
                notificationText = `${message}\n${mention}\n\n⚠️ Warning ${warns}/${maxWarns}`;
                await conn.sendMessage(groupId, {
                    text: notificationText,
                    mentions: [sender]
                });
            } 
            else if (action === 'kick') {
                try {
                    await conn.groupParticipantsUpdate(groupId, [sender], 'remove');
                    await conn.sendMessage(groupId, {
                        text: notificationText,
                        mentions: [sender]
                    });
                } catch (e) {
                    console.error('Failed to kick user:', e);
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Error executing antilink action:', error);
            return false;
        }
    }

    // Get settings for a group
    async getSettings(groupId) {
        return await this.db.getAntilinkSettings(groupId);
    }

    // Update settings
    async updateSettings(groupId, setting, value) {
        switch (setting) {
            case 'status':
                return await this.db.setAntilinkStatus(groupId, value);
            case 'action':
                return await this.db.setAntilinkAction(groupId, value);
            case 'warnCount':
                return await this.db.setWarnCount(groupId, value);
            default:
                throw new Error('Invalid setting');
        }
    }

    // User warning management
    async getUserWarns(groupId, userId) {
        return await this.db.getUserWarns(groupId, userId);
    }

    async resetUserWarns(groupId, userId) {
        return await this.db.resetUserWarns(groupId, userId);
    }

    async resetAllWarns(groupId) {
        return await this.db.resetAllWarns(groupId);
    }

    async getGroupWarns(groupId) {
        return await this.db.getGroupWarns(groupId);
    }
}

module.exports = AntilinkManager;
