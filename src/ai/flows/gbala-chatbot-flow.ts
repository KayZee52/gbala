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
  const llmResponse = await prompt(input);
  
  // If the model gives a direct text response, return it.
  if (llmResponse.output?.response) {
    return { response: llmResponse.output.response, action: llmResponse.output.action };
  }
  
  // Fallback response if no text or tool call is generated
  return { response: "I'm sorry, I'm having trouble understanding. Could you please rephrase your request?" };
}


const prompt = ai.definePrompt({
  name: 'gbalaChatbotPrompt',
  input: { schema: GbalaChatbotInputSchema },
  output: { schema: GbalaChatbotOutputSchema },
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
    
    // Fallback response if no text or tool call is generated
    return { response: "I'm sorry, I'm having trouble understanding. Could you please rephrase your request?" };
  }
);
