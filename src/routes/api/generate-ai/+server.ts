import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Groq from 'groq-sdk';
import { buildAIPrompt } from '$lib/aiUsernameGenerator';
import { getCharactersFromThemes, type Theme } from '$lib/themes';
import { env } from '$env/dynamic/private';

const GROQ_MODEL = 'llama-3.1-8b-instant';

function groqErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const status =
			'status' in error && typeof (error as { status: unknown }).status === 'number'
				? `${(error as { status: number }).status} `
				: '';
		return `${status}${error.message}`;
	}
	return String(error);
}

export const POST: RequestHandler = async ({ request }) => {
	let body: { themes: Theme[]; previousUsernames?: string[] };
	let themes: Theme[];
	let previousUsernames: string[] = [];

	try {
		body = await request.json();
		themes = body.themes;
		previousUsernames = body.previousUsernames || [];
	} catch (parseError) {
		return json({ error: 'Invalid JSON in request body' }, { status: 400 });
	}

	try {
		const GROQ_API_KEY = env.GROQ_API_KEY;
		if (!GROQ_API_KEY) {
			return json({ error: 'Groq API key not configured' }, { status: 500 });
		}

		if (!themes || !Array.isArray(themes)) {
			return json({ error: 'Invalid request: themes array required' }, { status: 400 });
		}

		const themeCharacters = getCharactersFromThemes(themes);
		const prompt = buildAIPrompt(themes, themeCharacters, previousUsernames);

		const groqRequest = {
			model: GROQ_MODEL,
			messages: [{ role: 'user' as const, content: prompt }],
			max_tokens: 50,
			temperature: 0.9
		};
		console.info('[generate-ai] Groq request:', JSON.stringify(groqRequest, null, 2));

		const groq = new Groq({ apiKey: GROQ_API_KEY });
		const completion = await groq.chat.completions.create(groqRequest);
		console.info('[generate-ai] Groq response:', JSON.stringify(completion, null, 2));

		const choice = completion.choices?.[0];
		const finishReason = choice?.finish_reason;
		const content = (choice?.message?.content ?? '').trim();

		if (!content) {
			const reason = finishReason ? ` (finish_reason: ${finishReason})` : '';
			throw new Error(`No content in AI response${reason}`);
		}

		let username = content
			.replace(/^["']|["']$/g, '')
			.replace(/\n.*/g, '')
			.trim()
			.split(/\s+/)[0];

		const cleanedUsername = username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);

		const forbiddenUsernames = [
			'please',
			'here',
			'there',
			'thanks',
			'thank',
			'sure',
			'ok',
			'okay',
			'yes',
			'no',
			'maybe',
			'user',
			'username',
			'name'
		];

		const lowerCleaned = cleanedUsername.toLowerCase();
		const shouldFallback =
			!cleanedUsername || cleanedUsername.length < 2 || forbiddenUsernames.includes(lowerCleaned);

		if (shouldFallback) {
			const { generateUsername } = await import('$lib/usernameGenerator');
			username = generateUsername({ themes });
		} else {
			username = cleanedUsername;
		}

		return json({
			username,
			prompt,
			content
		});
	} catch (error) {
		console.error('AI generation error:', groqErrorMessage(error));

		try {
			if (!themes || !Array.isArray(themes)) {
				throw new Error('Invalid themes');
			}

			const { generateUsername } = await import('$lib/usernameGenerator');
			const username = generateUsername({ themes });

			return json({
				username,
				error: 'AI generation failed, using fallback'
			});
		} catch (fallbackError) {
			return json(
				{ error: 'Failed to generate username', details: groqErrorMessage(error) },
				{ status: 500 }
			);
		}
	}
};
