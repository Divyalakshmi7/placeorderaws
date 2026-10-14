<script>
	import { onMount } from 'svelte';

	let products = $state([]);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	// Search filter
	let searchQuery = $state('');

	// Form model
	let isEditing = $state(false);
	let form = $state({
		ProductId: '',
		name: '',
		category: '',
		points: 0,
		price: 0,
		imageURL: ''
	});

	async function fetchProducts() {
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/products');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message ?? 'Failed to fetch products');
			}

			let list = [];
			if (data && data.body) {
				const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
				list = parsed.products || (Array.isArray(parsed) ? parsed : []);
			} else if (Array.isArray(data)) {
				list = data;
			} else if (data && data.products) {
				list = data.products;
			}

			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				list = list.filter((p) =>
					[p.ProductId, p.productId, p.name, p.category]
						.some((v) => v && String(v).toLowerCase().includes(q))
				);
			}

			products = list;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		isEditing = false;
		form = {
			ProductId: '',
			name: '',
			category: '',
			points: 0,
			price: 0,
			imageURL: ''
		};
	}

	function handleEdit(prod) {
		isEditing = true;
		const id = prod.ProductId || prod.productId || '';
		form = {
			ProductId: id,
			name: prod.name || '',
			category: prod.category || '',
			points: prod.points || 0,
			price: prod.price ?? prod.amount ?? 0,
			imageURL: prod.imageURL || prod.imageUrl || ''
		};
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function handleSubmit(e, ProductId) {
		e.preventDefault();
		error = '';
		message = '';

		try {
			const targetId = ProductId || form.ProductId;
			if (isEditing && targetId) {
				const res = await fetch('/api/products/' + encodeURIComponent(targetId), {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...form,
						amount: form.price,
						imageUrl: form.imageURL
					})
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || data.error || 'Failed to update product');
				message = `Product ${targetId} updated successfully (PUT).`;
			} else {
				const res = await fetch('/api/products', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...form,
						amount: form.price,
						imageUrl: form.imageURL
					})
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || data.error || 'Failed to create product');
				message = `Product created successfully.`;
			}
			resetForm();
			await fetchProducts();
		} catch (e) {
			error = e.message;
		}
	}

	async function handleDelete(ProductId) {
		if (!confirm(`Are you sure you want to delete product "${ProductId}"?`)) return;
		error = '';
		message = '';

		try {
			const res = await fetch(`/api/products/${encodeURIComponent(ProductId)}`, {
				method: 'DELETE'
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || data.error || 'Failed to delete product');
			message = `Product ${ProductId} deleted successfully (DELETE).`;
			await fetchProducts();
		} catch (e) {
			error = e.message;
		}
	}

	onMount(() => {
		fetchProducts();
	});
</script>

<svelte:head>
	<title>Products Management &bull; Portal</title>
</svelte:head>

<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
		<div>
			<h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827;">Products Catalog</h1>
		</div>
		<div>
			<button class="btn-secondary" onclick={fetchProducts}>↻ Refresh List</button>
		</div>
	</div>

	{#if message}
		<div class="alert alert-success" style="margin-top: 16px;">{message}</div>
	{/if}
	{#if error}
		<div class="alert alert-error" style="margin-top: 16px;">{error}</div>
	{/if}
</div>

<!-- Product Form (Create / Edit) -->
<div class="card">
	<div class="form-header">
		<h2 style="margin: 0; font-size: 18px;">
			{isEditing ? 'Edit Product' : 'Add New Product'}
		</h2>
		<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Fill in the product pricing, points and media info.</p>
	</div>

	<form onsubmit={(event) => handleSubmit(event, form.ProductId)} style="margin-top: 18px;">
		<div class="form-grid">
			<div class="field">
				<label for="ProductId">Product ID</label>
				<input
					id="ProductId"
					type="text"
					bind:value={form.ProductId}
					placeholder={isEditing ? '' : 'Auto-generated if left blank'}
					disabled={isEditing}
				/>
			</div>

			<div class="field">
				<label for="name">Product Name *</label>
				<input
					id="name"
					type="text"
					bind:value={form.name}
					placeholder="Mechanical Keyboard"
					required
				/>
			</div>

			<div class="field">
				<label for="category">Category</label>
				<input
					id="category"
					type="text"
					bind:value={form.category}
					placeholder="Electronics, UPS, etc."
				/>
			</div>

			<div class="field">
				<label for="price">Price ($) *</label>
				<input
					id="price"
					type="number"
					step="0.01"
					min="0"
					bind:value={form.price}
					placeholder="89.99"
					required
				/>
			</div>

			<div class="field">
				<label for="points">Reward Points *</label>
				<input
					id="points"
					type="number"
					step="1"
					min="0"
					bind:value={form.points}
					placeholder="50"
					required
				/>
			</div>

			<div class="field full-width">
				<label for="imageURL">Image URL</label>
				<input
					id="imageURL"
					type="url"
					bind:value={form.imageURL}
					placeholder="https://images.unsplash.com/photo-..."
				/>
			</div>
		</div>

		<div style="margin-top: 18px; display: flex; gap: 10px;">
			<button type="submit" class="btn-primary">
				{isEditing ? 'Save Changes' : 'Create Product'}
			</button>
			{#if isEditing}
				<button type="button" class="btn-secondary" onclick={resetForm}>Cancel</button>
			{/if}
		</div>
	</form>
</div>

<!-- Products List Table -->
<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
		<h2 style="margin: 0; font-size: 18px;">Product Inventory</h2>
		<div style="display: flex; gap: 8px;">
			<input
				type="text"
				placeholder="Search products..."
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && fetchProducts()}
				style="max-width: 250px;"
			/>
			<button class="btn-primary" onclick={fetchProducts}>Search</button>
			{#if searchQuery}
				<button class="btn-secondary" onclick={() => { searchQuery = ''; fetchProducts(); }}>Clear</button>
			{/if}
		</div>
	</div>

	{#if loading}
		<p style="padding: 20px; color: #6b7280; text-align: center;">Loading inventory...</p>
	{:else if products.length === 0}
		<p style="padding: 20px; color: #6b7280; text-align: center;">No products found.</p>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th style="width: 70px;">Image</th>
						<th>Product Id</th>
						<th>Name</th>
						<th>Category</th>
						<th style="text-align: right;">Price</th>
						<th style="text-align: right;">Points</th>
						<th style="width: 150px; text-align: center;">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each products as prod (prod.ProductId || prod.productId)}
						{@const id = prod.ProductId || prod.productId}
						<tr>
							<td style="text-align: center;">
								{#if prod.imageURL || prod.imageUrl}
									<img
										src={prod.imageURL || prod.imageUrl}
										alt={prod.name}
										style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;"
									/>
								{:else}
									<div style="width: 44px; height: 44px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #9ca3af;">
										N/A
									</div>
								{/if}
							</td>
							<td><strong style="color: #111827;">{id}</strong></td>
							<td><span style="font-weight: 500;">{prod.name}</span></td>
							<td><span class="category-badge">{prod.category || 'General'}</span></td>
							<td style="text-align: right; font-weight: 600; color: #059669;">
								${Number(prod.price ?? prod.amount ?? 0).toFixed(2)}
							</td>
							<td style="text-align: right; font-weight: 600; color: #2563eb;">
								{prod.points} pts
							</td>
							<td style="text-align: center;">
								<div style="display: flex; gap: 6px; justify-content: center;">
									<button onclick={() => handleEdit(prod)}>Edit</button>
									<button class="btn-danger" onclick={() => handleDelete(id)}>Delete</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 16px;
	}
	.field {
		display: flex;
		flex-direction: column;
	}
	.field.full-width {
		grid-column: 1 / -1;
	}
	.category-badge {
		background: #eff6ff;
		color: #1d4ed8;
		padding: 4px 10px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 500;
	}
</style>
