import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the Google GenAI client
const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { message, service } = await req.json();

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!service) {
      return Response.json({ error: "Service is required" }, { status: 400 });
    }

    let response;

    if (service === "openai") {
      // Use OpenAI client directly as shown in the example
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      });

      response = completion.choices[0].message.content;
    } else if (service === "gemini") {
      // Use Google GenAI client as shown in the example
      const result = await genai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: message,
      });

      response = result.text;
    } else {
      return Response.json({ error: "Invalid service" }, { status: 400 });
    }

    return Response.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
