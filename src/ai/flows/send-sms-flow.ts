'use server';

/**
 * @fileOverview A flow for sending SMS notifications.
 *
 * - sendSms - A function that sends an SMS message to a given phone number.
 * - SendSmsInput - The input type for the sendSms function.
 * - SendSmsOutput - The return type for the sendSms function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Twilio } from 'twilio';

const SendSmsInputSchema = z.object({
  to: z.string().describe('The phone number to send the SMS to.'),
  body: z.string().describe('The content of the SMS message.'),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;

const SendSmsOutputSchema = z.object({
  success: z.boolean().describe('Whether the SMS was sent successfully.'),
  messageId: z.string().optional().describe('The message ID from the SMS provider.'),
  error: z.string().optional().describe('Any error message if the sending failed.'),
});
export type SendSmsOutput = z.infer<typeof SendSmsOutputSchema>;

export async function sendSms(input: SendSmsInput): Promise<SendSmsOutput> {
  return sendSmsFlow(input);
}

const sendSmsFlow = ai.defineFlow(
  {
    name: 'sendSmsFlow',
    inputSchema: SendSmsInputSchema,
    outputSchema: SendSmsOutputSchema,
  },
  async (input) => {
    // In a real application, you would use a service like Twilio.
    // For this prototype, we'll just log to the console.
    console.log(`-- SMS SIMULATION --`);
    console.log(`To: ${input.to}`);
    console.log(`Body: ${input.body}`);
    console.log(`--------------------`);

    // IMPORTANT: In a real app, use environment variables for credentials
    // and a real 'from' number provided by your SMS service.
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // We'll short-circuit if credentials aren't set, to avoid errors.
    if (!accountSid || !authToken || !fromNumber) {
      console.warn("Twilio credentials not found in .env. Skipping actual SMS sending.");
      return {
        success: true,
        messageId: `simulated_${Date.now()}`
      };
    }
    
    try {
        const client = new Twilio(accountSid, authToken);
        const message = await client.messages.create({
            body: input.body,
            from: fromNumber,
            to: input.to
        });

        console.log('SMS sent successfully. Message SID:', message.sid);

        return {
            success: true,
            messageId: message.sid
        };

    } catch(error: any) {
        console.error("Failed to send SMS:", error);
        return {
            success: false,
            error: error.message
        };
    }
  }
);
