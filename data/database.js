// ============ ADD THESE ANTILINK FUNCTIONS TO YOUR EXISTING database.js ============

// Antilink Schema - Add this after your other schemas
const antilinkSchema = new mongoose.Schema({
    groupId: { type: String, unique: true },
    status: { type: Boolean, default: false },
    action: { type: String, default: 'delete' },
    warnCount: { type: Number, default: 3 },
    warns: { type: Object, default: {} }
});

const Antilink = mongoose.model('Antilink', antilinkSchema);

// Antilink Database Functions
async function getAntilinkSettings(groupId) {
    let settings = await Antilink.findOne({ groupId });
    if (!settings) {
        settings = new Antilink({ groupId });
        await settings.save();
    }
    return settings;
}

async function setAntilinkStatus(groupId, status) {
    const settings = await getAntilinkSettings(groupId);
    settings.status = status;
    await settings.save();
    return true;
}

async function getAntilinkStatus(groupId) {
    const settings = await getAntilinkSettings(groupId);
    return settings.status;
}

async function setAntilinkAction(groupId, action) {
    const settings = await getAntilinkSettings(groupId);
    settings.action = action;
    await settings.save();
    return true;
}

async function getAntilinkAction(groupId) {
    const settings = await getAntilinkSettings(groupId);
    return settings.action;
}

async function setWarnCount(groupId, count) {
    const settings = await getAntilinkSettings(groupId);
    settings.warnCount = count;
    await settings.save();
    return true;
}

async function getWarnCount(groupId) {
    const settings = await getAntilinkSettings(groupId);
    return settings.warnCount;
}

async function getUserWarns(groupId, userId) {
    const settings = await getAntilinkSettings(groupId);
    return settings.warns[userId] || 0;
}

async function addUserWarn(groupId, userId) {
    const settings = await getAntilinkSettings(groupId);
    settings.warns[userId] = (settings.warns[userId] || 0) + 1;
    await settings.save();
    return settings.warns[userId];
}

async function resetUserWarns(groupId, userId) {
    const settings = await getAntilinkSettings(groupId);
    delete settings.warns[userId];
    await settings.save();
    return true;
}

async function getGroupWarns(groupId) {
    const settings = await getAntilinkSettings(groupId);
    return settings.warns;
}

async function resetAllWarns(groupId) {
    const settings = await getAntilinkSettings(groupId);
    settings.warns = {};
    await settings.save();
    return true;
}

function hasLinks(text) {
    if (!text) return false;
    
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/gi;
    const blockedDomains = [
        'bit.ly', 'tinyurl', 'shorturl', 'goo.gl', 'ow.ly',
        'youtu.be', 't.co', 'linktr.ee', 'shorte.st', 'rb.gy',
        'cutt.ly', 'tiny.cc', 'is.gd', 'buff.ly', 'short.link',
        'shorturl.at', 'shrtco.de', 'tiny.one', 'click.ru',
        'v.gd', 'dub.sh', 'mzl.la', 'amzn.to', 'spoti.fi'
    ];
    
    const hasLink = linkRegex.test(text);
    const hasBlockedDomain = blockedDomains.some(domain => 
        text.toLowerCase().includes(domain)
    );
    
    return hasLink || hasBlockedDomain;
}

async function checkAntilink(groupId, userId, text) {
    const settings = await getAntilinkSettings(groupId);
    
    if (!settings.status) return null;
    if (!hasLinks(text)) return null;
    
    const action = settings.action;
    const warnCount = settings.warnCount;
    const userWarns = settings.warns[userId] || 0;
    
    if (action === 'delete') {
        return { 
            action: 'delete', 
            message: '🚫 Links are not allowed here!'
        };
    } 
    else if (action === 'warn') {
        const newWarns = await addUserWarn(groupId, userId);
        if (newWarns >= warnCount) {
            await resetUserWarns(groupId, userId);
            return { 
                action: 'kick', 
                message: `👢 Kicked for exceeding ${warnCount} warnings!`
            };
        }
        return { 
            action: 'warn', 
            message: `⚠️ Warning ${newWarns}/${warnCount}`,
            warns: newWarns,
            maxWarns: warnCount
        };
    } 
    else if (action === 'kick') {
        return { 
            action: 'kick', 
            message: '👢 Kicked for sending links!'
        };
    }
    
    return null;
}

// Add these to your module.exports
module.exports = {
    // ... your existing exports
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
