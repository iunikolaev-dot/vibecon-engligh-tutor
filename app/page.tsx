"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [status, setStatus] = useState("Ready to start");
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const startRecording = async () => {
    try {
      setStatus("🎤 Recording your voice...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio file with proper format for Whisper API
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp4" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("❌ Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setStatus("⏳ Processing your speech...");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Step 1: Convert speech to text (Whisper)
      setStatus("📝 Transcribing your speech...");
      const formData = new FormData();
      // Whisper API needs a filename with extension
      const audioFile = new File([audioBlob], "recording.mp4", { type: "audio/mp4" });
      formData.append("audio", audioFile);

      const transcriptResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        throw new Error(`Transcription failed: ${JSON.stringify(errorData)}`);
      }

      const { text: userText } = await transcriptResponse.json();

      if (!userText) {
        throw new Error("No transcription received");
      }

      // Add user message to conversation
      setConversation((prev) => [
        ...prev,
        { role: "user", content: userText, timestamp: new Date() },
      ]);

      // Step 2: Get AI response (GPT-4)
      setStatus("🤔 AI is thinking...");
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: conversation,
        }),
      });

      const { response: aiText } = await chatResponse.json();

      // Step 3: Convert AI text to speech (TTS)
      setStatus("🔊 Generating AI voice...");
      const ttsResponse = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });

      const responseAudioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(responseAudioBlob);

      // Add AI message to conversation
      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: aiText, timestamp: new Date(), audioUrl },
      ]);

      // Play the audio
      setCurrentAudio(audioUrl);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        // Try to play, handle autoplay blocking
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked, user needs to interact:", err);
          // Audio will still be available via the 🔊 button in chat
        });
      }

      setStatus("✅ Ready for your next message");
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing audio:", error);
      setStatus("❌ Error processing. Try again.");
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const downloadConversation = () => {
    const conversationText = conversation
      .map((msg) => {
        const time = msg.timestamp.toLocaleTimeString();
        return `[${time}] ${msg.role === "user" ? "You" : "Tutor"}: ${msg.content}`;
      })
      .join("\n\n");

    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibecon-conversation-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            VibeCon
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your English Tutor (Voice Edition)
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            v2.1 (Direct API + TTS Fixed) - Build {new Date(Date.now() + (4 * 60 * 60 * 1000)).toISOString().slice(0,16).replace('T', ' ')} GMT+4
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-4">
          <div className="mb-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                Status
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {status}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {!isRecording && !isProcessing && (
              <button
                onClick={startRecording}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎤 Start Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse"
              >
                ⏹ Stop Recording
              </button>
            )}

            {isProcessing && (
              <button
                disabled
                className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl cursor-not-allowed"
              >
                ⏳ Processing...
              </button>
            )}

            {conversation.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={downloadConversation}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  📥 Download
                </button>
                <button
                  onClick={clearConversation}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
                >
                  🗑 Clear
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">
              How to use:
            </p>
            <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>1. Click "Start Recording" and speak in English</li>
              <li>2. Click "Stop Recording" when done</li>
              <li>3. Wait for AI to transcribe, analyze, and respond</li>
              <li>4. Listen to the AI's voice feedback</li>
              <li>5. Repeat!</li>
            </ol>
          </div>
        </div>

        {conversation.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Conversation History
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                    }`}
                  >
                    <p className="text-xs opacity-75 mb-1 flex items-center justify-between">
                      <span>
                        {msg.role === "user" ? "You" : "Tutor"} •{" "}
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                      {msg.audioUrl && (
                        <button
                          onClick={() => playAudio(msg.audioUrl!)}
                          className="ml-2 hover:scale-110 transition-transform"
                        >
                          🔊
                        </button>
                      )}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={conversationEndRef} />
            </div>
          </div>
        )}

        {conversation.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Hey Ilya! Click "Start Recording" to practice your English.</p>
            <p className="text-sm mt-2">
              Record your voice, and I'll help you improve!
            </p>
          </div>
        )}

        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}

