import { NextResponse } from 'next/server';

const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const YCLOUD_WEBHOOK_SECRET = "whsec_ffa1c64c3fad44d2b44515445e172a58";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Verify webhook signature
    const signature = request.headers.get('x-ycloud-signature');
    if (signature !== YCLOUD_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const { phone, content } = body;
    console.log(`Received WhatsApp message from ${phone}: ${content}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('YCloud webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === YCLOUD_WEBHOOK_SECRET) {
    return new Response(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}