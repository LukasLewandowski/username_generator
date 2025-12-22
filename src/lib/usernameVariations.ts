// Suffixes for generating username variations
const suffixes = [
	'er', 'us', 'sen', 'ther', 'or', 'in', 'en', 'ar', 'on', 'is', 'as',
	'ion', 'an', 'el', 'il', 'al', 'ol', 'ul', 'yn', 'yn', 'eth', 'ath',
	'ith', 'oth', 'uth', 'ash', 'esh', 'ish', 'osh', 'ush', 'orn', 'arn',
	'ern', 'urn', 'irn', 'orn', 'ian', 'ean', 'oan', 'uan', 'ian'
];

// Common ending modifications
const endingReplacements: Record<string, string[]> = {
	'a': ['e', 'o', 'i', 'u', 'y'],
	'e': ['a', 'o', 'i', 'u', 'y'],
	'i': ['a', 'e', 'o', 'u', 'y'],
	'o': ['a', 'e', 'i', 'u', 'y'],
	'u': ['a', 'e', 'i', 'o', 'y'],
	'y': ['a', 'e', 'i', 'o', 'u'],
	'n': ['m', 'r', 'l', 's'],
	'r': ['n', 'l', 's', 'm'],
	'l': ['n', 'r', 's', 'm'],
	's': ['n', 'r', 'l', 'm']
};

/**
 * Generates a variation of a base name by adding a suffix
 */
function addSuffix(baseName: string): string {
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
	return baseName + suffix;
}

/**
 * Generates a variation by modifying the ending of the name
 */
function modifyEnding(baseName: string): string {
	if (baseName.length < 2) return baseName;
	
	const lastChar = baseName[baseName.length - 1].toLowerCase();
	const replacements = endingReplacements[lastChar];
	
	if (replacements && replacements.length > 0) {
		const replacement = replacements[Math.floor(Math.random() * replacements.length)];
		return baseName.slice(0, -1) + replacement;
	}
	
	// If no replacement found, try removing last character or adding a common ending
	const actions = [
		() => baseName.slice(0, -1), // Remove last char
		() => baseName + 'e',
		() => baseName + 'a',
		() => baseName + 'i'
	];
	
	const action = actions[Math.floor(Math.random() * actions.length)];
	return action();
}

/**
 * Generates a variation by removing the last character and adding a suffix
 */
function removeAndSuffix(baseName: string): string {
	if (baseName.length < 3) return addSuffix(baseName);
	const shortened = baseName.slice(0, -1);
	return addSuffix(shortened);
}

/**
 * Combines parts of two names
 * Takes beginning of first name and end of second name
 */
export function combineNameParts(name1: string, name2: string): string {
	if (name1.length < 2 || name2.length < 2) {
		return name1 + name2;
	}
	
	// Get first 2-4 characters from name1
	const takeFrom1 = Math.max(2, Math.min(4, Math.floor(name1.length * 0.4)));
	const part1 = name1.slice(0, takeFrom1);
	
	// Get last 2-4 characters from name2
	const takeFrom2 = Math.max(2, Math.min(4, Math.floor(name2.length * 0.4)));
	const part2 = name2.slice(-takeFrom2);
	
	return part1 + part2;
}

/**
 * Generates a single variation of a base name
 * Uses various transformation techniques
 */
export function generateVariation(baseName: string): string {
	if (!baseName || baseName.length === 0) return baseName;
	
	// Normalize the base name (remove camelCase, make it lowercase for processing)
	const normalized = baseName.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
	const processed = normalized.split(' ')[0]; // Take first part if camelCase
	
	// Choose a transformation method
	const methods = [
		() => addSuffix(processed),
		() => modifyEnding(processed),
		() => removeAndSuffix(processed),
		() => processed.slice(0, -1) + 'er',
		() => processed.slice(0, -1) + 'us',
		() => processed + 'er',
		() => processed + 'us',
		() => processed + 'en',
		() => processed + 'or'
	];
	
	const method = methods[Math.floor(Math.random() * methods.length)];
	let variation = method();
	
	// Capitalize first letter
	return variation.charAt(0).toUpperCase() + variation.slice(1);
}

/**
 * Generates multiple variations of a base name
 */
export function generateMultipleVariations(baseName: string, count: number = 5): string[] {
	const variations = new Set<string>();
	
	while (variations.size < count) {
		const variation = generateVariation(baseName);
		if (variation && variation !== baseName) {
			variations.add(variation);
		}
		// Safety check to avoid infinite loop
		if (variations.size >= count * 2) break;
	}
	
	return Array.from(variations).slice(0, count);
}

/**
 * Generates a variation from a theme character, optionally combining with another
 */
export function generateThemeVariation(
	baseName: string,
	otherNames: string[] = [],
	useCombination: boolean = false
): string {
	// 30% chance to combine with another name if available
	if (useCombination && otherNames.length > 0 && Math.random() < 0.3) {
		const otherName = otherNames[Math.floor(Math.random() * otherNames.length)];
		const combined = combineNameParts(baseName, otherName);
		return combined.charAt(0).toUpperCase() + combined.slice(1);
	}
	
	return generateVariation(baseName);
}
