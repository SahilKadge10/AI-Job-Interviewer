import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import Sentiment from "sentiment";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const sentimentAnalyzer = new Sentiment();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Endpoint: Generate Interview Question
app.post("/api/getQuestion", async (req, res) => {
    const { jobRole, userPrompt } = req.body;
    let promptText = `Ask an interview question for the role of ${jobRole}.`;

    if (userPrompt) {
        promptText = `Based on the job role ${jobRole}, modify the question accordingly: ${userPrompt}`;
    }

    try {
        const result = await model.generateContent(promptText);
        const question = result.response.text();
        res.json({ question });
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ error: "Failed to generate question." });
    }
});

// Endpoint: Analyze Answer
app.post("/api/analyzeAnswer", async (req, res) => {
    const { answer, userPrompt } = req.body;
    if (!answer) return res.status(400).json({ error: "No answer provided" });

    const sentimentScore = sentimentAnalyzer.analyze(answer).score;
    let feedback = "Good answer!";

    if (sentimentScore < 0) {
        feedback = "Your answer sounds negative. Try to be more confident and positive.";
    } else if (sentimentScore === 0) {
        feedback = "Your answer is neutral. Adding more details could improve it.";
    }

    // Handle user prompt (e.g., "Suggest a better answer")
    if (userPrompt) {
        const result = await model.generateContent(`Improve this interview answer: "${answer}"`);
        const betterAnswer = result.response.text();
        return res.json({ feedback, sentimentScore, betterAnswer });
    }

    res.json({ feedback, sentimentScore });
});

// Serve React frontend (for deployment)
app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
