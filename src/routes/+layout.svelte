<script>
	let { children } = $props();
</script>

<div class="app-shell">
	<header class="app-header">
		<div class="brand">
			<a href="/" class="brand-link">
				<span class="logo-mark">S</span>
				<span class="brand-text">Order &amp; Points Portal</span>
			</a>
		</div>
		<nav class="app-nav">
			<a href="/products">Products</a>
			<a href="/customers">Customers</a>
			<a href="/orders">Orders (Bulk)</a>
		</nav>
	</header>

	<main class="app-main">
		{@render children()}
	</main>

	<footer class="app-footer">
		<span>&copy; 2026 Customer, Product &amp; Order Platform &bull; AWS Integrated Demo</span>
	</footer>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		font-family:
			Inter,
			-apple-system,
			BlinkMacSystemFont,
			"Segoe UI",
			Roboto,
			Oxygen,
			Ubuntu,
			sans-serif;
		background: #f4f7fb;
		color: #1f2937;
		line-height: 1.5;
		font-size: 14px;
	}

	.app-shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		background: #ffffff;
		border-bottom: 1px solid #e5e7eb;
		padding: 14px 28px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.brand-link {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		color: #111827;
		font-weight: 700;
		font-size: 18px;
	}

	.logo-mark {
		background: #2563eb;
		color: #ffffff;
		font-weight: 700;
		font-size: 15px;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.app-nav {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.app-nav a {
		color: #4b5563;
		text-decoration: none;
		font-size: 14px;
		font-weight: 500;
		padding: 8px 14px;
		border-radius: 8px;
		transition: all 0.15s ease;
	}

	.app-nav a:hover {
		background: #f3f4f6;
		color: #111827;
	}

	.app-nav a.nav-highlight {
		background: #2563eb;
		color: #ffffff;
	}

	.app-nav a.nav-highlight:hover {
		background: #1d4ed8;
	}

	.app-main {
		flex: 1;
		max-width: 1200px;
		width: 100%;
		margin: 28px auto;
		padding: 0 20px;
	}

	.app-footer {
		text-align: center;
		padding: 18px;
		font-size: 13px;
		color: #6b7280;
		background: #ffffff;
		border-top: 1px solid #e5e7eb;
	}

	/* Universal Clean Card System */
	:global(.card) {
		background: #ffffff;
		border-radius: 16px;
		border: 1px solid #e5e7eb;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
		padding: 28px;
		margin-bottom: 24px;
	}

	:global(h1), :global(h2), :global(h3) {
		color: #111827;
	}

	:global(label) {
		display: block;
		margin-bottom: 6px;
		font-weight: 600;
		font-size: 13px;
		color: #374151;
	}

	:global(input:not([type="checkbox"]):not([type="radio"])),
	:global(select) {
		width: 100%;
		padding: 10px 14px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 14px;
		outline: none;
		background: #ffffff;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	:global(input:focus),
	:global(select:focus) {
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
	}

	:global(button) {
		font-family: inherit;
		cursor: pointer;
		padding: 9px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		border: 1px solid #d1d5db;
		background: #ffffff;
		color: #374151;
		transition: all 0.15s ease;
	}

	:global(button:hover) {
		background: #f9fafb;
	}

	:global(button.btn-primary),
	:global(button.primary) {
		background: #2563eb;
		color: #ffffff;
		border-color: #2563eb;
	}

	:global(button.btn-primary:hover),
	:global(button.primary:hover) {
		background: #1d4ed8;
		border-color: #1d4ed8;
	}

	:global(button.btn-danger) {
		background: #fee2e2;
		color: #991b1b;
		border-color: #fca5a5;
	}

	:global(button.btn-danger:hover) {
		background: #ef4444;
		color: #ffffff;
	}

	:global(button.btn-secondary) {
		background: #f3f4f6;
		color: #4b5563;
		border-color: #e5e7eb;
	}

	:global(button:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Universal Clean Table */
	:global(table) {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
		font-size: 14px;
	}

	:global(th) {
		background: #f9fafb;
		color: #4b5563;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 12px 14px;
		border-bottom: 1px solid #e5e7eb;
		text-align: left;
	}

	:global(td) {
		padding: 14px;
		border-bottom: 1px solid #f3f4f6;
		color: #374151;
		vertical-align: middle;
	}

	:global(tr:hover td) {
		background: #fafafa;
	}

	:global(.alert) {
		padding: 12px 16px;
		border-radius: 8px;
		margin-bottom: 16px;
		font-size: 14px;
	}

	:global(.alert-success),
	:global(.success) {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	:global(.alert-error),
	:global(.error) {
		background: #fee2e2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	:global(code) {
		background: #f3f4f6;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 13px;
		font-family: monospace;
		color: #1f2937;
	}

	@media (max-width: 768px) {
		.app-header {
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
			padding: 14px;
		}
		.app-nav {
			flex-wrap: wrap;
			width: 100%;
		}
	}
</style>
