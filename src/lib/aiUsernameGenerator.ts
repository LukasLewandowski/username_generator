import { getCharactersFromThemes, themes, type Theme } from './themes';
import { generateUsername } from './usernameGenerator';

export interface AIGenerationError {
	message: string;
	rateLimit?: {
		remaining: number;
		resetAt: number;
	};
}

export interface AIGenerationResult {
	username: string;
	prompt?: string;
	content?: string;
}

/**
 * Generates a username using AI (LLM) based on selected themes
 * @param themes Selected themes to base the username on (empty array for no theme)
 * @param previousUsernames List of previously generated usernames to avoid duplicates
 * @returns Promise resolving to a generated username with prompt and raw response
 * @throws {AIGenerationError} If AI generation fails or rate limit is exceeded
 */
export async function generateAIGeneratedUsername(
	selectedThemes: Theme[],
	previousUsernames: string[] = []
): Promise<AIGenerationResult> {
	try {
		const response = await fetch('/api/generate-ai', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ 
				themes: selectedThemes,
				previousUsernames: previousUsernames
			})
		});

		const data = await response.json();

		if (!response.ok) {
			const error: AIGenerationError = {
				message: data.message || data.error || 'AI generation failed',
				rateLimit: data.rateLimit
			};
			throw error;
		}

		return {
			username: data.username || generateUsername({ themes: selectedThemes }),
			prompt: data.prompt,
			content: data.content
		};
	} catch (error) {
		// If it's our custom error, rethrow it
		if (error && typeof error === 'object' && 'message' in error) {
			throw error;
		}

		// Network or other errors - fallback to regular generation
		console.error('AI generation error:', error);
		return {
			username: generateUsername({ themes: selectedThemes })
		};
	}
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * Builds a prompt for the AI model based on selected themes
 * @param themes Selected themes (empty array for no theme)
 * @param themeCharacters Characters from selected themes
 * @param previousUsernames List of previously generated usernames to avoid duplicates
 * @returns Formatted prompt string
 */
export function buildAIPrompt(
	selectedThemes: Theme[],
	themeCharacters: string[],
	previousUsernames: string[] = []
): string {
	// Build the previous usernames section if any exist
	let previousUsernamesSection = '';
	if (previousUsernames.length > 0) {
		const usernamesList = previousUsernames.join(', ');
		previousUsernamesSection = `\n\nIMPORTANT: Do NOT generate any of these usernames that were already created: ${usernamesList}\nGenerate a completely different username.`;
	}

	// If no themes provided, generate a general username
	if (selectedThemes.length === 0 || (selectedThemes.length === 1 && selectedThemes[0] === 'random')) {
		return `Generate a unique and creative username.${previousUsernamesSection}

Requirements:
- Make it creative and unique
- Generate a DIFFERENT variation than previous requests - be creative and vary the approach
- Single word, no spaces
- Maximum 20 characters
- Should be memorable and interesting

Generate only the username, nothing else.`;
	}

	const themeNames = selectedThemes
		.filter((t) => t !== 'random')
		.map((t) => {
			const themeData = themes[t];
			return themeData?.name || t;
		})
		.join(', ');

	// Randomize examples to ensure variation in each request
	const shuffledCharacters = shuffleArray(themeCharacters);
	const examples = shuffledCharacters.slice(0, Math.min(5, shuffledCharacters.length)).join(', ');

	return `Generate a unique and different username inspired by the following themes: ${themeNames}.${previousUsernamesSection}

Examples of characters from these themes: ${examples}

Requirements:
- The username should sound familiar and reference the lore/theme
- It should be a variation or derivative of existing names, not a direct copy
- Make it creative and unique (like "Voljiner", "Aragornus", "Geralten")
- Generate a DIFFERENT variation than previous requests - be creative and vary the approach
- Single word, no spaces
- Maximum 20 characters
- Should feel authentic to the theme

Generate only the username, nothing else.`;
}
