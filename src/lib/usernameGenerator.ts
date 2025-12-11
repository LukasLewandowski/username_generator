// Word lists for username generation
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
 * Generates a random username by combining random words
 * @param options Configuration options for username generation
 * @returns A randomly generated username
 */
export function generateUsername(options: {
	wordCount?: number;
	separator?: string;
	capitalize?: boolean;
} = {}): string {
	const { wordCount = 2, separator = '', capitalize = true } = options;

	const allWords = [...adjectives, ...nouns, ...verbs];
	const selectedWords: string[] = [];

	// Select random words
	for (let i = 0; i < wordCount; i++) {
		const randomIndex = Math.floor(Math.random() * allWords.length);
		selectedWords.push(allWords[randomIndex]);
	}

	// Combine words
	let username = selectedWords.join(separator);

	// Capitalize if requested
	if (capitalize) {
		username = username
			.split(separator || ' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(separator);
	}

	return username;
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

