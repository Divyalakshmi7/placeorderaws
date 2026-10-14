<script>
	import { onMount } from 'svelte';

	let customers = $state([]);
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	// Search filter
	let searchQuery = $state('');

	// Form state
	let isEditing = $state(false);
	let form = $state({
		CustomerId: '',
		name: '',
		country: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		zipCode: '',
		email: '',
		contactPhone: '',
		availablePoints: 0
	});

	async function getAllCustomers() {
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/customers');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message ?? 'Failed to fetch customers');
			}

			let list = [];
			if (data && data.body) {
				const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
				list = parsed.customers || (Array.isArray(parsed) ? parsed : []);
			} else if (Array.isArray(data)) {
				list = data;
			} else if (data && data.customers) {
				list = data.customers;
			}

			if (searchQuery) {
				const q = searchQuery.toLowerCase();
				list = list.filter((c) =>
					[c.CustomerId, c.customerId, c.name, c.email, c.contactPhone, c.phone]
						.some((v) => v && String(v).toLowerCase().includes(q))
				);
			}

			customers = list;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		isEditing = false;
		form = {
			CustomerId: '',
			name: '',
			country: '',
			address1: '',
			address2: '',
			city: '',
			state: '',
			zipCode: '',
			email: '',
			contactPhone: '',
			availablePoints: 0
		};
	}

	function handleEdit(c) {
		isEditing = true;
		form = {
			CustomerId: c.CustomerId || c.customerId || '',
			name: c.name || '',
			country: c.country || '',
			address1: c.address1 || c.address || '',
			address2: c.address2 || '',
			city: c.city || '',
			state: c.state || '',
			zipCode: c.zipCode || '',
			email: c.email || '',
			contactPhone: c.contactPhone || c.phone || '',
			availablePoints: c.availablePoints || 0
		};
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function handleSubmit(e, customerId) {
		e.preventDefault();
		error = '';
		message = '';

		try {
			const targetId = customerId || form.CustomerId;
			if (isEditing && targetId) {
				const res = await fetch('/api/customers/' + encodeURIComponent(targetId), {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form)
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || data.error || 'Failed to update customer');
				message = `Customer ${targetId} updated successfully (PUT).`;
			} else {
				const res = await fetch('/api/customers', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(form)
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || data.error || 'Failed to create customer');
				message = `Customer created successfully.`;
			}
			resetForm();
			await getAllCustomers();
		} catch (e) {
			error = e.message;
		}
	}

	async function handleDelete(CustomerId) {
		if (!confirm(`Are you sure you want to delete customer "${CustomerId}"?`)) return;
		error = '';
		message = '';

		try {
			const res = await fetch(`/api/customers/${encodeURIComponent(CustomerId)}`, {
				method: 'DELETE'
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || data.error || 'Failed to delete customer');
			message = `Customer ${CustomerId} deleted successfully (DELETE).`;
			await getAllCustomers();
		} catch (e) {
			error = e.message;
		}
	}

	onMount(() => {
		getAllCustomers();
	});
</script>

<svelte:head>
	<title>Customers Directory &bull; Portal</title>
</svelte:head>

<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
		<div>
			<h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827;">Customers Management</h1>			
		</div>
		<div style="display: flex; gap: 10px;">
			<a href="/register" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; padding: 9px 16px;">
				+ Register Customer Form
			</a>
			<button class="btn-secondary" onclick={getAllCustomers}>↻ Refresh Data</button>
		</div>
	</div>

	{#if message}
		<div class="alert alert-success" style="margin-top: 16px;">{message}</div>
	{/if}
	{#if error}
		<div class="alert alert-error" style="margin-top: 16px;">{error}</div>
	{/if}
</div>

<!-- Customer Form -->
<div class="card">
	<div class="form-header">
		<h2 style="margin: 0; font-size: 18px;">
			{isEditing ? 'Edit Customer' : 'Add New Customer'}
		</h2>
		<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Customer profile with contact and location details.</p>
	</div>

	<form onsubmit={(event) => handleSubmit(event, form.CustomerId)} style="margin-top: 18px;">
		<div class="form-grid">
			<div class="field">
				<label for="CustomerId">Customer ID</label>
				<input
					id="CustomerId"
					type="text"
					bind:value={form.CustomerId}
					placeholder={isEditing ? '' : 'Auto-generated if left blank'}
					disabled={isEditing}
				/>
			</div>

			<div class="field">
				<label for="cname">Name *</label>
				<input
					id="cname"
					type="text"
					bind:value={form.name}
					placeholder="Albert Fernandas"
					required
				/>
			</div>

			<div class="field">
				<label for="email">Email *</label>
				<input
					id="email"
					type="email"
					bind:value={form.email}
					placeholder="albert@example.com"
					required
				/>
			</div>

			<div class="field">
				<label for="contactPhone">Contact Phone</label>
				<input
					id="contactPhone"
					type="text"
					bind:value={form.contactPhone}
					placeholder="+91 9876543210"
				/>
			</div>

			<div class="field">
				<label for="country">Country</label>
				<input
					id="country"
					type="text"
					bind:value={form.country}
					placeholder="India"
				/>
			</div>

			<div class="field">
				<label for="state">State</label>
				<input
					id="state"
					type="text"
					bind:value={form.state}
					placeholder="TamilNadu"
				/>
			</div>

			<div class="field">
				<label for="city">City</label>
				<input
					id="city"
					type="text"
					bind:value={form.city}
					placeholder="Chennai"
				/>
			</div>

			<div class="field">
				<label for="zipCode">Zip Code</label>
				<input
					id="zipCode"
					type="text"
					bind:value={form.zipCode}
					placeholder="600113"
				/>
			</div>

			<div class="field">
				<label for="address1">Address</label>
				<input
					id="address1"
					type="text"
					bind:value={form.address1}
					placeholder="1, Random St"
				/>
			</div>

			<div class="field">
				<label for="availablePoints">Initial Points Balance</label>
				<input
					id="availablePoints"
					type="number"
					min="0"
					step="1"
					bind:value={form.availablePoints}
				/>
			</div>
		</div>

		<div style="margin-top: 18px; display: flex; gap: 10px;">
			<button type="submit" class="btn-primary">
				{isEditing ? 'Save Changes' : 'Create Customer'}
			</button>
			{#if isEditing}
				<button type="button" class="btn-secondary" onclick={resetForm}>Cancel</button>
			{/if}
		</div>
	</form>
</div>

<!-- Customers Table -->
<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
		<h2 style="margin: 0; font-size: 18px;">Customer Directory</h2>
		<div style="display: flex; gap: 8px;">
			<input
				type="text"
				placeholder="Search by name, email, id..."
				bind:value={searchQuery}
				onkeydown={(e) => e.key === 'Enter' && getAllCustomers()}
				style="max-width: 260px;"
			/>
			<button class="btn-primary" onclick={getAllCustomers}>Search</button>
			{#if searchQuery}
				<button class="btn-secondary" onclick={() => { searchQuery = ''; getAllCustomers(); }}>Clear</button>
			{/if}
		</div>
	</div>

	{#if loading}
		<p style="padding: 20px; color: #6b7280; text-align: center;">Loading directory...</p>
	{:else if customers.length === 0}
		<p style="padding: 20px; color: #6b7280; text-align: center;">No customers found.</p>
	{:else}
		<div style="overflow-x: auto;">
			<table>
				<thead>
					<tr>
						<th>Customer Id</th>
						<th>Name</th>
						<th>Email</th>
						<th>Phone</th>
						<th>Location</th>
						<th style="text-align: right;">Points Balance</th>
						<th style="width: 200px; text-align: center;">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each customers as c (c.CustomerId || c.customerId)}
						{@const id = c.CustomerId || c.customerId}
						<tr>
							<td><strong style="color: #111827;">{id}</strong></td>
							<td><span style="font-weight: 500;">{c.name}</span></td>
							<td>{c.email || '-'}</td>
							<td>{c.contactPhone || c.phone || '-'}</td>
							<td>{[c.city, c.state, c.country].filter(Boolean).join(', ') || '-'}</td>
							<td style="text-align: right; font-weight: 700; color: #2563eb;">
								{c.availablePoints ?? 0} pts
							</td>
							<td style="text-align: center;">
								<div style="display: flex; gap: 6px; justify-content: center;">
									<!-- <a
										href="/customer/{id}"
										class="badge-link"
										title="Open AWS Customer Dashboard"
									>
										Dashboard
									</a> -->
									<button onclick={() => handleEdit(c)}>Edit</button>
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
	.badge-link {
		background: #eff6ff;
		color: #2563eb;
		border: 1px solid #bfdbfe;
		padding: 6px 10px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
	}
	.badge-link:hover {
		background: #dbeafe;
	}
</style>
