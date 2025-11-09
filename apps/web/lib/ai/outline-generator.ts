import { openai, DEFAULT_MODEL } from "./openai";
import { OutlineSchema, type Outline } from "@epoch/schema";
import { zodResponseFormat } from "openai/helpers/zod";

export interface OutlineGenerationParams {
  topic: string;
  era?: string;
  targetDuration?: number; // in seconds, default 1200 (20 min)
  additionalContext?: string;
}

/**
 * Generates a structured episode outline using OpenAI with structured outputs
 */
export async function generateOutline(
  params: OutlineGenerationParams
): Promise<Outline> {
  const {
    topic,
    era,
    targetDuration = 1200,
    additionalContext = "",
  } = params;

  const systemPrompt = `You are an expert podcast scriptwriter and historian specializing in creating engaging, narrative-driven history podcasts. Your task is to create a detailed outline for a podcast episode.

Guidelines:
- Use a 5-act narrative structure: Hook, Context, Conflict, Breakthrough, Legacy
- Each section should have 2-5 specific beats (key moments or ideas)
- Include accurate historical citations with titles, authors, and years
- Target duration: ${targetDuration} seconds (approximately ${Math.round(targetDuration / 60)} minutes)
- Write for an intelligent general audience
- Focus on compelling storytelling while maintaining historical accuracy
- Include diverse perspectives when relevant
- Cite primary sources, scholarly works, and reputable secondary sources`;

  const userPrompt = `Create a podcast episode outline about: ${topic}${era ? `\nHistorical era: ${era}` : ""}${additionalContext ? `\nAdditional context: ${additionalContext}` : ""}

The outline should:
1. Start with a compelling hook that draws listeners in
2. Provide necessary historical context
3. Explore the central conflict or tension
4. Present the breakthrough, resolution, or turning point
5. Conclude with the legacy and lasting impact

Each section should include specific narrative beats with supporting citations.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(OutlineSchema, "outline"),
      temperature: 0.7,
      max_tokens: 4000,
    });

    const outline = completion.choices[0]?.message?.parsed;

    if (!outline) {
      throw new Error("Failed to parse outline from OpenAI response");
    }

    return outline;
  } catch (error) {
    console.error("Error generating outline:", error);
    throw new Error(
      `Failed to generate outline: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
