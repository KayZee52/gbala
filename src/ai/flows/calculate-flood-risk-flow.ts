'use server';

/**
 * @fileOverview An AI flow to calculate the flood risk for a given area.
 *
 * - calculateFloodRisk - A function that handles flood risk calculation.
 * - CalculateFloodRiskInput - The input type for the calculateFloodRisk function.
 * - CalculateFloodRiskOutput - The return type for the calculateFloodRisk function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { mockWasteReports } from '@/lib/data';

type Report = (typeof mockWasteReports)[0];

const CalculateFloodRiskInputSchema = z.object({
  reports: z.custom<Report[]>().describe('A list of recent waste reports.'),
  areaName: z.string().describe('The name of the area to assess (e.g., a neighborhood or district).'),
  weatherForecast: z.string().describe("A brief summary of the upcoming weather (e.g., 'Heavy rainfall expected', 'Dry conditions').")
});
export type CalculateFloodRiskInput = z.infer<typeof CalculateFloodRiskInputSchema>;


const CalculateFloodRiskOutputSchema = z.object({
    riskLevel: z.enum(['Low', 'Medium', 'High', 'Severe']).describe("The calculated flood risk level."),
    reasoning: z.string().describe("A brief, user-friendly explanation for the calculated risk level."),
});
export type CalculateFloodRiskOutput = z.infer<typeof CalculateFloodRiskOutputSchema>;


export async function calculateFloodRisk(input: CalculateFloodRiskInput): Promise<CalculateFloodRiskOutput> {
  return calculateFloodRiskFlow(input);
}


const prompt = ai.definePrompt({
  name: 'calculateFloodRiskPrompt',
  input: { schema: CalculateFloodRiskInputSchema },
  output: { schema: CalculateFloodRiskOutputSchema },
  prompt: `You are an AI expert in urban planning and environmental science, specializing in flood risk assessment.

Your task is to analyze the provided data for {{areaName}} and determine the current flood risk level.

Consider these factors:
1.  **Weather Forecast**: {{weatherForecast}}
2.  **Recent Waste Reports**: The density and type of waste can significantly impact drainage and increase flood risk. Plastic waste is particularly dangerous.

Here are the recent reports:
{{#each reports}}
- {{this.description}} (Type: {{this.type}}) at {{this.locationName}}
{{else}}
No recent waste reports.
{{/each}}

Based on all this information, determine a flood risk level ('Low', 'Medium', 'High', 'Severe') and provide a short, clear reasoning for your assessment that will be displayed to citizens on a dashboard.`,
});


const calculateFloodRiskFlow = ai.defineFlow(
  {
    name: 'calculateFloodRiskFlow',
    inputSchema: CalculateFloodRiskInputSchema,
    outputSchema: CalculateFloodRiskOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
