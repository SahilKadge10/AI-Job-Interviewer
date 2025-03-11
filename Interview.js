import React, { useState } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const Interview = () => {
    const [jobRole, setJobRole] = useState("");
    const [question, setQuestion] = useState("");
    const [textAnswer, setTextAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [betterAnswer, setBetterAnswer] = useState("");
    const [userPrompt, setUserPrompt] = useState("");

    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    const fetchQuestion = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/getQuestion", { jobRole, userPrompt });
            setQuestion(response.data.question);
            setUserPrompt(""); // Reset user prompt after fetching question
        } catch (error) {
            console.error("Error fetching question:", error.message);
        }
    };

    const analyzeAnswer = async (answer) => {
        try {
            const response = await axios.post("http://localhost:5000/api/analyzeAnswer", {
                answer,
                userPrompt: userPrompt || null
            });

            setFeedback(response.data.feedback);
            if (response.data.betterAnswer) {
                setBetterAnswer(response.data.betterAnswer);
            }
        } catch (error) {
            console.error("Error analyzing answer:", error.message);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h1 className="text-2xl font-bold">AI Job Interviewer</h1>

            <div className="space-y-2">
                <label className="block font-medium">Desired Job Role:</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                />
                <button onClick={fetchQuestion} className="bg-blue-500 text-white px-4 py-2 rounded">Get Question</button>
            </div>

            {question && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold">Question: {question}</h2>

                    {/* ✅ Voice Answer Input */}
                    <button onClick={SpeechRecognition.startListening} className="bg-green-500 text-white px-4 py-2 rounded">Answer with Voice</button>
                    <button onClick={SpeechRecognition.stopListening} className="bg-red-500 text-white px-4 py-2 ml-2 rounded">Stop</button>
                    
                    <textarea
                        className="w-full p-2 border mt-2 rounded"
                        placeholder="Your answer will appear here..."
                        value={transcript}
                        readOnly
                    ></textarea>

                    <button onClick={() => analyzeAnswer(transcript)} className="bg-blue-600 text-white px-4 py-2 rounded float-right mt-2">Send</button>

                    <hr className="my-4" />

                    {/* ✅ Text Answer Input (Fixed) */}
                    <h3 className="text-lg font-semibold">Type Your Answer:</h3>
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder="Type your answer here..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                    ></textarea>
                    <button onClick={() => analyzeAnswer(textAnswer)} className="bg-blue-600 text-white px-4 py-2 rounded mt-2">Submit</button>

                    {/* ✅ User Prompt */}
                    <h3 className="text-lg font-semibold mt-4">Need Help?</h3>
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        placeholder="Example: Can you ask an easier question?"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                    />
                    <button onClick={fetchQuestion} className="bg-gray-500 text-white px-4 py-2 rounded mt-2">Submit Request</button>
                </div>
            )}

            {feedback && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold">Feedback:</h2>
                    <p>{feedback}</p>
                    {betterAnswer && <p className="mt-2 font-medium text-green-600">Better Answer: {betterAnswer}</p>}
                </div>
            )}
        </div>
    );
};

export default Interview;
