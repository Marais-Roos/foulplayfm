import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from '@/sanity/env';

const sanity = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// 🧠 THE MODEL LIST (Priority Order)
// If one fails, we try the next.
const MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free", // Fastest & Smartest
  "google/gemini-2.0-flash-exp:free", // Backup
  "meta-llama/llama-3.3-70b-instruct:free", // Powerful backup
  "deepseek/deepseek-chat:free", // Good alternative
];

export async function POST(req: Request) {
  try {
    const { songName, artist, showTitle, hostNames } = await req.json();

    console.log(`\n--- 🧠 GENERATING SCRIPT FOR SHOW: ${showTitle} ---`);
    console.log(`👥 Hosts: ${hostNames.join(', ')}`);
    console.log(`🎵 Context: ${songName} by ${artist}`);

    // Fetch personalities
    const hostsData = await sanity.fetch(
      `*[_type == "presenter" && name in $names]{ name, voicePrompt }`,
      { names: hostNames }
    );

    if (!hostsData || hostsData.length === 0) {
      return NextResponse.json({ error: "Hosts not found" }, { status: 404 });
    }

    // Construct Cast List
    const profiles = hostsData.map((h: any) => 
      `- NAME: ${h.name}\n  PERSONALITY: ${h.voicePrompt || "Energetic Radio DJ"}`
    ).join("\n\n");

    const isDialogue = hostsData.length > 1;
    const styleInstruction = isDialogue 
      ? "Write a short, punchy BANTER (3-4 lines total) between the hosts."
      : "Write a short, high-energy MONOLOGUE (1-2 sentences).";

    const systemMessage = `You are the showrunner for '${showTitle}'.
          
    THE CAST:
    ${profiles}

    CONTEXT:
    The song '${songName}' by '${artist}' just finished playing.

    DIRECTIVES:
    - ${styleInstruction}
    - Be reactive to the song title or artist.
    - Use the specific slang/vibe defined in the personalities.
    - If writing dialogue, format it like a script: "Name: [Line]"
    - KEEP IT SHORT. No long intros.`;

    // 🔄 FAILOVER LOOP
    let script = "";
    let lastError = null;

    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}...`);
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: "Action!" }
          ],
          temperature: 0.85,
          max_tokens: 250, 
        });

        script = completion.choices[0].message.content || "";
        if (script) break; // Success! Exit loop.

      } catch (error: any) {
        console.warn(`⚠️ Model ${model} failed: ${error?.status || error.message}`);
        lastError = error;
        // Continue to next model...
      }
    }

    if (!script) {
        console.error("❌ All models failed.");
        throw lastError || new Error("All AI models busy.");
    }

    console.log("📝 GENERATED SCRIPT:");
    console.log(script);
    console.log("-------------------------------------------\n");

    return NextResponse.json({ script });

  } catch (error: any) {
    console.error("❌ Script Gen Error:", error);
    // Return a friendly error so the UI doesn't crash
    const msg = error?.status === 429 ? "AI Overload (Try again)" : "Failed to generate script";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}