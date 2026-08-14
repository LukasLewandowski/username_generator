import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateRandomNumber, generateUsername } from './usernameGenerator';

describe('username generator', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('generates a deterministic random username when no theme is selected', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);

		expect(generateUsername()).toBe('Swifter');
	});

	it('can return a normalized Lord of the Rings character name', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);

		expect(generateUsername({ themes: ['lotr'] })).toBe('Adanel');
	});

	it('respects inclusive random-number bounds', () => {
		const random = vi.spyOn(Math, 'random');
		random.mockReturnValueOnce(0).mockReturnValueOnce(0.999999);

		expect(generateRandomNumber(100, 9999)).toBe('100');
		expect(generateRandomNumber(100, 9999)).toBe('9999');
	});
});
