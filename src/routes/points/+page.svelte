<script>
	import { onMount } from 'svelte';

	let customers = $state([]);
	let selectedCustomerId = $state('');
	let selectedCustomer = $state(null);
	let balanceInfo = $state(null);

	// Action Form
	let action = $state('ASSIGN');
	let pointsAmount = $state(50);
	let reason = $state('');

	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	function parseList(data, key) {
		if (!data) return [];
		if (Array.isArray(data)) return data;
		if (data.body) {
			try {
				const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
				if (Array.isArray(parsed)) return parsed;
				if (parsed && Array.isArray(parsed[key])) return parsed[key];
				if (parsed && typeof parsed === 'object') {
					const found = Object.values(parsed).find((v) => Array.isArray(v));
					if (found) return found;
				}
			} catch (_) {}
		}
		if (data[key] && Array.isArray(data[key])) return data[key];
		return [];
	}

	async function loadCustomers() {
		try {
			const res = await fetch('/api/customers');
			const data = await res.json();
			customers = parseList(data, 'customers');
			if (customers.length > 0 && !selectedCustomerId) {
				selectedCustomerId = customers[0].CustomerId || customers[0].customerId;
				await fetchCustomerBalance(selectedCustomerId);
			}
		} catch (e) {
			error = 'Failed to load customers';
		}
	}

	async function fetchCustomerBalance(custId) {
		if (!custId) return;
		loading = true;
		error = '';
		try {
			const res = await fetch(`/api/points?customerId=${encodeURIComponent(custId)}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Failed to fetch points');
			balanceInfo = data;
			selectedCustomer = customers.find((c) => (c.customerId === custId || c.CustomerId === custId)) || null;
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	function handleCustomerChange(e) {
		selectedCustomerId = e.target.value;
		fetchCustomerBalance(selectedCustomerId);
	}

	async function handlePointsTransaction(e) {
		e.preventDefault();
		error = '';
		message = '';

		if (!selectedCustomerId) {
			error = 'Please select a customer';
			return;
		}

		if (!pointsAmount || pointsAmount <= 0) {
			error = 'Points amount must be greater than 0';
			return;
		}

		try {
			const res = await fetch('/api/points', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					customerId: selectedCustomerId,
					action,
					points: Number(pointsAmount),
					reason: reason.trim()
				})
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || 'Transaction failed');

			message = `Success! ${data.action === 'ASSIGN' ? 'Assigned' : 'Deducted'} ${data.pointsProcessed} points. Prior balance: ${data.previousPoints}, New balance: ${data.newBalance}.`;
			
			await loadCustomers();
			await fetchCustomerBalance(selectedCustomerId);
			reason = '';
		} catch (e) {
			error = e.message;
		}
	}

	onMount(() => {
		loadCustomers();
	});
</script>

<svelte:head>
	<title>Points Wallet &bull; Portal</title>
</svelte:head>

<div class="card">
	<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
		<div>
			<h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827;">Points Wallet &amp; Balances</h1>
		</div>
		<div>
			<button class="btn-secondary" onclick={() => fetchCustomerBalance(selectedCustomerId)}>↻ Refresh Balance</button>
		</div>
	</div>

	{#if message}
		<div class="alert alert-success" style="margin-top: 16px;">{message}</div>
	{/if}
	{#if error}
		<div class="alert alert-error" style="margin-top: 16px;">{error}</div>
	{/if}
</div>

<div class="wallet-grid">
	<!-- Customer & Balance View (GET) -->
	<div class="card" style="margin-bottom: 0;">
		<div style="margin-bottom: 16px;">
			<h2 style="margin: 0; font-size: 18px;">1. Balance Inquiry (GET /api/points)</h2>
			<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Select customer account to retrieve live point balance.</p>
		</div>
		
		<div style="margin-bottom: 18px;">
			<label for="selectCust">Customer Account</label>
			<select id="selectCust" value={selectedCustomerId} onchange={handleCustomerChange}>
				{#each customers as c}
					{@const id = c.CustomerId || c.customerId}
					<option value={id}>
						{c.name} ({id})
					</option>
				{/each}
			</select>
		</div>

		{#if balanceInfo}
			<div class="balance-display-box">
				<div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Account Holder</div>
				<div style="font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 14px;">
					{balanceInfo.name} <span style="font-size: 13px; font-weight: normal; color: #6b7280;">({balanceInfo.customerId})</span>
				</div>
				
				<div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Current Available Points</div>
				<div style="font-size: 36px; font-weight: 800; color: #2563eb;">
					{balanceInfo.availablePoints} <span style="font-size: 18px; font-weight: 500; color: #6b7280;">pts</span>
				</div>
				
				{#if selectedCustomer}
					<div style="margin-top: 16px; font-size: 13px; color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; flex-direction: column; gap: 4px;">
						<div>Email: <strong>{selectedCustomer.email || 'N/A'}</strong></div>
						<div>Phone: <strong>{selectedCustomer.contactPhone || 'N/A'}</strong></div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Transaction Form (POST) -->
	<div class="card" style="margin-bottom: 0;">
		<div style="margin-bottom: 16px;">
			<h2 style="margin: 0; font-size: 18px;">2. Assign / Deduct Points</h2>
			<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Credit points as rewards or debit points for redemption.</p>
		</div>

		<form onsubmit={handlePointsTransaction}>
			<div style="margin-bottom: 16px;">
				<label>Transaction Type</label>
				<div class="action-switch-row">
					<label class="radio-label">
						<input type="radio" bind:group={action} value="ASSIGN" />
						<span>Assign Points (Credit)</span>
					</label>
					<label class="radio-label">
						<input type="radio" bind:group={action} value="DEDUCT" />
						<span>Deduct Points (Debit)</span>
					</label>
				</div>
			</div>

			<div style="margin-bottom: 16px;">
				<label for="ptsAmount">Points Quantity *</label>
				<input
					id="ptsAmount"
					type="number"
					min="1"
					step="1"
					bind:value={pointsAmount}
					required
				/>
			</div>

			<div style="margin-bottom: 20px;">
				<label for="reason">Description / Note (Optional)</label>
				<input
					id="reason"
					type="text"
					bind:value={reason}
					placeholder="e.g. Promotional Reward, Purchase Redemption"
				/>
			</div>

			<button
				type="submit"
				class={action === 'ASSIGN' ? 'btn-primary' : 'btn-danger'}
				style="width: 100%; padding: 12px;"
			>
				{action === 'ASSIGN' ? 'Assign Points (+ Credit)' : 'Deduct Points (- Debit)'}
			</button>
		</form>
	</div>
</div>

<div class="card" style="margin-top: 24px;">
	<h2 style="margin: 0 0 16px 0; font-size: 18px;">All Customer Balances Overview</h2>
	<div style="overflow-x: auto;">
		<table>
			<thead>
				<tr>
					<th>Customer ID</th>
					<th>Customer Name</th>
					<th>Email</th>
					<th style="text-align: right;">Points Balance</th>
					<th style="text-align: center; width: 140px;">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each customers as c}
					{@const id = c.CustomerId || c.customerId}
					<tr>
						<td><strong style="color: #111827;">{id}</strong></td>
						<td><span style="font-weight: 500;">{c.name}</span></td>
						<td>{c.email || '-'}</td>
						<td style="text-align: right; font-weight: 700; color: #2563eb;">
							{c.availablePoints ?? 0} pts
						</td>
						<td style="text-align: center;">
							<button
								onclick={() => {
									selectedCustomerId = id;
									fetchCustomerBalance(id);
								}}
							>
								Select Account
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.wallet-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}
	.balance-display-box {
		border: 1px solid #e5e7eb;
		background: #f9fafb;
		border-radius: 12px;
		padding: 20px;
	}
	.action-switch-row {
		display: flex;
		gap: 20px;
		padding: 8px 0;
	}
	.radio-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0;
	}
	.radio-label input {
		width: 16px;
		height: 16px;
	}

	@media (max-width: 800px) {
		.wallet-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
