import { NextResponse } from 'next/server';

// Get API key from environment variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    
    let customerPhone = null;
    let message = null;
    
    const phoneMatch = raw.match(/"from":"([^"]+)"/);
    if (phoneMatch) customerPhone = phoneMatch[1];
    
    const msgMatch = raw.match(/"body":"([^"\\]+)/);
    if (msgMatch) message = msgMatch[1];
    
    if (!customerPhone || !message) {
      return NextResponse.json({ ok: true });
    }
    
    console.log(`📱 Customer: ${customerPhone}`);
    console.log(`💬 Message: ${message}`);
    
    // Simple response without API key
    const lowerMsg = message.toLowerCase();
    let reply = "";
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      reply = "👋 Hello! Welcome to Xbase AI!\n\nHow can I help you today?\n\n• PRODUCTS - See catalog\n• PRICING - Get rates\n• HELP - Support\n• ORDER - Place order";
    } 
    else if (lowerMsg.includes("product")) {
      reply = "📦 Our Products:\n\n🤖 AI Agent - 150,000 FCFA\n💬 Chatbot - 75,000 FCFA\n📊 Analytics - 50,000 FCFA";
    }
    else if (lowerMsg.includes("price") || lowerMsg.includes("pricing")) {
      reply = "💰 Pricing:\n\nAI Agent: 150,000 FCFA\nChatbot: 75,000 FCFA\nAnalytics: 50,000 FCFA";
    }
    else {
      reply = "🤖 Xbase AI Assistant\n\nHow can I help? Try: PRODUCTS, PRICING, HELP, or ORDER";
    }
    
    // Send reply
    await fetch("https://gate.whapi.cloud/messages/text", {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 4CKRKPGUmhUlRUVSkFhsF5qq2f5L66PE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: customerPhone, body: reply })
    });
    
    console.log(`✅ Reply sent to ${customerPhone}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "Xbase AI Active",
    message: "WhatsApp bot is running"
  });
}