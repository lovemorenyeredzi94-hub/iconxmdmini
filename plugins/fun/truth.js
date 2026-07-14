const { cmd } = require('../arslan');

cmd({
    pattern: "truth",
    alias: ["truthordare", "td"],
    react: "🤫",
    desc: "Get a truth or dare question",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply, args }) => {
    try {
        const type = args[0]?.toLowerCase() || 'truth';

        const truths = [
            "What's the most embarrassing thing you've ever done?",
            "Have you ever lied to your best friend?",
            "What's your biggest fear?",
            "Who is your secret crush?",
            "What's the worst date you've ever been on?",
            "Have you ever stolen something?",
            "What's your deepest secret?",
            "Do you believe in ghosts?",
            "What's the most childish thing you still do?",
            "Have you ever cheated on a test?",
            "What's the meanest thing you've ever said to someone?",
            "Do you still sleep with a stuffed animal?",
            "What's your guilty pleasure?",
            "Have you ever been in love?",
            "What's the most trouble you've ever been in?"
        ];

        const dares = [
            "Do your best impression of a celebrity.",
            "Sing a song out loud right now.",
            "Dance for 30 seconds without music.",
            "Speak in an accent for the next 5 minutes.",
            "Send a funny text to someone you haven't talked to in a while.",
            "Do 10 pushups right now.",
            "Pretend to be a waiter and take everyone's order.",
            "Talk like a robot for the next 2 minutes.",
            "Do a dramatic reading of the last message in the chat.",
            "Make up a story on the spot.",
            "Act like a chicken for 20 seconds.",
            "Send a compliment to the person above you.",
            "Imitate someone in the chat.",
            "Tell a joke, if no one laughs, do 10 jumping jacks.",
            "Post an embarrassing photo of yourself in the chat."
        ];

        let selected;
        let text;

        if (type === 'truth') {
            selected = truths[Math.floor(Math.random() * truths.length)];
            text = `🤫 *TRUTH*\n\n${selected}`;
        } else if (type === 'dare') {
            selected = dares[Math.floor(Math.random() * dares.length)];
            text = `💪 *DARE*\n\n${selected}`;
        } else {
            // Random mix
            const isTruth = Math.random() < 0.5;
            if (isTruth) {
                selected = truths[Math.floor(Math.random() * truths.length)];
                text = `🤫 *TRUTH*\n\n${selected}`;
            } else {
                selected = dares[Math.floor(Math.random() * dares.length)];
                text = `💪 *DARE*\n\n${selected}`;
            }
        }

        text += `\n\n📌 @${m.sender.split('@')[0]} your turn!`;
        
        reply(text, { mentions: [m.sender] });

    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});