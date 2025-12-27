<script lang="ts">
	import { onMount } from 'svelte';
	import { generateUsername } from '$lib/usernameGenerator';
	import { themes, type Theme } from '$lib/themes';
	import { generateAIGeneratedUsername, type AIGenerationError } from '$lib/aiUsernameGenerator';

	let username = '';
	let copied = false;
	let copyButtonText = 'Copy';
	let selectedThemes: Theme[] = ['random'];
	let darkMode = false;
	let useAI = false;
	let isGenerating = false;
	let rateLimitError: string | null = null;
	// Store last 10 AI-generated usernames to prevent duplicates
	let previousAIUsernames: string[] = [];
	const MAX_PREVIOUS_USERNAMES = 10;

	onMount(() => {
		// Load dark mode preference from localStorage
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('darkMode');
			darkMode = saved === 'true';
			updateDarkMode();
		}
		username = generateUsername({ themes: selectedThemes });
	});

	function toggleDarkMode() {
		darkMode = !darkMode;
		updateDarkMode();
		if (typeof window !== 'undefined') {
			localStorage.setItem('darkMode', darkMode.toString());
		}
	}

	function updateDarkMode() {
		if (typeof document !== 'undefined') {
			if (darkMode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	}

	function toggleTheme(theme: Theme) {
		// When AI is enabled, keep Random checked and prevent other theme changes
		if (useAI) {
			if (theme !== 'random') {
				// Prevent checking other themes when AI is enabled
				return;
			}
			// Keep Random checked when AI is enabled
			if (!selectedThemes.includes('random')) {
				selectedThemes = ['random'];
			}
			return;
		}

		if (theme === 'random') {
			// If clicking random, toggle it
			if (selectedThemes.includes('random')) {
				selectedThemes = selectedThemes.filter((t) => t !== 'random');
			} else {
				selectedThemes = ['random'];
			}
		} else {
			// For other themes, toggle them
			if (selectedThemes.includes(theme)) {
				selectedThemes = selectedThemes.filter((t) => t !== theme);
				// If no themes selected, default to random
				if (selectedThemes.length === 0) {
					selectedThemes = ['random'];
				}
			} else {
				// Remove random if selecting a specific theme
				selectedThemes = selectedThemes.filter((t) => t !== 'random');
				selectedThemes.push(theme);
			}
		}
		// Regenerate username with new theme selection
		generateNew();
	}

	async function generateNew() {
		copied = false;
		copyButtonText = 'Copy';
		rateLimitError = null;

		if (useAI) {
			isGenerating = true;
			try {
				// When AI is enabled, don't send themes (send empty array)
				// Pass previous usernames to avoid duplicates
				const result = await generateAIGeneratedUsername([], previousAIUsernames);
				username = result.username;
				
				// Add the new username to the list of previous usernames
				// Keep only the last MAX_PREVIOUS_USERNAMES
				previousAIUsernames = [username, ...previousAIUsernames].slice(0, MAX_PREVIOUS_USERNAMES);
				
				// Log prompt and raw response to browser console
				if (result.prompt) {
					console.log('AI Prompt:', result.prompt);
				}
				if (result.content) {
					console.log('AI Raw Response:', result.content);
				}
			} catch (error) {
				console.error('AI generation failed:', error);
				const aiError = error as AIGenerationError;

				if (aiError.rateLimit) {
					const resetIn = Math.ceil((aiError.rateLimit.resetAt - Date.now()) / 1000);
					rateLimitError = `Rate limit exceeded. Try again in ${resetIn} seconds.`;
				} else {
					rateLimitError = aiError.message || 'AI generation failed';
				}

				// Fallback to regular generation if AI fails
				username = generateUsername({ themes: selectedThemes });
			} finally {
				isGenerating = false;
			}
		} else {
			username = generateUsername({ themes: selectedThemes });
		}
	}

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(username);
			copied = true;
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copied = false;
				copyButtonText = 'Copy';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
			copyButtonText = 'Failed';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		}
	}
