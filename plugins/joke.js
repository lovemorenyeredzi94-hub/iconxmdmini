const { cmd } = require('../arslan');

cmd({
    pattern: "joke",
    alias: ["jokes", "dadjoke"],
    react: "🤣",
    desc: "Get a random joke",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const jokes = [
            { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
            { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
            { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!" },
            { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
            { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
            { setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus!" },
            { setup: "Why did the math book look sad?", punchline: "Because it had too many problems!" },
            { setup: "What do you call a fish wearing a bowtie?", punchline: "Sofishticated!" },
            { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
            { setup: "What do you call an alligator in a vest?", punchline: "An investigator!" },
            { setup: "Why did the banana go to the doctor?", punchline: "Because it wasn't peeling well!" },
            { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!" },
            { setup: "What's orange and sounds like a parrot?", punchline: "A carrot!" },
            { setup: "What do you call a dog that can do magic?", punchline: "A labracadabrador!" },
            { setup: "Why did the tomato turn red?", punchline: "Because it saw the salad dressing!" },
            { setup: "What do you call a cow with no legs?", punchline: "Ground beef!" },
            { setup: "Why did the man put his money in the freezer?", punchline: "He wanted cold hard cash!" },
            { setup: "What do you call a bear in the rain?", punchline: "A drizzly bear!" },
            { setup: "What do you call a fly without wings?", punchline: "A walk!" },
            { setup: "Why did the cookie go to the hospital?", punchline: "Because it felt crummy!" }
        ];

        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        reply(`🤣 *Random Joke*\n\n${joke.setup}\n\n😂 ${joke.punchline}`);
    } catch (error) {
        reply(`❌ Error: ${error.message}`);
    }
});