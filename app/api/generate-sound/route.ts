import { generateSoundSchema } from "@/lib/generate-sound-schema";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

const ELEVENLABS_URL = "https://api.elevenlabs.io/v1/sound-generation";

function validationErrorMessage(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request";

  if (issue.path.includes("text")) {
    if (issue.code === "too_small") return "Prompt is required";
    if (issue.code === "too_big") return "Prompt too long (max 500 characters)";
    return "Prompt is required";
  }

  if (issue.path.includes("duration_seconds")) {
    return "Duration must be between 0.5 and 22 seconds";
  }

  if (issue.path.includes("prompt_influence")) {
    return "Prompt influence must be between 0 and 1";
  }

  return "Invalid request";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = generateSoundSchema.parse(body);

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Sound generation is not configured" },
        { status: 500 },
      );
    }

    let response: Response;
    try {
      response = await fetch(ELEVENLABS_URL, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed),
      });
    } catch {
      return NextResponse.json(
        { error: "Could not reach sound generation service" },
        { status: 502 },
      );
    }

    if (!response.ok) {
      if (response.status >= 500) {
        return NextResponse.json(
          {
            error: "Sound generation service is temporarily unavailable",
          },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: "Sound generation failed. Please try again." },
        { status: 502 },
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: validationErrorMessage(error) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
