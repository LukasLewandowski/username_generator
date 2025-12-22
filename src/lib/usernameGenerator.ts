import { getCharactersFromThemes, type Theme } from './themes';
import { generateThemeVariation, generateVariation } from './usernameVariations';

// Word lists for username generation (used in random mode)
const adjectives = [
	'swift', 'clever', 'brave', 'bright', 'calm', 'cool', 'daring', 'eager', 'fierce', 'gentle',
	'jolly', 'keen', 'lively', 'mighty', 'noble', 'proud', 'quick', 'radiant', 'sharp', 'tough',
	'witty', 'zealous', 'bold', 'calm', 'dazzling', 'epic', 'fancy', 'gigantic', 'heroic', 'infinite',
	'jovial', 'kind', 'legendary', 'magical', 'neon', 'oceanic', 'powerful', 'quantum', 'rapid', 'stellar',
	'titanic', 'ultimate', 'vibrant', 'wild', 'xenial', 'youthful', 'zenith', 'atomic', 'cosmic', 'dynamic'
];

const nouns = [
	'tiger', 'fox', 'eagle', 'wolf', 'lion', 'bear', 'hawk', 'falcon', 'panther', 'jaguar',
	'phoenix', 'dragon', 'unicorn', 'griffin', 'raven', 'cobra', 'shark', 'whale', 'dolphin', 'orca',
	'storm', 'thunder', 'lightning', 'blaze', 'frost', 'shadow', 'nova', 'comet', 'asteroid', 'nebula',
	'warrior', 'knight', 'ranger', 'mage', 'rogue', 'paladin', 'ninja', 'samurai', 'viking', 'spartan',
	'phoenix', 'titan', 'giant', 'titan', 'legend', 'myth', 'epic', 'saga', 'quest', 'journey'
];

const verbs = [
	'leaping', 'soaring', 'striking', 'charging', 'blazing', 'shining', 'roaring', 'howling', 'diving', 'racing',
	'flying', 'running', 'jumping', 'climbing', 'swimming', 'dancing', 'singing', 'fighting', 'winning', 'conquering',
	'exploring', 'discovering', 'creating', 'building', 'designing', 'coding', 'hacking', 'gaming', 'streaming', 'competing'
];

/**
 * Generates a random username by creating variations of theme characters or random words
 * @param options Configuration options for username generation
 * @returns A randomly generated username
 */
export function generateUsername(options: {
	themes?: Theme[];
} = {}): string {
	const { themes } = options;

	// Get theme characters if themes are specified
	const themeCharacters = themes && themes.length > 0 ? getCharactersFromThemes(themes) : [];
	const hasLotrTheme = !!themes?.includes('lotr');

	if (themeCharacters.length > 0) {
		// Theme mode: pick a random character and generate a variation
		const randomIndex = Math.floor(Math.random() * themeCharacters.length);
		const baseName = themeCharacters[randomIndex];

		// For Lord of the Rings theme, sometimes use the exact character name (normalized)
		// instead of always generating a variation, so we don't exclude real LOTR names.
		if (hasLotrTheme && Math.random() < 0.3) {
			// Normalize similar to generateVariation: take first word, lowercase, then capitalize
			const normalized = baseName.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
			const processed = normalized.split(' ')[0];
			const exactName = processed.charAt(0).toUpperCase() + processed.slice(1);

			return exactName;
		}
		
		// Get other characters for potential combination (30% chance)
		const otherNames = themeCharacters.filter((name, idx) => idx !== randomIndex);
		const useCombination = otherNames.length > 0;
		
		return generateThemeVariation(baseName, otherNames, useCombination);
	} else {
		// Random mode: pick a random word and generate a variation
		const allWords = [...adjectives, ...nouns, ...verbs];
		const randomIndex = Math.floor(Math.random() * allWords.length);
		const baseWord = allWords[randomIndex];
		
		return generateVariation(baseWord);
	}
}

/**
 * Generates a random number to append to username (optional)
 * @param min Minimum number
 * @param max Maximum number
 * @returns Random number as string
 */
export function generateRandomNumber(min: number = 100, max: number = 9999): string {
	return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

