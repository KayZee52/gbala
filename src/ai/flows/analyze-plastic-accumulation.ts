'use server';

/**
 * @fileOverview AI flow to analyze satellite imagery for potential plastic accumulation zones.
 *
 * - analyzePlasticAccumulation - Function to trigger the analysis and return identified zones.
 * - AnalyzePlasticAccumulationInput - Input type for the analysis, including satellite image data URI.
 * - AnalyzePlasticAccumulationOutput - Output type, providing a list of potential plastic accumulation zones.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlasticAccumulationInputSchema = z.object({
  satelliteImageDataUri: z
    .string()
    .describe(
      "A satellite image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePlasticAccumulationInput = z.infer<
  typeof AnalyzePlasticAccumulationInputSchema
>;

const AnalyzePlasticAccumulationOutputSchema = z.object({
  plasticAccumulationZones: z
    .array(z.string())
    .describe(
      'A list of potential plastic accumulation zones identified in the image.'
    ),
});
export type AnalyzePlasticAccumulationOutput = z.infer<
  typeof AnalyzePlasticAccumulationOutputSchema
>;

export async function analyzePlasticAccumulation(
  input: AnalyzePlasticAccumulationInput
): Promise<AnalyzePlasticAccumulationOutput> {
  return analyzePlasticAccumulationFlow(input);
}

const analyzePlasticAccumulationPrompt = ai.definePrompt({
  name: 'analyzePlasticAccumulationPrompt',
  input: {schema: AnalyzePlasticAccumulationInputSchema},
  output: {schema: AnalyzePlasticAccumulationOutputSchema},
  prompt: `You are an AI expert in identifying plastic accumulation zones from satellite imagery.

  Analyze the provided satellite image and identify potential areas where plastic waste is accumulating. Provide a list of these zones.

  Satellite Image: {{media url=satelliteImageDataUri}}`,
});

const analyzePlasticAccumulationFlow = ai.defineFlow(
  {
    name: 'analyzePlasticAccumulationFlow',
    inputSchema: AnalyzePlasticAccumulationInputSchema,
    outputSchema: AnalyzePlasticAccumulationOutputSchema,
  },
  async input => {
    const {output} = await analyzePlasticAccumulationPrompt(input);
    return output!;
  }
);
