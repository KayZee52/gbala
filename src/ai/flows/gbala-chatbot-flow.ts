'use server';

/**
 * @fileOverview A conversational AI flow for the Gbala chatbot.
 *
 * - gbalaChatbot - A function that handles chatbot queries.
 * - GbalaChatbotInput - The input type for the chatbot function.
 * - GbalaChatbotOutput - The return type for the chatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { calculateFloodRisk } from './calculate-flood-risk-flow';
import { mockWasteReports, mockDumpSites, wasteTypes } from '@/lib/data';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

const GbalaChatbotInputSchema = z.object({
  history: z.custom<ChatMessage[]>().describe('The conversation history.'),
  query: z.string().describe('The user\'s question for the Gbala chatbot.'),
});
export type GbalaChatbotInput = z.infer<typeof GbalaChatbotInputSchema>;

const GbalaChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s answer to the user\'s query.'),
  action: z.object({
      type: z.enum(['VIEW_DUMP_SITES']),
      filter: z.string().describe('The waste type to filter the dump sites by.'),
  }).optional().describe('An optional action for the frontend to perform.'),
});
export type GbalaChatbotOutput = z.infer<typeof GbalaChatbotOutputSchema>;

export async function gbalaChatbot(
  input: GbalaChatbotInput
): Promise<GbalaChatbotOutput> {
  return gbalaChatbotFlow(input);
}


// Tool: Get Flood Risk
const getFloodRisk = ai.defineTool(
  {
    name: 'getFloodRisk',
    description: 'Gets the current flood risk for a specified area. Use this if the user asks about flood status or risk levels.',
    inputSchema: z.object({
      areaName: z.string().describe('The area to check the flood risk for, e.g., "Monrovia".'),
    }),
    outputSchema: z.object({
        riskLevel: z.string(),
        reasoning: z.string(),
    })
  },
  async (input) => {
    // In a real app, weather would come from an API
    const weatherForecast = 'Increased rainfall expected.';
    return calculateFloodRisk({
      reports: mockWasteReports,
      areaName: input.areaName,
      weatherForecast,
    });
  }
);


// Tool: Find Dump Sites
const findDumpSites = ai.defineTool(
    {
        name: 'findDumpSites',
        description: `Finds waste dump sites or recycling centers for a specific waste type. If the user asks for something "near me" and does not provide a location, you can leave the location field blank, and the system will search near the user's last known location. If the user provides a specific neighborhood or area, use that as the location.`,
        inputSchema: z.object({
            wasteType: z.string().describe(`The type of waste. Available types are: ${wasteTypes.join(', ')}`),
            location: z.string().optional().describe('The user\'s current location or neighborhood to find the nearest dump sites. If the user says "near me", this can be left blank.'),
        }),
        outputSchema: z.array(z.object({
            name: z.string(),
            address: z.string(),
        }))
    },
    async (input) => {
        // In a real app, you'd use the location to sort by distance.
        // For this prototype, we'll just filter by type. If location is provided, we could filter by neighborhood.
        const filteredSites = mockDumpSites.filter(site => site.acceptedWaste.includes(input.wasteType));
        return filteredSites.map(({ name, address }) => ({ name, address }));
    }
)


const prompt = ai.definePrompt({
  name: 'gbalaChatbotPrompt',
  input: { schema: GbalaChatbotInputSchema },
  output: { schema: GbalaChatbotOutputSchema },
  tools: [getFloodRisk, findDumpSites],
  prompt: `You are the Gbala Assistant, a friendly and helpful AI chatbot for the Gbala waste management app in Liberia.

Your purpose is to help citizens with these tasks:
- **Answer questions about waste management**: Explain what can be recycled, how to sort waste, etc.
- **Provide flood risk alerts**: Use your tools to check the flood risk for an area.
- **Help find dump sites**: Use your tools to find nearby dump sites or recycling centers for specific waste types.

**IMPORTANT FLOW**:
1. Analyze the user's query and the entire conversation history to understand their goal.
2. If the user wants to find a dump site but hasn't provided a waste type, ask for it. Do not use a tool yet.
3. If the user has provided a waste type, use the 'findDumpSites' tool. If they don't provide a location, assume they mean "near me".
4. When you use the 'findDumpSites' tool successfully, your final response should be a short confirmation message, and you MUST include an 'action' in your output to view the sites. For example: response: "I found 5 plastic dump sites near you.", action: { type: 'VIEW_DUMP_SITES', filter: 'Plastic' }

Keep your answers short, simple, and very easy to understand. Always be encouraging and positive.

Conversation History:
{{#each history}}
- {{this.role}}: {{this.content}}
{{/each}}

User's latest message: "{{query}}"`,
});

const gbalaChatbotFlow = ai.defineFlow(
  {
    name: 'gbalaChatbotFlow',
    inputSchema: GbalaChatbotInputSchema,
    outputSchema: GbalaChatbotOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    
    // If the model gives a direct text response, return it.
    if (llmResponse.output?.response) {
      return { response: llmResponse.output.response, action: llmResponse.output.action };
    }
    
    // If the model calls a tool, process the tool's output.
    if (llmResponse.toolCalls.length > 0) {
        let toolResponseText = 'Based on the information I found:\n';

        for (const toolCall of llmResponse.toolCalls) {
            const toolOutput = toolCall.output;
            if (toolCall.toolName === 'findDumpSites') {
                const sites = toolOutput as any[];
                if (sites.length > 0) {
                    const wasteType = (toolCall.input as any).wasteType;
                    // This is a special instruction for the model. Instead of listing sites,
                    // we'll instruct it to return a response with an action.
                    const responseWithAction = {
                        response: `I found ${sites.length} ${wasteType} dump sites near you.`,
                        action: {
                            type: 'VIEW_DUMP_SITES' as const,
                            filter: wasteType,
                        }
                    };
                    return responseWithAction;
                } else {
                    toolResponseText += `\nI couldn't find any dump sites for that specific waste type. You could try searching for 'Other' or 'Mixed' waste.`;
                }
            } else if (toolCall.toolName === 'getFloodRisk') {
                 const risk = toolOutput as any;
                 toolResponseText += `\nThe flood risk is currently ${risk.riskLevel}. Reason: ${risk.reasoning}`;
            } else {
                toolResponseText += `\n- ${toolCall.toolName} results: ${JSON.stringify(toolOutput)}\n`;
            }
        }

        // This part now primarily handles the fallback cases, like flood risk.
        const finalResponse = await ai.generate({
            prompt: `You are the Gbala chatbot. You have just used some tools to answer the user's request.
The user's original query was: "${input.query}"
The conversation history is: ${JSON.stringify(input.history)}
The result from your tools is:
${toolResponseText}

Now, formulate a friendly, human-readable response based on this data. Do not mention the tools you used. Just give the answer directly. Keep it simple and direct.`,
        });

        return { response: finalResponse.text };
    }
    
    // Fallback response if no text or tool call is generated
    return { response: "I'm sorry, I'm having trouble understanding. Could you please rephrase your request?" };
  }
);
