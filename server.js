import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const HF_API_KEY = process.env.HF_API_KEY;  

// Check if API key exists
if (!HF_API_KEY) {
    console.error("❌ ERROR: HF_API_KEY not found in .env file!");
    process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/ask", async (req, res) => {
    const { question } = req.body;
    console.log("\n📩 Question received:", question);

    if (!question) return res.status(400).json({ error: "No question provided" });

    try {
        // ✅ Using Qwen model - widely available
        const model = "Qwen/Qwen2.5-72B-Instruct";

        // ✅ CORRECT ENDPOINT: OpenAI-compatible chat completions API
        const url = "https://router.huggingface.co/v1/chat/completions";

        console.log("🔗 Calling URL:", url);
        console.log("🤖 Using model:", model);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "user",
                        content: question
                    }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        console.log("📡 Response status:", response.status);

        const data = await response.json();
        console.log("📦 API response:", JSON.stringify(data, null, 2));

        // Handle errors
        if (data.error) {
            console.error("❌ API Error:", data.error);

            if (data.error.message) {
                return res.json({ answer: `Error: ${data.error.message}` });
            }
            return res.json({ answer: `Error: ${data.error}` });
        }

        // Extract answer from OpenAI-style response
        if (data.choices && data.choices.length > 0) {
            const answer = data.choices[0].message.content;
            console.log("✅ Answer:", answer);
            return res.json({ answer: answer });
        }

        console.log("⚠️ No answer in response");
        res.json({ answer: "I couldn't generate an answer. Please try again!" });

    } catch (err) {
        console.error("💥 Error:", err.message);
        res.json({ answer: `Connection error: ${err.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`\n🤖 EduBot server running on port ${PORT}`);
    console.log(`📂 Serving files from 'public' folder\n`);
});