import React, { useState } from "react";
import axios from "axios";
import { useSpeechSynthesis, useSpeechRecognition } from "react-speech-kit";

const App = () => {
    const [jobRole, setJobRole] = useState("");
    const [question, setQuestion] = useState("");
    const [userAnswer, setUserAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [userPrompt, setUserPrompt] = useState("");
    const { speak } = useSpeechSynthesis();
    const { listen, listening, stop } = useSpeechRecognition({
        onResult: (result) => setUserAnswer(result),
    });

    // Fetch Question from API
    const fetchQuestion = async () => {
        if (!jobRole) return alert("Please enter a job role!");

        try {
            const response = await axios.post("http://localhost:5000/api/getQuestion", { jobRole, userPrompt });
            setQuestion(response.data.question);
            speak({ text: response.data.question });
            setUserPrompt(""); // Reset prompt after fetching question
        } catch (error) {
            console.error("Error fetching question:", error);
            alert("Failed to fetch question.");
        }
    };

    // Skip Question and Get a New One
    const skipQuestion = () => {
        fetchQuestion();
    };

    // Analyze Answer with AI
    const analyzeAnswer = async () => {
        if (!userAnswer) return alert("Please provide an answer first!");

        try {
            const response = await axios.post("http://localhost:5000/api/analyzeAnswer", { answer: userAnswer });
            setFeedback(response.data.feedback);
            speak({ text: response.data.feedback });
        } catch (error) {
            console.error("Error analyzing answer:", error);
            alert("Failed to analyze answer.");
        }
    };

    return (
        <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>AI Job Interviewer</h1>

            {/* Job Role Input */}
            <input
                type="text"
                placeholder="Enter Job Role (e.g. Software Engineer)"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                style={{ padding: "10px", width: "300px" }}
            />
            <button onClick={fetchQuestion} style={{ marginLeft: "10px", padding: "10px" }}>
                Get Interview Question
            </button>

            {/* Display Question */}
            {question && (
                <div style={{ marginTop: "20px" }}>
                    <p><strong>Question:</strong> {question}</p>
                    
                    <button onClick={skipQuestion} style={{ marginBottom: "10px", padding: "10px", backgroundColor: "orange", color: "white" }}>
                        Skip Question
                    </button>
                </div>
            )}

            {/* Voice Answering */}
            <button
                onMouseDown={() => listen()}
                onMouseUp={() => stop()}
                style={{ padding: "10px", backgroundColor: listening ? "red" : "blue", color: "white" }}
            >
                {listening ? "Listening..." : "Answer with Voice"}
            </button>

            {/* Typed Answer */}
            <textarea
                placeholder="Or type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{ width: "80%", padding: "10px", marginTop: "10px" }}
            ></textarea>

            <button onClick={analyzeAnswer} style={{ marginTop: "10px", padding: "10px" }}>
                Analyze Answer
            </button>

            {/* User Prompt for Easier Question or Better Answer */}
            <div style={{ marginTop: "20px" }}>
                <input
                    type="text"
                    placeholder="Ask AI for help (e.g. Ask an easier question)"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    style={{ padding: "10px", width: "300px" }}
                />
                <button onClick={fetchQuestion} style={{ marginLeft: "10px", padding: "10px", backgroundColor: "gray", color: "white" }}>
                    Submit Request
                </button>
            </div>

            {/* Feedback */}
            {feedback && (
                <div style={{ marginTop: "20px" }}>
                    <h2>Feedback:</h2>
                    <p>{feedback}</p>
                </div>
            )}
        </div>
    );
};

export default App;
