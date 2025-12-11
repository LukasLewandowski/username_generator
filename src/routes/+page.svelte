<script lang="ts">
	import { onMount } from 'svelte';
	import { generateUsername } from '$lib/usernameGenerator';

	let username = '';
	let copied = false;
	let copyButtonText = 'Copy';

	onMount(() => {
		username = generateUsername();
	});

	function generateNew() {
		username = generateUsername();
		copied = false;
		copyButtonText = 'Copy';
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

<div class="container">
	<div class="card">
		<h1>Username Generator</h1>
		<p class="subtitle">Generate random usernames for your accounts</p>

		<div class="username-display">
			<div class="username-text" class:copied={copied}>
				{username}
			</div>
		</div>

		<div class="buttons">
			<button class="btn btn-primary" on:click={copyToClipboard} class:copied={copied}>
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
	}

	.card {
		background: white;
		border-radius: 20px;
		padding: 3rem 2.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		max-width: 500px;
		width: 100%;
		text-align: center;
		animation: fadeIn 0.5s ease-in;
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
		margin: 0 0 2.5rem 0;
		font-size: 1rem;
	}

	.username-display {
		margin: 2rem 0;
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 12px;
		border: 2px solid #e5e7eb;
		transition: all 0.3s ease;
	}

	.username-display:hover {
		border-color: #667eea;
		background: #f3f4f6;
	}

	.username-text {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1f2937;
		letter-spacing: 0.5px;
		transition: all 0.3s ease;
		word-break: break-word;
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
	}

	.btn-secondary:hover {
		background: #667eea;
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
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