</script>

<div class="container" class:dark={darkMode}>
	<div class="card">
		<div class="header-row">
			<div>
				<h1>Username Generator</h1>
				<p class="subtitle">Generate random usernames for your accounts</p>
			</div>
			<button class="dark-mode-toggle" on:click={toggleDarkMode} aria-label="Toggle dark mode">
				{#if darkMode}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="5" />
						<line x1="12" y1="1" x2="12" y2="3" />
						<line x1="12" y1="21" x2="12" y2="23" />
						<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
						<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
						<line x1="1" y1="12" x2="3" y2="12" />
						<line x1="21" y1="12" x2="23" y2="12" />
						<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
						<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
					</svg>
				{/if}
			</button>
		</div>

		<div class="theme-selection">
			<h2 class="theme-title">Choose Themes</h2>
			<div class="checkboxes">
				{#each Object.entries(themes) as [key, theme]}
					{@const themeKey = key as Theme}
					{@const isDisabled = useAI && themeKey !== 'random'}
					<label class="checkbox-label" class:disabled={isDisabled}>
						<input
							type="checkbox"
							checked={selectedThemes.includes(themeKey)}
							on:change={() => toggleTheme(themeKey)}
							disabled={isDisabled}
							class="checkbox-input"
						/>
						<span class="checkbox-text">{theme.name}</span>
					</label>
				{/each}
			</div>

			<div class="ai-generation-section">
				<label class="checkbox-label ai-checkbox">
					<input
						type="checkbox"
						checked={useAI}
						on:change={() => {
							useAI = !useAI;
							if (useAI) {
								// When AI is enabled, check Random and uncheck others
								selectedThemes = ['random'];
								// Clear previous usernames when AI is first enabled
								previousAIUsernames = [];
							} else {
								// Clear previous usernames when AI is disabled
								previousAIUsernames = [];
							}
							generateNew();
						}}
						class="checkbox-input"
					/>
					<span class="checkbox-text">
						<svg
							class="ai-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M12 2L2 7l10 5 10-5-10-5z" />
							<path d="M2 17l10 5 10-5" />
							<path d="M2 12l10 5 10-5" />
						</svg>
						AI Generation
					</span>
				</label>
			</div>
		</div>

		<div class="username-display">
			<div class="username-text" class:copied>
				{#if isGenerating}
					<span class="generating">Generating...</span>
				{:else}
					{username}
				{/if}
			</div>
			{#if rateLimitError}
				<div class="rate-limit-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					{rateLimitError}
				</div>
			{/if}
		</div>

		<div class="buttons">
			<button class="btn btn-primary" on:click={copyToClipboard} class:copied>
				<svg
					class="icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					{#if copied}
						<path d="M20 6L9 17l-5-5" />
					{:else}
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
					{/if}
				</svg>
				{copyButtonText}
			</button>

			<button class="btn btn-secondary" on:click={generateNew}>
				<svg
					class="icon"
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
				</svg>
				Generate Next
			</button>
		</div>
	</div>
</div>

<style>
	.container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transition: background 0.3s ease;
	}

	.container.dark {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	}

	.card {
		background: white;
		border-radius: 20px;
		padding: 3rem 2.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 600px;
		width: 100%;
		text-align: center;
		animation: fadeIn 0.5s ease-in;
		transition:
			background-color 0.3s ease,
			box-shadow 0.3s ease;
		position: relative;
	}

	.container.dark .card {
		background: #1f2937;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.header-row > div {
		flex: 1;
	}

	.dark-mode-toggle {
		background: transparent;
		border: 2px solid #e5e7eb;
		border-radius: 10px;
		padding: 0.5rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.dark-mode-toggle:hover {
		background: #f9fafb;
		border-color: #667eea;
		color: #667eea;
		transform: scale(1.05);
	}

	.container.dark .dark-mode-toggle {
		border-color: #4b5563;
		color: #9ca3af;
	}

	.container.dark .dark-mode-toggle:hover {
		background: #374151;
		border-color: #667eea;
		color: #667eea;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 2.5rem;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #6b7280;
		margin: 0 0 2rem 0;
		font-size: 1rem;
		transition: color 0.3s ease;
	}

	.container.dark .subtitle {
		color: #9ca3af;
	}

	.theme-selection {
		margin: 0 0 2rem 0;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease;
	}

	.container.dark .theme-selection {
		background: #374151;
		border-color: #4b5563;
	}

	.theme-title {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		font-weight: 600;
		color: #1f2937;
		transition: color 0.3s ease;
	}

	.container.dark .theme-title {
		color: #f9fafb;
	}

	.checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}

	.ai-generation-section {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 2px solid #e5e7eb;
		display: flex;
		justify-content: center;
	}

	.container.dark .ai-generation-section {
		border-top-color: #4b5563;
	}

	.ai-checkbox {
		font-weight: 600;
		padding: 0.75rem 1.25rem;
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
		border-radius: 10px;
		border: 2px solid rgba(102, 126, 234, 0.3);
	}

	.container.dark .ai-checkbox {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
		border-color: rgba(102, 126, 234, 0.4);
	}

	.ai-checkbox:hover {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
		border-color: #667eea;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
	}

	.container.dark .ai-checkbox:hover {
		background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
	}

	.ai-icon {
		width: 18px;
		height: 18px;
		margin-right: 0.5rem;
		vertical-align: middle;
	}

	.generating {
		opacity: 0.7;
		font-style: italic;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 1;
		}
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		user-select: none;
	}

	.checkbox-label:hover {
		background: #f3f4f6;
	}

	.container.dark .checkbox-label:hover {
		background: #4b5563;
	}

	.checkbox-label.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox-label.disabled:hover {
		background: transparent;
	}

	.checkbox-input {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: #667eea;
	}

	.checkbox-input:disabled {
		cursor: not-allowed;
	}

	.checkbox-text {
		font-size: 0.95rem;
		color: #374151;
		font-weight: 500;
		transition: color 0.3s ease;
	}

	.container.dark .checkbox-text {
		color: #e5e7eb;
	}

	.username-display {
		margin: 2rem 0;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
		transition: all 0.3s ease;
	}

	.container.dark .username-display {
		background: #374151;
		border-color: #4b5563;
	}

	.username-display:hover {
		border-color: #667eea;
		background: #f3f4f6;
	}

	.container.dark .username-display:hover {
		background: #4b5563;
		border-color: #667eea;
	}

	.rate-limit-error {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		color: #dc2626;
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
	}

	.container.dark .rate-limit-error {
		background: #7f1d1d;
		border-color: #991b1b;
		color: #fca5a5;
	}

	.username-text {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1f2937;
		letter-spacing: 0.5px;
		transition: all 0.3s ease;
		word-break: break-word;
	}

	.container.dark .username-text {
		color: #f9fafb;
	}

	.username-text.copied {
		color: #10b981;
		transform: scale(1.05);
	}

	.buttons {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.875rem 1.75rem;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
		position: relative;
		overflow: hidden;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:hover {
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
		transform: translateY(-2px);
	}

	.btn-primary.copied {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
		box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
	}

	.btn-secondary {
		background: white;
		color: #667eea;
		border: 2px solid #667eea;
		transition: all 0.2s ease;
	}

	.container.dark .btn-secondary {
		background: #374151;
		color: #667eea;
		border-color: #667eea;
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}

	.container.dark .btn-secondary:hover {
		background: #667eea;
		color: white;
	}

	.icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.card {
			padding: 2rem 1.5rem;
		}

		.header-row {
			flex-direction: column;
			align-items: stretch;
		}

		.dark-mode-toggle {
			align-self: flex-end;
		}

		h1 {
			font-size: 2rem;
		}

		.username-text {
			font-size: 1.5rem;
		}

		.buttons {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>
