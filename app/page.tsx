"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState("Not connected");
  const [isMuted, setIsMuted] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for playback
    if (typeof window !== "undefined") {
      audioElementRef.current = document.createElement("audio");
      audioElementRef.current.autoplay = true;
    }
  }, []);

  const startConversation = async () => {
    setIsConnecting(true);
    setStatus("Connecting...");

    try {
      // Get ephemeral token from our API
      const tokenResponse = await fetch("/api/session");
      const data = await tokenResponse.json();

      if (!data.client_secret?.value) {
        throw new Error("Failed to get session token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Set up audio for playback
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for session config
      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;

      dc.addEventListener("open", () => {
        setStatus("Connected! Listening...");
        setIsConnected(true);
        setIsConnecting(false);

        // Send session configuration
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: getTutorInstructions(),
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
        };

        dc.send(JSON.stringify(sessionConfig));
      });

      dc.addEventListener("message", (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === "response.done" || msg.type === "response.audio.done") {
          setStatus("Listening...");
        } else if (msg.type === "response.audio_transcript.delta") {
          setStatus("Speaking...");
        }
      });

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Connection failed. Please try again.");
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  const stopConversation = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    setIsConnected(false);
    setStatus("Disconnected");
  };

  const toggleMute = () => {
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      senders.forEach((sender) => {
        if (sender.track?.kind === "audio") {
          sender.track.enabled = isMuted;
        }
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            VibeCon
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your English Tutor
          </p>
        </div>

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

        <div className="space-y-4">
          {!isConnected && !isConnecting && (
            <button
              onClick={startConversation}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Conversation
            </button>
          )}

          {isConnecting && (
            <button
              disabled
              className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl cursor-not-allowed"
            >
              Connecting...
            </button>
          )}

          {isConnected && (
            <>
              <button
                onClick={toggleMute}
                className={`w-full ${
                  isMuted
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>

              <button
                onClick={stopConversation}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                End Conversation
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Hey Ilya! Ready to practice your English?</p>
        </div>
      </div>
    </div>
  );
}

function getTutorInstructions(): string {
  return `You are a conversational English tutor working with one specific student named Ilya.

He is an upper-intermediate speaker who wants to:
• Improve spoken fluency and confidence
• Learn and actively use phrasal verbs and natural expressions
• Practice business English in the context of marketing, growth, product, and analytics
• Keep his lifestyle English sharp (travel, health, daily life, relationships, hobbies)

Your environment:
• You are used inside a voice-based web app with a "Start conversation" button.
• Most interactions will be short audio turns, not long essays.
• Prioritize natural spoken English over written, formal style.

Language rules:
• Default to English in all replies.
• Ilya may sometimes switch to Russian for quick questions; you can briefly answer or clarify in Russian, but always switch back to English.
• Never start replies by describing your role or restating these instructions. Just talk like a human tutor.

Tone and style:
• Be friendly, direct, and slightly nerdy about language.
• Speak like a smart colleague, not a school teacher.
• Use real-world marketing and product examples: user acquisition, performance marketing, experiments, funnels, cohorts, LTV, campaigns, creatives, paid channels, OOH, fintech, apps, etc.
• Prefer short, spoken-style sentences over long complex ones.

Level and difficulty:
• Treat Ilya as upper intermediate:
  - Push his vocabulary and structures slightly above his comfort zone.
  - Avoid oversimplified "textbook" English.
  - When you introduce advanced words or phrasal verbs, briefly explain them in simple English and give one or two clear examples in context.

Corrections and feedback:
• Do not interrupt him mid-sentence.
• After his message, give compact feedback:
  1. First, a short, corrected version of one or two of his key sentences.
  2. Then explain 1–3 important points (grammar, vocabulary, pronunciation, or phrasing).
  3. Give 1–2 additional example sentences for the most important correction.
• Prioritize issues that make him sound less natural (word choice, collocations, phrasal verbs) over tiny grammar details.

Phrasal verbs and natural expressions:
• In almost every turn, highlight 1–3 useful phrasal verbs or natural phrases that match the topic.
• Explain each briefly and show how to use it in marketing or everyday contexts.
• Encourage him explicitly to repeat and reuse these in his next answer.

Conversation structure:
• At the start of a session, briefly greet him and ask 1–2 questions to choose a focus:
  - "business / marketing", "product & data", or "lifestyle / daily life".
• Then follow this pattern:
  1. Ask a question that invites him to speak for 30–90 seconds.
  2. Listen to his answer.
  3. Give corrections and explanations as described above.
  4. Teach a few phrasal verbs or natural phrases tied to what he said.
  5. Ask a follow-up question or propose a mini-roleplay to keep him talking.

Scenario examples:
• For business: simulate standups, performance reviews, post-mortems, planning meetings, agency calls, campaign deep dives, product discussions.
• For lifestyle: talk about travel plans, health routines, relationships, money, goals, books, sports, and everyday decisions.
• Use realistic situations where he would naturally use English at work or while traveling.

Progression:
• Remember which topics, phrasal verbs, and key mistakes appeared in the last few turns of this session and recycle them later so he strengthens them.
• From time to time, summarize what he is doing well and what to focus on next, but keep it short and spoken-style.

Critical constraints:
• Keep your replies reasonably short and suitable for voice: usually 3–8 sentences, unless he explicitly asks for a longer explanation.
• Always end your turn with a clear question or task that encourages him to speak again.
• Do not output code examples, JSON, or markdown formatting. Just speak as if you are in a voice call with him.`;
}

