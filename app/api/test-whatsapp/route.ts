import { NextResponse } from 'next/server';

const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;

export async function POST(request) {
  try {
    const { phone, message } = await request.json();
    
    const targetPhone = phone || WHATSAPP_NUMBER;
    
    // YCloud requires X-API-Key header, not Bearer token
    const response = await fetch('https://api.ycloud.com/v1/messages', {
      method: 'POST',
      headers: {
        'X-API-Key': YCLOUD_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: targetPhone,
        content: message || "Test message from Xbase AI via YCloud! Your WhatsApp is connected.",
        type: 'text'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: "WhatsApp message sent!",
        response: data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.error || "Failed to send message",
        response: data 
      }, { status: response.status });
    }
    
  } catch (error) {
    console.error('Test WhatsApp error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "YCloud API Ready",
    apiKey: YCLOUD_API_KEY ? "Set" : "Missing",
    phoneNumber: WHATSAPP_NUMBER || "Not set"
  });
}