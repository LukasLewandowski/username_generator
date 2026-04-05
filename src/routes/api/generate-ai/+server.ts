import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OpenRouter } from '@openrouter/sdk';
import { buildAIPrompt } from '$lib/aiUsernameGenerator';
import { getCharactersFromThemes, type Theme } from '$lib/themes';
import { env } from '$env/dynamic/private';

/** Free models, first preferred; OpenRouter falls through the list on errors / limits. */
const OPENROUTER_FREE_MODELS = [
	'meta-llama/llama-3.2-3b-instruct:free',
	'mistralai/mistral-7b-instruct:free',
	'qwen/qwen-2.5-7b-instruct:free'
] as const;

function openRouterClient(apiKey: string) {
	return new OpenRouter({
		apiKey,
		appTitle: 'Username Generator',
		retryConfig: {
			strategy: 'backoff',
			backoff: {
				initialInterval: 1500,
				maxInterval: 20_000,
				exponent: 2,
				maxElapsedTime: 45_000
			},
			retryConnectionErrors: true
		}
	});
}

function openRouterErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		const status =
			'statusCode' in error && typeof (error as { statusCode: unknown }).statusCode === 'number'
				? `${(error as { statusCode: number }).statusCode} `
				: '';
		return `${status}${error.message}`;
	}
	return String(error);
}

function assistantContentToString(
	content: string | Array<{ text?: string }> | null | undefined
): string {
	if (content == null) return '';
	if (typeof content === 'string') return content.trim();
	if (!Array.isArray(content)) return '';
	return content
		.map((part) => (typeof part?.text === 'string' ? part.text : ''))
		.join('')
		.trim();
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
		const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
		if (!OPENROUTER_API_KEY) {
			return json({ error: 'OpenRouter API key not configured' }, { status: 500 });
		}

		if (!themes || !Array.isArray(themes)) {
			return json({ error: 'Invalid request: themes array required' }, { status: 400 });
		}

		const themeCharacters = getCharactersFromThemes(themes);
		const prompt = buildAIPrompt(themes, themeCharacters, previousUsernames);

		const referer =
			request.headers.get('origin') || request.headers.get('referer') || 'https://usernamegenerator.app';

		const client = openRouterClient(OPENROUTER_API_KEY);
		const completion = await client.chat.send({
			httpReferer: referer,
			appTitle: 'Username Generator',
			chatRequest: {
				model: OPENROUTER_FREE_MODELS[0],
				models: [...OPENROUTER_FREE_MODELS],
				messages: [{ role: 'user', content: prompt }],
				maxCompletionTokens: 50,
				temperature: 0.9,
				stream: false
			}
		});

		const choice = completion.choices?.[0];
		const finishReason = choice?.finishReason;
		const content = assistantContentToString(choice?.message?.content);

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
		console.error('AI generation error:', openRouterErrorMessage(error));

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
				{ error: 'Failed to generate username', details: openRouterErrorMessage(error) },
				{ status: 500 }
			);
		}
	}
};
