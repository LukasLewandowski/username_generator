// Theme data for username generation
export type Theme =
	| 'random'
	| 'lotr'
	| 'starwars'
	| 'marvel'
	| 'wow'
	| 'slavic'
	| 'witcher';

export interface ThemeData {
	name: string;
	characters: string[];
}

import { ONE_API_CHARACTER_NAMES } from './assets/oneApiCharacterNames';

export const themes: Record<Theme, ThemeData> = {
	random: {
		name: 'Random',
		characters: []
	},
	lotr: {
		name: 'Lord of the Rings',
		characters: ONE_API_CHARACTER_NAMES
	},
	starwars: {
		name: 'Star Wars',
		characters: [
			'Luke',
			'Leia',
			'Han',
			'Chewbacca',
			'R2D2',
			'C3PO',
			'ObiWan',
			'Anakin',
			'Yoda',
			'DarthVader',
			'Palpatine',
			'DarthMaul',
			'Ahsoka',
			'Rex',
			'Cody',
			'MaceWindu',
			'QuiGon',
			'Padme',
			'Jango',
			'Boba',
			'Kylo',
			'Rey',
			'Finn',
			'Poe',
			'BB8',
			'Lando',
			'Mando',
			'Grogu',
			'Ezra',
			'Kanan',
			'Hera',
			'Sabine',
			'Zeb',
			'Thrawn',
			'Tarkin',
			'Krennic',
			'Grievous',
			'Dooku',
			'Ventress',
			'CadBane',
			'Fennec',
			'Cara',
			'BoKatan',
			'DinDjarin'
		]
	},
	marvel: {
		name: 'Marvel',
		characters: [
			'IronMan',
			'CaptainAmerica',
			'Thor',
			'Hulk',
			'BlackWidow',
			'Hawkeye',
			'SpiderMan',
			'BlackPanther',
			'DoctorStrange',
			'ScarletWitch',
			'Vision',
			'Falcon',
			'WinterSoldier',
			'AntMan',
			'Wasp',
			'CaptainMarvel',
			'StarLord',
			'Gamora',
			'Drax',
			'Rocket',
			'Groot',
			'Mantis',
			'Nebula',
			'Loki',
			'Thanos',
			'Ultron',
			'RedSkull',
			'Magneto',
			'Wolverine',
			'Storm',
			'Cyclops',
			'JeanGrey',
			'Nightcrawler',
			'Colossus',
			'Deadpool',
			'Cable',
			'Domino',
			'Daredevil',
			'Punisher',
			'JessicaJones',
			'LukeCage',
			'IronFist'
		]
	},
	wow: {
		name: 'World of Warcraft',
		characters: [
			'Arthas',
			'Jaina',
			'Uther',
			'Sylvanas',
			'Thrall',
			'Garrosh',
			'Varian',
			'Anduin',
			'Genn',
			'Tyrande',
			'Malfurion',
			'Illidan',
			'Maiev',
			'Kaelthas',
			'Khadgar',
			'Medivh',
			'Guldan',
			'Grommash',
			'Cairne',
			'Voljin',
			'Baine',
			'LorThemar',
			'Liadrin',
			'Turalyon',
			'Alleria',
			'Vereesa',
			'Rhonin',
			'Magni',
			'Muradin',
			'Falstad',
			'Alexstrasza',
			'Ysera',
			'Nozdormu',
			'Malygos',
			'Neltharion',
			'Deathwing',
			'Onyxia',
			'Nefarian',
			'Ragnaros',
			'KelThuzad',
			'LichKing',
			'Bolvar',
			'Tirion',
			'Darion',
			'Mograine'
		]
	},
	slavic: {
		name: 'Slavic names',
		characters: [
			'Bogdan',
			'Bohdan',
			'Bogdanus',
			'Bohdanus',
			'Stanislav',
			'Stanislaw',
			'Stanislavus',
			'Vladimir',
			'Wladimir',
			'Vladislav',
			'Boris',
			'Borislav',
			'Miroslav',
			'Bronislav',
			'Jaromir',
			'Radoslav',
			'Radomir',
			'Dragomir',
			'Dobromir',
			'Kazimir',
			'Kazimierz',
			'Lech',
			'Mieczyslaw',
			'Przemyslaw',
			'Zbigniew',
			'Wojciech',
			'Leszek'
		]
	},
	witcher: {
		name: 'Witcher',
		characters: [
			'Geralt',
			'GeraltOfRivia',
			'Yennefer',
			'Triss',
			'Ciri',
			'Dandelion',
			'Jaskier',
			'Vesemir',
			'Eskel',
			'Lambert',
			'Coen',
			'Emhyr',
			'Calanthe',
			'Pavetta',
			'Foltest',
			'Eredin',
			'Avallach',
			'Regis',
			'Milva',
			'Angouleme',
			'Bonhart',
			'Fringilla',
			'Philippa',
			'Saskia',
			'Roach',
			'GaunterODimm'
		]
	}
};

/**
 * Get all characters from selected themes
 */
export function getCharactersFromThemes(selectedThemes: Theme[]): string[] {
	if (selectedThemes.length === 0) {
		return [];
	}

	// If "all except random" is selected, get all themes except random
	if (selectedThemes.includes('random') && selectedThemes.length > 1) {
		const nonRandomThemes = selectedThemes.filter((t) => t !== 'random') as Theme[];
		return nonRandomThemes.flatMap((theme) => themes[theme].characters);
	}

	// If only random is selected, return empty (will use default random generation)
	if (selectedThemes.length === 1 && selectedThemes[0] === 'random') {
		return [];
	}

	// Get characters from all selected non-random themes
	const nonRandomThemes = selectedThemes.filter((t) => t !== 'random') as Theme[];
	if (nonRandomThemes.length === 0) {
		return [];
	}

	return nonRandomThemes.flatMap((theme) => themes[theme].characters);
}
