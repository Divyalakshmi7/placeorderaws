import { json } from '@sveltejs/kit';

const AWS_API_URL =
  'https://2rn9ci2zh4.execute-api.ap-south-1.amazonaws.com/dev/api/orders';

// GET /api/customers - fetch all customers or customer by id from AWS
export async function GET({ fetch }) {
  try {

    const response = await fetch(AWS_API_URL);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ??
          'application/json'
      }
    });
  } catch (error) {
    console.error('AWS API error:', error);

    return json(
      { message: 'Unable to connect to AWS API' },
      { status: 502 }
    );
  }
}

// POST /api/customers - create customer in AWS
export async function POST({ request, fetch }) {
  try {
    const orderData = await request.json();

	console.log("orderData",orderData);
    const response = await fetch(AWS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
	

    const responseText = await response.text();

    return new Response(responseText, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('content-type') ??
          'application/json'
      }
    });
  } catch (error) {
    console.error('Create order error:', error);

    return json(
      { message: 'Unable to create order' },
      { status: 502 }
    );
  }
}