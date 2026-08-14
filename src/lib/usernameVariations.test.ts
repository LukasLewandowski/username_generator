import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	combineNameParts,
	generateMultipleVariations,
	generateThemeVariation,
	generateVariation
} from './usernameVariations';

describe('username variations', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('combines the start of one name with the end of another', () => {
		expect(combineNameParts('Aragorn', 'Legolas')).toBe('Aras');
	});

	it('keeps short names intact when combining them', () => {
		expect(combineNameParts('A', 'Bo')).toBe('ABo');
	});

	it('normalizes and capitalizes a deterministic variation', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);

		expect(generateVariation('DarthVader')).toBe('Darther');
	});

	it('returns no variations for an empty name or a non-positive count', () => {
		expect(generateMultipleVariations('', 3)).toEqual([]);
		expect(generateMultipleVariations('Aragorn', 0)).toEqual([]);
	});

	it('combines theme names when combination is selected', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);

		expect(generateThemeVariation('Aragorn', ['Legolas'], true)).toBe('Aras');
	});
});
