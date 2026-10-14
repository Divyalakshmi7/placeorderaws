<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	const CUSTOMER_ORDER_ENDPOINT = "https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api";

	let search = $state('');
	let currentPage = $state(1);
	let customer = $state({});
	let loading = $state(true);
	let error = $state('');
	let cartCount = $state(0);
	let activeTab = $state('orders'); // 'orders' | 'customers'

	// Seed customers for navigation
	let customersList = $state([]);

	// Customer's orders
	let ordersList = $state([]);

	// Filtered list based on active tab
	let filteredOrders = $derived(
		ordersList.filter(o =>
			[o.orderId, String(o.orderAmount), String(o.totalPoints)]
				.some(v => v && v.toLowerCase().includes(search.toLowerCase()))
		)
	);

	let filteredCustomers = $derived(
		customersList.filter(c =>
			[c.id, c.code, c.name, c.email, c.phone, c.status]
				.some(v => v && v.toLowerCase().includes(search.toLowerCase()))
		)
	);

	let currentItems = $derived(activeTab === 'orders' ? filteredOrders : filteredCustomers);
	let totalPages = $derived(Math.max(1, Math.ceil(currentItems.length / 5)));
	let paginatedRows = $derived(
		currentItems.slice((currentPage - 1) * 5, currentPage * 5)
	);

	async function loadCustomerData(custid) {
		if (!custid) custid = '1';
		loading = true;
		error = '';
		try {
			// Fetch from AWS via API route
			const res = await fetch(`/api/customers/${custid}`);
			const data = await res.json();
			
			if (data && data.body) {
				customer = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
			} else {
				customer = data;
			}

			// Also fetch orders for this customer from local/system API
			try {
				const ordRes = await fetch(`/api/orders`);
				if (ordRes.ok) {
					const allOrders = await ordRes.json();
					ordersList = allOrders.filter(
						o => o.customerId === customer.CustomerId || 
						     o.customerId === customer.customerId || 
						     o.customerId === custid ||
						     o.customerId === 'CUST-001'
					);
				}
			} catch (_) {
				ordersList = [];
			}
		} catch (err) {
			console.error('Error loading customer:', err);
			error = err.message || 'Failed to load customer';
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		let custid = page.params.id;
		if (!custid) {
			try {
				const parts = location.pathname.split('/customer');
				if (parts.length > 1) {
					custid = parts[1].replace(/^\//, '').split('/')[0];
				}
			} catch (_) {}
		}

		if (!custid) {
			custid = '1';
		}

		await loadCustomerData(custid);
	});
</script>

<svelte:head>
	<title>Customer Dashboard - AWS Integration</title>
</svelte:head>

{#if loading}
	<div style="padding: 40px; text-align: center; color: #536784;">Loading customer details from AWS...</div>
{:else if error}
	<div style="padding: 30px;">
		<div class="alert alert-error">Error: {error}</div>
		<button onclick={() => loadCustomerData('1')}>Load Default Customer</button>
	</div>
{:else}
<div class="app">
	<div class="layout">
		<main>
			<h1>Customer Dashboard</h1>
			<p class="subtitle">Live AWS Integration &bull; Endpoint: <code>{CUSTOMER_ORDER_ENDPOINT}</code></p>

			<section class="stats">
				<article>
					<span class="bubble blue">🪙</span>
					<div>
						<p>Available points</p>
						<h2>{customer.availablePoints ?? 0}</h2>
					</div>
				</article>

				<article>
					<span class="bubble green">👤</span>
					<div>
						<p>Customer Name</p>
						<h2 style="font-size: 19px;">{customer.name || '-'}</h2>
					</div>
				</article>

				<article>
					<span class="bubble purple">✉</span>
					<div>
						<p>Email</p>
						<h2 style="font-size: 15px; word-break: break-all;">{customer.email || '-'}</h2>
					</div>
				</article>

				<article>
					<span class="bubble red">📞</span>
					<div>
						<p>Phone</p>
						<h2 style="font-size: 19px;">{customer.phone || customer.contactPhone || '-'}</h2>
					</div>
				</article>
			</section>

			<!-- Quick switch customer demo bar -->
			<div style="background: white; border: 1px solid #e1e8f4; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
				<span style="font-weight: 600; color: #536784;">Switch AWS Customer:</span>
				{#each customersList as c}
					<a
						href="/customer/{c.id}"
						class="badge"
						style="text-decoration: none; cursor: pointer; {(customer.CustomerId === c.id || customer.customerId === c.code || customer.CustomerId === c.code) ? 'background: #1765ed; color: white;' : ''}"
						onclick={() => loadCustomerData(c.id)}
					>
						{c.name} ({c.code})
					</a>
				{/each}
			</div>

			<section class="panel">
				<div class="panel-header">
					<div style="display: flex; gap: 12px; align-items: center;">
						<button
							class={activeTab === 'orders' ? 'primary' : 'tab-btn'}
							onclick={() => { activeTab = 'orders'; currentPage = 1; }}
						>
							Customer Orders ({ordersList.length})
						</button>
						<button
							class={activeTab === 'customers' ? 'primary' : 'tab-btn'}
							onclick={() => { activeTab = 'customers'; currentPage = 1; }}
						>
							Directory Customers ({customersList.length})
						</button>
					</div>
					<div>
						<a href="/orders" class="primary" style="text-decoration: none; display: inline-block;">+ Place Bulk Order</a>
					</div>
				</div>

				<input
					class="search"
					bind:value={search}
					oninput={() => currentPage = 1}
					placeholder={activeTab === 'orders' ? "⌕  Search orders..." : "⌕  Search customers..."}
				/>

				<div class="table-wrap">
					{#if activeTab === 'orders'}
						<table>
							<thead>
								<tr>
									<th>Order ID</th>
									<th>Order Date</th>
									<th style="text-align: right;">Amount ($)</th>
									<th style="text-align: right;">Points Earned</th>
									<th>Items Count</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{#each paginatedRows as o (o.orderId)}
									<tr>
										<td><strong>{o.orderId}</strong></td>
										<td>{new Date(o.orderDate).toLocaleString()}</td>
										<td style="text-align: right; color: #059669; font-weight: 600;">${Number(o.orderAmount).toFixed(2)}</td>
										<td style="text-align: right; color: #1765ed; font-weight: 600;">{o.totalPoints} pts</td>
										<td>{(o.items || []).length} items</td>
										<td>
											<button
												class="view"
												onclick={() => alert(`Order: ${o.orderId}\nTotal: $${o.orderAmount}\nPoints: ${o.totalPoints}\nDate: ${o.orderDate}`)}
											>
												View Details
											</button>
										</td>
									</tr>
								{:else}
									<tr><td colspan="6" class="empty">No orders found for this customer. <a href="/orders">Create one now</a></td></tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Email</th>
									<th>Phone</th>
									<th>Status</th>
									<th>Created At</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{#each paginatedRows as c (c.id)}
									<tr>
										<td>{c.code}</td>
										<td class="customer-name">{c.name}</td>
										<td>{c.email}</td>
										<td>{c.phone}</td>
										<td><span class:inactive={c.status === 'Inactive'} class="badge">{c.status}</span></td>
										<td>{c.date}</td>
										<td>
											<button
												class="view"
												onclick={() => loadCustomerData(c.id)}
											>
												Switch View
											</button>
										</td>
									</tr>
								{:else}
									<tr><td colspan="7" class="empty">No customers found</td></tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</div>

				<footer>
					<span>Showing {currentItems.length ? (currentPage - 1) * 5 + 1 : 0}–{Math.min(currentPage * 5, currentItems.length)} of {currentItems.length}</span>
					<div class="pagination">
						<button disabled={currentPage === 1} onclick={() => currentPage--}>‹</button>
						<span>{currentPage} / {totalPages}</span>
						<button disabled={currentPage >= totalPages} onclick={() => currentPage++}>›</button>
					</div>
				</footer>
			</section>
		</main>
	</div>
</div>
{/if}

<style>
	:global(*) { box-sizing: border-box; }
	:global(body) { margin: 0; font-family: Arial, sans-serif; color: #172b4d; background: #f6f8fc; font-size: 14px; }
	button, input { font: inherit; }
	button { cursor: pointer; }
	.layout { display: grid; min-height: calc(100vh - 120px); }
	main { min-width: 0; padding: 10px 0; }
	h1 { font-size: 28px; margin: 0 0 8px; }
	.subtitle { color: #71819b; margin: 0 0 24px; }
	.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
	.stats article { display: flex; align-items: center; gap: 14px; background: white; padding: 18px 16px; border: 1px solid #e1e8f4; border-radius: 12px; }
	.bubble { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; font-size: 20px; }
	.blue { background: #e6efff; color: #1765ed; }
	.green { background: #e1f8ed; color: #059669; }
	.purple { background: #eee8ff; color: #7047eb; }
	.red { background: #ffe7e9; color: #dc3545; }
	.stats p { color: #71819b; margin: 0 0 6px; font-size: 12px; }
	.stats h2 { margin: 0; font-size: 24px; }
	.panel { background: white; border: 1px solid #e1e8f4; border-radius: 12px; padding: 20px; }
	.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; flex-wrap: wrap; }
	.primary { background: #1765ed; color: white; border: 0; border-radius: 7px; padding: 10px 16px; font-weight: 500; }
	.primary:hover { background: #0e50ca; }
	.tab-btn { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 7px; padding: 10px 16px; }
	.search { display: block; width: min(100%, 380px); padding: 10px 12px; border: 1px solid #dfe6f0; border-radius: 8px; margin-bottom: 17px; outline-color: #1765ed; }
	.table-wrap { overflow-x: auto; }
	table { border-collapse: collapse; width: 100%; text-align: left; white-space: nowrap; }
	th { background: #f6f8fc; color: #536784; font-size: 12px; font-weight: 600; }
	th, td { padding: 14px 12px; border-bottom: 1px solid #edf0f5; }
	td { font-size: 13px; color: #536784; }
	.customer-name { font-weight: 600; color: #263b59; }
	.badge { background: #e1f8ed; color: #07865c; padding: 5px 10px; border-radius: 20px; font-size: 12px; }
	.badge.inactive { background: #ffe7e9; color: #c7354b; }
	.view { border: 1px solid #c7d7ff; background: white; color: #1765ed; padding: 6px 12px; border-radius: 6px; }
	.empty { text-align: center; padding: 30px; }
	footer { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 18px; color: #71819b; font-size: 12px; }
	.pagination { display: flex; align-items: center; gap: 12px; }
	.pagination button { border: 1px solid #dfe6f0; background: white; padding: 5px 12px; border-radius: 6px; font-size: 16px; }
	.pagination button:disabled { opacity: .4; cursor: not-allowed; }
	@media (max-width: 1100px) { .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } main { padding: 15px; } }
	@media (max-width: 650px) {
		.layout { grid-template-columns: 1fr; }
		main { padding: 10px; }
		h1 { font-size: 24px; }
		.stats { gap: 9px; }
		.stats article { padding: 12px 9px; gap: 8px; }
		.bubble { width: 32px; height: 32px; font-size: 17px; }
		.stats h2 { font-size: 23px; }
		.panel { padding: 12px; }
		footer { align-items: flex-start; flex-direction: column; }
	}
</style>
