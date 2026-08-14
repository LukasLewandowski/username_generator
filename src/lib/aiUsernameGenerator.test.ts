import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildAIPrompt, generateAIGeneratedUsername } from './aiUsernameGenerator';

describe('buildAIPrompt', () => {
	it('builds a random-generation prompt with usernames to exclude', () => {
		expect(buildAIPrompt(['random'], [], ['Alpha', 'Beta'])).toBe(
			'Generate a creative username.\n\nDo NOT use these usernames: Alpha, Beta\n\nSingle word, max 20 characters. Output only the username.'
		);
	});

	it('builds a themed prompt with at most five examples', () => {
		const prompt = buildAIPrompt(
			['starwars', 'marvel'],
			['Luke', 'Leia', 'Han', 'Chewbacca', 'Yoda', 'Vader'],
			['SkyHero']
		);
		const examples = prompt.match(/^Examples: (.+)$/m)?.[1].split(', ') ?? [];

		expect(prompt).toContain('Generate a username inspired by Star Wars, Marvel.');
		expect(prompt).toContain('Do NOT use these usernames: SkyHero');
		expect(examples).toHaveLength(5);
	});
});

describe('generateAIGeneratedUsername', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('sends selected themes to the API and returns an AI response', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				username: 'LunaQuasar',
				prompt: 'prompt',
				content: 'LunaQuasar'
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		await expect(generateAIGeneratedUsername(['marvel'], ['IronHero'])).resolves.toEqual({
			username: 'LunaQuasar',
			prompt: 'prompt',
			content: 'LunaQuasar'
		});
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/generate-ai',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ themes: ['marvel'], previousUsernames: ['IronHero'] })
			})
		);
	});

	it('rethrows an API error message', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: false, json: vi.fn().mockResolvedValue({ error: 'Rate limited' }) })
		);

		await expect(generateAIGeneratedUsername(['random'])).rejects.toMatchObject({
			message: 'Rate limited'
		});
	});

	it('falls back when the API omits a username or the request fails', async () => {
		vi.spyOn(Math, 'random').mockReturnValue(0);
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ username: '' }) })
		);

		await expect(generateAIGeneratedUsername(['random'])).resolves.toEqual({ username: 'Swifter' });

		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
		await expect(generateAIGeneratedUsername(['random'])).resolves.toEqual({ username: 'Swifter' });
		expect(consoleError).toHaveBeenCalled();
	});
});
