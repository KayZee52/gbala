'use server';

/**
 * @fileOverview An AI flow to analyze a photo of waste and identify its type.
 *
 * - analyzeWastePhoto - A function that handles waste photo analysis.
 * - AnalyzeWastePhotoInput - The input type for the analyzeWastePhoto function.
 * - AnalyzeWastePhotoOutput - The return type for the anlyzeWastePhoto function.
 */

import { ai } from '@/ai/genkit';
import { wasteTypes } from '@/lib/data';
import { z } from 'genkit';

const AnalyzeWastePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of dumped waste, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeWastePhotoInput = z.infer<typeof AnalyzeWastePhotoInputSchema>;


const AnalyzeWastePhotoOutputSchema = z.object({
    wasteType: z.string().describe("The primary type of waste identified in the photo."),
    reasoning: z.string().describe("A brief explanation for why this waste type was chosen."),
});
export type AnalyzeWastePhotoOutput = z.infer<typeof AnalyzeWastePhotoOutputSchema>;


export async function analyzeWastePhoto(input: AnalyzeWastePhotoInput): Promise<AnalyzeWastePhotoOutput> {
  return analyzeWastePhotoFlow(input);
}


const analyzeWastePhotoPrompt = ai.definePrompt({
  name: 'analyzeWastePhotoPrompt',
  input: { schema: AnalyzeWastePhotoInputSchema },
  output: { schema: AnalyzeWastePhotoOutputSchema },
  prompt: `You are an AI expert in waste management and recycling. Your task is to analyze the provided photo and identify the primary type of waste present.

The available waste categories are: ${wasteTypes.join(', ')}.

Based on the image, determine the most fitting category for the waste shown. Your response must be one of the provided categories. Provide a brief reasoning for your choice.

Waste Photo: {{media url=photoDataUri}}`,
});


const analyzeWastePhotoFlow = ai.defineFlow(
  {
    name: 'analyzeWastePhotoFlow',
    inputSchema: AnalyzeWastePhotoInputSchema,
    outputSchema: AnalyzeWastePhotoOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeWastePhotoPrompt(input);
    return output!;
  }
);
