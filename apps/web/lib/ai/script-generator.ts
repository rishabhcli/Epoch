import { openai, DEFAULT_MODEL } from "./openai";
import { ScriptSchema, type Script, type Outline } from "@epoch/schema";
import { zodResponseFormat } from "openai/helpers/zod";

export interface ScriptGenerationParams {
  outline: Outline;
  voiceStyle?: string;
  targetWordCount?: number; // default 1500
}

/**
 * Expands an outline into a full podcast script with narration
 */
export async function generateScript(
  params: ScriptGenerationParams
): Promise<Script> {
  const { outline, voiceStyle = "conversational yet authoritative", targetWordCount = 1500 } = params;

  const systemPrompt = `You are an expert podcast scriptwriter specializing in history content. Your task is to expand a structured outline into a complete, engaging podcast script.

Writing guidelines:
- Voice: ${voiceStyle}
- Target length: ${targetWordCount} words (approximately ${Math.round(targetWordCount / 150)}-${Math.round(targetWordCount / 130)} minutes when spoken)
- Write for the ear, not the eye (use natural, spoken language)
- Vary sentence length and structure for dynamic pacing
- Use vivid, sensory details to bring history to life
- Include smooth transitions between sections
- Weave citations naturally into the narrative
- Avoid academic jargon; explain complex concepts clearly
- Use present tense for immediacy when describing historical scenes
- Include rhetorical questions to engage listeners
- Build narrative tension and release
- End with a thought-provoking conclusion

Structure:
1. Introduction: Deliver the hook compellingly (60-90 seconds)
2. Five sections following the outline's narrative arc
3. Conclusion: Tie themes together and leave lasting impression (45-60 seconds)

The transcript field should contain the clean spoken text without any stage directions or formatting markers.`;

  const outlineContext = JSON.stringify(outline, null, 2);

  const userPrompt = `Expand the following outline into a complete podcast script:

${outlineContext}

Create an engaging, narrative-driven script that:
- Opens with the hook in a compelling way
- Flows naturally through all five acts
- Incorporates all citations from the outline
- Maintains historical accuracy while being entertaining
- Builds to meaningful conclusions about legacy and impact
- Totals approximately ${targetWordCount} words

Write as if you're having an intelligent conversation with an engaged listener.`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(ScriptSchema, "script"),
      temperature: 0.8,
      max_tokens: 8000,
    });

    const script = completion.choices[0]?.message?.parsed;

    if (!script) {
      throw new Error("Failed to parse script from OpenAI response");
    }

    return script;
  } catch (error) {
    console.error("Error generating script:", error);
    throw new Error(
      `Failed to generate script: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
