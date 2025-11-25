import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set!");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    console.log("Transcribing audio file:", audioFile.name, audioFile.size, "bytes");

    // Use fetch API directly instead of OpenAI SDK (better for Vercel serverless)
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");
    formData.append("language", "en");

    console.log("Calling OpenAI Whisper API directly...");
    
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("Transcription successful:", result.text);
    
    return NextResponse.json({ text: result.text });

  } catch (error: any) {
    console.error("Transcription error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      type: error.type,
      stack: error.stack,
      response: error.response?.data
    });
    return NextResponse.json(
      { 
        error: "Failed to transcribe audio", 
        details: error.message,
        status: error.status,
        type: error.type,
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 10)
      },
      { status: 500 }
    );
  }
}

