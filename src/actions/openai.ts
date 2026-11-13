'use server';

import 'server-only';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { returnSystemPrompt, returnPromptString } from '../lib/prompts/index';

export async function generateCoverLetter(
	resume: string,
	jobDescription: string
) {
	console.log('generating....');

	try {
		const systemPrompt = returnSystemPrompt('professional');
		const prompt = returnPromptString(true, true, resume, jobDescription);
		console.log('prompt', prompt);
		const { text, usage } = await generateText({
			model: openai('gpt-4-turbo'),
			system: systemPrompt,
			prompt: prompt,
		});

		console.log('Chat completion result', { text, usage });
		return { chatCompletion: { text, usage } };
	} catch (error) {
		console.error(error);
		throw new Error('Error processing request');
	}
}
