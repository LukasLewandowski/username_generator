<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Username Generator</title>
</svelte:head>

{@render children()}

<div class="bmc-container">
	<script
		type="text/javascript"
		src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
		data-name="bmc-button"
		data-slug="lukaszl"
		data-color="#061020"
		data-emoji="☕"
		data-font="Cookie"
		data-text="Buy me a coffee"
		data-outline-color="#ffffff"
		data-font-color="#ffffff"
		data-coffee-color="#FFDD00"
	></script>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.bmc-container {
		position: fixed;
		bottom: 24px;
		left: 24px;
		z-index: 1000;
		transition: transform 0.2s ease;
	}

	.bmc-container:hover {
		transform: scale(1.05);
	}

	@media (max-width: 640px) {
		.bmc-container {
			bottom: 16px;
			left: 16px;
			transform: scale(0.9);
		}

		.bmc-container:hover {
			transform: scale(0.95);
		}
	}
</style>
