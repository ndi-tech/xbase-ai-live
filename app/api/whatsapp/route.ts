import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { phone, message } = await request.json();
    
    console.log(`📱 From: ${phone}`);
    console.log(`💬 Message: ${message}`);
    
    // Auto-reply logic
    const lowerMsg = message.toLowerCase();
    let reply = "";
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      reply = "👋 Hello! Welcome to Xbase AI!\n\n1️⃣ Products\n2️⃣ Support\n3️⃣ Order\n4️⃣ Pricing";
    } 
    else if (lowerMsg.includes("product")) {
      reply = "📦 Products:\n\n🤖 AI Agent - 50,000 FCFA\n💬 Chatbot - 25,000 FCFA\n📊 Analytics - 15,000 FCFA";
    }
    else if (lowerMsg.includes("price")) {
      reply = "💰 Pricing:\n\nAI Agent: 50,000 FCFA\nChatbot: 25,000 FCFA\nAnalytics: 15,000 FCFA";
    }
    else if (lowerMsg.includes("help")) {
      reply = "🆘 Support:\n\nEmail: support@xbase.ai\nWeb: https://xbase-dashboard-clean.vercel.app";
    }
    else {
      reply = "🤖 Xbase AI\n\nHow can I help? Reply: PRODUCTS, PRICING, HELP, or ORDER";
    }
    
    return NextResponse.json({ 
      success: true, 
      reply: reply,
      phone: phone
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "✅ Xbase AI WhatsApp API is LIVE!",
    usage: {
      method: "POST",
      url: "/api/whatsapp",
      body: {
        phone: "237656508197",
        message: "Hello"
      }
    },
    example: "curl -X POST https://xbase-dashboard-clean.vercel.app/api/whatsapp -H 'Content-Type: application/json' -d '{\"phone\":\"237656508197\",\"message\":\"Hello\"}'"
  });
}
