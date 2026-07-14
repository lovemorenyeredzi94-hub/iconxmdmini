const { cmd } = require('../arslan');

cmd({
    pattern: "convert",
    alias: ["unit", "convertunit"],
    react: "📏",
    desc: "Convert units (cm to inches, etc.)",
    category: "misc",
    use: ".convert 10 cm to inches",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) {
            return reply(`📏 *UNIT CONVERTER*\n\nConvert between units!\n\n*Length:*\n.cm 10 cm to inches\n.m 5 meters to feet\n\n*Weight:*\n.kg 10 kg to pounds\n.g 100 grams to ounces\n\n*Temperature:*\n.c 30 C to F\n.f 86 F to C\n\n*Currency:*\n.usd 100 usd to eur`);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const parts = q.split(' ');
        let result = '';
        let converted = '';

        // Length conversions
        const lengthConversions = {
            'cm': { 'inches': 0.393701, 'feet': 0.0328084, 'meters': 0.01, 'km': 0.00001 },
            'm': { 'feet': 3.28084, 'inches': 39.3701, 'km': 0.001, 'cm': 100 },
            'km': { 'm': 1000, 'feet': 3280.84, 'miles': 0.621371 },
            'inches': { 'cm': 2.54, 'feet': 0.0833333, 'm': 0.0254 },
            'feet': { 'm': 0.3048, 'cm': 30.48, 'inches': 12 },
            'miles': { 'km': 1.60934, 'm': 1609.34 }
        };

        // Weight conversions
        const weightConversions = {
            'kg': { 'pounds': 2.20462, 'g': 1000, 'oz': 35.274 },
            'g': { 'kg': 0.001, 'pounds': 0.00220462, 'oz': 0.035274 },
            'pounds': { 'kg': 0.453592, 'g': 453.592, 'oz': 16 },
            'oz': { 'g': 28.3495, 'kg': 0.0283495, 'pounds': 0.0625 }
        };

        // Temperature conversions
        if (q.toLowerCase().includes('c to f')) {
            const temp = parseFloat(q);
            if (!isNaN(temp)) {
                const f = (temp * 9/5) + 32;
                converted = `${f.toFixed(2)} °F`;
                result = `${temp} °C = ${converted}`;
            }
        } else if (q.toLowerCase().includes('f to c')) {
            const temp = parseFloat(q);
            if (!isNaN(temp)) {
                const c = (temp - 32) * 5/9;
                converted = `${c.toFixed(2)} °C`;
                result = `${temp} °F = ${converted}`;
            }
        }

        // If no conversion found, try parse as number with units
        if (!result) {
            const match = q.match(/([\d.]+)\s*(\w+)\s+to\s+(\w+)/);
            if (match) {
                const value = parseFloat(match[1]);
                const fromUnit = match[2].toLowerCase();
                const toUnit = match[3].toLowerCase();

                // Check length conversions
                if (lengthConversions[fromUnit] && lengthConversions[fromUnit][toUnit]) {
                    const factor = lengthConversions[fromUnit][toUnit];
                    converted = (value * factor).toFixed(4);
                    result = `${value} ${fromUnit} = ${converted} ${toUnit}`;
                }
                // Check weight conversions
                else if (weightConversions[fromUnit] && weightConversions[fromUnit][toUnit]) {
                    const factor = weightConversions[fromUnit][toUnit];
                    converted = (value * factor).toFixed(4);
                    result = `${value} ${fromUnit} = ${converted} ${toUnit}`;
                }
            }
        }

        if (!result) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply(`❌ Invalid conversion!\n\n💡 Examples:\n.cm 10 cm to inches\n.kg 10 kg to pounds\n.c 30 C to F\n\n📌 Supported: cm, m, km, inches, feet, miles, kg, g, pounds, oz`);
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        reply(`📏 *UNIT CONVERTER*\n\n${result}`);
    } catch (error) {
        console.error("Convert error:", error);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply("❌ Failed to convert.");
    }
});