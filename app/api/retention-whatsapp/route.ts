import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'whatsapp-messaging-bot.p.rapidapi.com';

export async function POST(request: NextRequest) {
  try {
    const { to, message, sessionId } = await request.json();

    // First, create/start a session if not provided
    let session = sessionId;
    
    if (!session) {
      // Create a new session
      const sessionResponse = await fetch(`https://${RAPIDAPI_HOST}/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY!,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      });
      const sessionData = await sessionResponse.json();
      session = sessionData.id;
    }

    // Send message via the session
    const response = await fetch(`https://${RAPIDAPI_HOST}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY!,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      body: JSON.stringify({
        session: session,
        to: to,
        text: message
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        messageId: data.id,
        sessionId: session 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.message || 'Failed to send message' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('WhatsApp error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send message' 
    }, { status: 500 });
  }
}