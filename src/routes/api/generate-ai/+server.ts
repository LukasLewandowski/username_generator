import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildAIPrompt } from '$lib/aiUsernameGenerator';
import { getCharactersFromThemes, type Theme } from '$lib/themes';
import { env } from '$env/dynamic/private';

// Rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_REQUESTS = 50;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const requests = rateLimitMap.get(ip) || [];

	// Remove old requests outside the window
	const recentRequests = requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW);

	if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
		const oldestRequest = recentRequests[0];
		const resetAt = oldestRequest + RATE_LIMIT_WINDOW;
		return {
			allowed: false,
			remaining: 0,
			resetAt
		};
	}

	// Add current request
	recentRequests.push(now);
	rateLimitMap.set(ip, recentRequests);

	// Clean up old entries periodically (every 5 minutes)
	if (Math.random() < 0.01) {
		for (const [key, timestamps] of rateLimitMap.entries()) {
			const filtered = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW * 5);
			if (filtered.length === 0) {
				rateLimitMap.delete(key);
			} else {
				rateLimitMap.set(key, filtered);
			}
		}
	}

	return {
		allowed: true,
		remaining: RATE_LIMIT_REQUESTS - recentRequests.length,
		resetAt: now + RATE_LIMIT_WINDOW
	};
}

function getClientIP(request: Request): string {
	// Try to get IP from headers (for proxies/load balancers)
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}

	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP;
	}

	// Fallback: use a session-based identifier if IP is not available
	// In a real app, you might want to use cookies or session IDs
	return request.headers.get('user-agent') || 'unknown';
}

export const POST: RequestHandler = async ({ request }) => {
	// Parse request body once and store it
	let body: { themes: Theme[] };
	let themes: Theme[];

	try {
		body = await request.json();
		themes = body.themes;
	} catch (parseError) {
		return json({ error: 'Invalid JSON in request body' }, { status: 400 });
	}

	try {
		// Check API key
		const OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
		if (!OPENROUTER_API_KEY) {
			return json({ error: 'OpenRouter API key not configured' }, { status: 500 });
		}

		// Rate limiting
		const clientIP = getClientIP(request);
		const rateLimit = checkRateLimit(clientIP);

		if (!rateLimit.allowed) {
			return json(
				{
					error: 'Rate limit exceeded',
					message: `Too many requests. Please try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000)} seconds.`,
					resetAt: rateLimit.resetAt
				},
				{ status: 429 }
			);
		}

		if (!themes || !Array.isArray(themes)) {
			return json({ error: 'Invalid request: themes array required' }, { status: 400 });
		}

		if (!themes || !Array.isArray(themes)) {
			return json({ error: 'Invalid request: themes array required' }, { status: 400 });
		}

		// Get theme data
		const themeCharacters = getCharactersFromThemes(themes);
		const prompt = buildAIPrompt(themes, themeCharacters);

		// Call OpenRouter API directly
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'HTTP-Referer': request.headers.get('referer') || 'https://username-generator.local',
				'X-Title': 'Username Generator'
			},
			body: JSON.stringify({
				model: 'google/gemma-3-27b-it:free',
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				max_tokens: 50,
				temperature: 0.8
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(`OpenRouter API error: ${response.status} ${errorData.error?.message || response.statusText}`);
		}

		const data = await response.json();

		// Extract username from response
		const content = data.choices[0]?.message?.content?.trim();
		if (!content) {
			throw new Error('No content in AI response');
		}

		// Clean up the response - remove any extra text, quotes, etc.
		let username = content
			.replace(/^["']|["']$/g, '') // Remove quotes
			.replace(/\n.*/g, '') // Remove newlines and everything after
			.trim()
			.split(/\s+/)[0]; // Take only first word

		// Validate username (max 20 chars, alphanumeric and common special chars)
		const cleanedUsername = username.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);

		// Reject obviously non-username generic words and fall back
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
		let shouldFallback = !cleanedUsername || cleanedUsername.length < 2 || forbiddenUsernames.includes(lowerCleaned);

		if (shouldFallback) {
			// Fallback to regular generation if AI response is invalid or generic
			const { generateUsername } = await import('$lib/usernameGenerator');
			username = generateUsername({ themes });
		} else {
			username = cleanedUsername;
		}

		return json({
			username,
			rateLimit: {
				remaining: rateLimit.remaining,
				resetAt: rateLimit.resetAt
			}
		});
	} catch (error) {
		console.error('AI generation error:', error);

		// Fallback to regular generation on error
		try {
			const { generateUsername } = await import('$lib/usernameGenerator');
			// Use already parsed themes
			if (!themes || !Array.isArray(themes)) {
				throw new Error('Invalid themes');
			}
			const username = generateUsername({ themes });

			return json({
				username,
				error: 'AI generation failed, using fallback',
				rateLimit: {
					remaining: 0,
					resetAt: Date.now() + RATE_LIMIT_WINDOW
				}
			});
		} catch (fallbackError) {
			// If we can't parse body again, return error
			return json(
				{ error: 'Failed to generate username', details: String(error) },
				{ status: 500 }
			);
		}
	}
};
