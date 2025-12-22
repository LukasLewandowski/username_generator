/* Auto-generated: exports an array of character names from the-one-api-characters.json */
import data from './the-one-api-characters.json';

export const ONE_API_CHARACTER_NAMES: string[] = (data as any).docs.map((d: any) => d.name);

export default ONE_API_CHARACTER_NAMES;
