// FILE: commands/sports/sports.js
const { cmd } = require("../../arslan");
const axios = require("axios");

// API Endpoints
const API_BASE = "https://api.football-data.org/v4";
const API_KEY = "gqfosgTquH"; // Get from https://www.football-data.org/

const leagues = {
    'premierleague': 'PL',
    'laliga': 'PD',
    'seriea': 'SA',
    'bundesliga': 'BL1',
    'ligue1': 'FL1',
    'ucl': 'CL',
    'euro': 'EC',
    'worldcup': 'WC'
};

cmd({
    pattern: "soccer",
    alias: ["football", "match"],
    desc: "Get live soccer match information",
    category: "sports",
    react: "⚽",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        const league = args[0]?.toLowerCase() || 'premierleague';
        const leagueId = leagues[league];
        
        if (!leagueId) {
            return reply(`❌ Invalid league. Available: ${Object.keys(leagues).join(', ')}`);
        }

        await reply(`⏳ Fetching ${league} matches...`);

        const response = await axios.get(`${API_BASE}/competitions/${leagueId}/matches`, {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!response.data || !response.data.matches) {
            return reply("❌ No matches found for this league.");
        }

        const matches = response.data.matches;
        let text = `⚽ *${league.toUpperCase()} - LIVE MATCHES*\n\n`;

        matches.slice(0, 10).forEach((match, i) => {
            const homeTeam = match.homeTeam.name;
            const awayTeam = match.awayTeam.name;
            const status = match.status;
            
            let score = "vs";
            if (status === 'FINISHED' || status === 'LIVE') {
                score = `${match.score.fullTime.home} - ${match.score.fullTime.away}`;
            }
            
            const statusText = status === 'LIVE' ? '🔴 LIVE' : 
                              status === 'FINISHED' ? '✅ Finished' : '⏳ Scheduled';
            
            text += `${i+1}. ${homeTeam} ${score} ${awayTeam}\n`;
            text += `   📊 Status: ${statusText}\n\n`;
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Soccer Error:", err);
        reply("❌ Failed to get soccer matches. Please try again.");
    }
});

cmd({
    pattern: "livescore",
    alias: ["score", "livescores"],
    desc: "Get live scores",
    category: "sports",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, {
    reply
}) => {
    try {
        await reply(`⏳ Fetching live scores...`);

        const response = await axios.get(`${API_BASE}/matches`, {
            headers: { 'X-Auth-Token': API_KEY },
            params: { status: 'LIVE' }
        });

        if (!response.data || !response.data.matches || response.data.matches.length === 0) {
            return reply("⚽ No live matches at the moment.");
        }

        const matches = response.data.matches;
        let text = `📊 *LIVE SCORES*\n\n`;

        matches.slice(0, 10).forEach((match, i) => {
            const homeTeam = match.homeTeam.name;
            const awayTeam = match.awayTeam.name;
            const homeScore = match.score.fullTime.home || 0;
            const awayScore = match.score.fullTime.away || 0;
            const minute = match.minute || '??';
            
            text += `${i+1}. ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}\n`;
            text += `   ⏱️ ${minute}'\n\n`;
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("LiveScore Error:", err);
        reply("❌ Failed to get live scores. Please try again.");
    }
});

cmd({
    pattern: "teamsearch",
    alias: ["team", "searchteam"],
    desc: "Search for a football team",
    category: "sports",
    react: "🔍",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        if (args.length === 0) return reply("❌ Please provide a team name.\nExample: .teamsearch Manchester United");

        const teamName = args.join(' ');
        await reply(`⏳ Searching for ${teamName}...`);

        const response = await axios.get(`${API_BASE}/teams`, {
            headers: { 'X-Auth-Token': API_KEY },
            params: { name: teamName }
        });

        if (!response.data || !response.data.teams || response.data.teams.length === 0) {
            return reply(`❌ No team found for "${teamName}".`);
        }

        const team = response.data.teams[0];
        const text = `🔍 *TEAM INFORMATION*\n\n📛 Name: ${team.name}\n🏠 Venue: ${team.venue || 'N/A'}\n📅 Founded: ${team.founded || 'N/A'}\n🌍 Country: ${team.area?.name || 'N/A'}\n🔗 Website: ${team.website || 'N/A'}`;

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("TeamSearch Error:", err);
        reply("❌ Failed to search team. Please try again.");
    }
});

cmd({
    pattern: "playersearch",
    alias: ["player", "searchplayer"],
    desc: "Search for a football player",
    category: "sports",
    react: "👤",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        if (args.length === 0) return reply("❌ Please provide a player name.\nExample: .playersearch Lionel Messi");

        const playerName = args.join(' ');
        await reply(`⏳ Searching for ${playerName}...`);

        const response = await axios.get(`${API_BASE}/persons`, {
            headers: { 'X-Auth-Token': API_KEY },
            params: { name: playerName }
        });

        if (!response.data || !response.data.persons || response.data.persons.length === 0) {
            return reply(`❌ No player found for "${playerName}".`);
        }

        const player = response.data.persons[0];
        const text = `👤 *PLAYER INFORMATION*\n\n📛 Name: ${player.name}\n📅 Date of Birth: ${player.dateOfBirth || 'N/A'}\n🌍 Nationality: ${player.nationality || 'N/A'}\n🏃 Position: ${player.position || 'N/A'}\n👕 Jersey Number: ${player.shirtNumber || 'N/A'}`;

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("PlayerSearch Error:", err);
        reply("❌ Failed to search player. Please try again.");
    }
});

cmd({
    pattern: "topscorers",
    alias: ["topscorer", "goalsscorers"],
    desc: "Get top scorers of a league",
    category: "sports",
    react: "⚽",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        const league = args[0]?.toLowerCase() || 'premierleague';
        const leagueId = leagues[league];
        
        if (!leagueId) {
            return reply(`❌ Invalid league. Available: ${Object.keys(leagues).join(', ')}`);
        }

        await reply(`⏳ Fetching top scorers for ${league}...`);

        const response = await axios.get(`${API_BASE}/competitions/${leagueId}/scorers`, {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!response.data || !response.data.scorers) {
            return reply("❌ No scorers found.");
        }

        const scorers = response.data.scorers;
        let text = `⚽ *TOP SCORERS - ${league.toUpperCase()}*\n\n`;

        scorers.slice(0, 10).forEach((scorer, i) => {
            text += `${i+1}. ${scorer.player.name}\n`;
            text += `   👤 Team: ${scorer.team.name}\n`;
            text += `   ⚽ Goals: ${scorer.goals}\n\n`;
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("TopScorers Error:", err);
        reply("❌ Failed to get top scorers. Please try again.");
    }
});

cmd({
    pattern: "upcomingmatches",
    alias: ["upcoming", "fixtures"],
    desc: "Get upcoming matches",
    category: "sports",
    react: "📅",
    filename: __filename
}, async (conn, mek, m, {
    reply, args
}) => {
    try {
        const league = args[0]?.toLowerCase() || 'premierleague';
        const leagueId = leagues[league];
        
        if (!leagueId) {
            return reply(`❌ Invalid league. Available: ${Object.keys(leagues).join(', ')}`);
        }

        await reply(`⏳ Fetching upcoming ${league} matches...`);

        const response = await axios.get(`${API_BASE}/competitions/${leagueId}/matches`, {
            headers: { 'X-Auth-Token': API_KEY },
            params: { status: 'SCHEDULED' }
        });

        if (!response.data || !response.data.matches || response.data.matches.length === 0) {
            return reply("❌ No upcoming matches found.");
        }

        const matches = response.data.matches;
        let text = `📅 *UPCOMING MATCHES - ${league.toUpperCase()}*\n\n`;

        matches.slice(0, 10).forEach((match, i) => {
            const homeTeam = match.homeTeam.name;
            const awayTeam = match.awayTeam.name;
            const date = new Date(match.utcDate).toLocaleDateString();
            const time = new Date(match.utcDate).toLocaleTimeString();
            
            text += `${i+1}. ${homeTeam} vs ${awayTeam}\n`;
            text += `   📅 ${date} ⏰ ${time}\n\n`;
        });

        await conn.sendMessage(mek.key.remoteJid, {
            text: text,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("Upcoming Matches Error:", err);
        reply("❌ Failed to get upcoming matches. Please try again.");
    }
});