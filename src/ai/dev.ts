import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-plastic-accumulation.ts';
import '@/ai/flows/send-sms-flow.ts';
import '@/ai/flows/analyze-waste-photo-flow.ts';
import '@/ai/flows/calculate-flood-risk-flow.ts';
import '@/ai/flows/gbala-chatbot-flow.ts';
