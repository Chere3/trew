import 'dotenv/config';

async function testFireworks() {
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
    console.log("Testing Fireworks API...");
    console.log("API Key present:", !!FIREWORKS_API_KEY);

    if (!FIREWORKS_API_KEY) {
        console.error("No API key found!");
        return;
    }

    try {
        const response = await fetch("https://api.fireworks.ai/inference/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "accounts/fireworks/models/llama-v3-8b-instruct",
                messages: [
                    {
                        role: "user",
                        content: "Say hello",
                    }
                ],
                max_tokens: 10,
            })
        });

        console.log("Response status:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("Success! Response:", data);
        } else {
            const errorText = await response.text();
            console.error("Failed. Error body:", errorText);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testFireworks();
