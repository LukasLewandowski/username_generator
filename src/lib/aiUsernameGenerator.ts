import { getCharactersFromThemes, themes, type Theme } from './themes';
import { generateUsername } from './usernameGenerator';

export interface AIGenerationError {
	message: string;
	rateLimit?: {
		remaining: number;
		resetAt: number;
	};
}

/**
 * Type guard to check if an error is an AIGenerationError
 * AIGenerationError is a plain object, not an Error instance
 */
function isAIGenerationError(error: unknown): error is AIGenerationError {
	return (
		error !== null &&
		typeof error === 'object' &&
		'message' in error &&
		!(error instanceof Error)
	);
}

/**
 * Generates a username using AI (LLM) based on selected themes
 * @param themes Selected themes to base the username on
 * @returns Promise resolving to a generated username
 * @throws {AIGenerationError} If AI generation fails or rate limit is exceeded
 */
export async function generateAIGeneratedUsername(selectedThemes: Theme[]): Promise<string> {
	try {
		const response = await fetch('/api/generate-ai', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ themes: selectedThemes })
		});

		// If response is not JSON, fall back to regular generation
		// This handles 404/405 errors from static sites without server-side API routes
		const contentType = response.headers.get('content-type');
		if (!contentType || !contentType.toLowerCase().includes('application/json')) {
			console.warn('AI generation not available, using fallback');
			return generateUsername({ themes: selectedThemes });
		}

		const data = await response.json();

		if (!response.ok) {
			const error: AIGenerationError = {
				message: data.message || data.error || 'AI generation failed',
				rateLimit: data.rateLimit
			};
			throw error;
		}

		return data.username || generateUsername({ themes: selectedThemes });
	} catch (error) {
		// If it's our custom AIGenerationError, rethrow it so the UI can display it
		if (isAIGenerationError(error)) {
			throw error;
		}

		// Network, parsing, or other errors (like JSON parse errors) - fallback to regular generation
		console.error('AI generation error:', error);
		return generateUsername({ themes: selectedThemes });
	}
}

/**
 * Builds a prompt for the AI model based on selected themes
 * @param themes Selected themes
 * @param themeCharacters Characters from selected themes
 * @returns Formatted prompt string
 */
export function buildAIPrompt(selectedThemes: Theme[], themeCharacters: string[]): string {
	const themeNames = selectedThemes
		.filter((t) => t !== 'random')
		.map((t) => {
			const themeData = themes[t];
			return themeData?.name || t;
		})
		.join(', ');

	const examples = themeCharacters.slice(0, 5).join(', ');

	return `Generate a unique username inspired by the following themes: ${themeNames}.

Examples of characters from these themes: ${examples}

Requirements:
- The username should sound familiar and reference the lore/theme
- It should be a variation or derivative of existing names, not a direct copy
- Make it creative and unique (like "Voljiner", "Aragornus", "Geralten")
- Single word, no spaces
- Maximum 20 characters
- Should feel authentic to the theme

Generate only the username, nothing else.`;
}
