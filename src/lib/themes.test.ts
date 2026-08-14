import { describe, expect, it } from 'vitest';
import { getCharactersFromThemes, themes } from './themes';

describe('getCharactersFromThemes', () => {
	it('returns no characters when no theme or only random is selected', () => {
		expect(getCharactersFromThemes([])).toEqual([]);
		expect(getCharactersFromThemes(['random'])).toEqual([]);
	});

	it('ignores random when it is combined with a specific theme', () => {
		expect(getCharactersFromThemes(['random', 'starwars'])).toEqual(themes.starwars.characters);
	});

	it('combines characters from all selected themes', () => {
		const characters = getCharactersFromThemes(['marvel', 'witcher']);

		expect(characters).toEqual([...themes.marvel.characters, ...themes.witcher.characters]);
	});
});
