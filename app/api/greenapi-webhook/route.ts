import { NextResponse } from 'next/server';

const GREENAPI_ID = "7107611783";
const GREENAPI_TOKEN = "9b0803ab70a74296888ec05ec505068a49d1495e90d845d3ba";

async function sendWhatsAppMessage(phone, message) {
  const url = `https://api.green-api.com/waInstance${GREENAPI_ID}/SendMessage/${GREENAPI_TOKEN}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: `${phone}@c.us`, message: message })
  });
  return response.json();
}

export async function POST(request) {
  try {
    const rawText = await request.text();
    console.log("Raw body length:", rawText.length);
    
    // Try to extract message using regex instead of JSON parse
    let phone = null;
    let message = null;
    
    // Extract phone using regex
    const phoneMatch = rawText.match(/"chat_id":"([^"]+)"/);
    if (phoneMatch) {
      phone = phoneMatch[1].replace('@s.whatsapp.net', '');
    }
    
    // Extract message using regex
    const msgMatch = rawText.match(/"body":"([^"\\]*(?:\\.[^"\\]*)*)"/);
    if (msgMatch) {
      message = msgMatch[1].replace(/\\n/g, '\n');
    }
    
    if (!message || !phone) {
      console.log("Could not extract message via regex");
      return NextResponse.json({ status: "no message" });
    }
    
    console.log(`ðŸ“± From: ${phone}`);
    console.log(`ðŸ’¬ Message: ${message}`);
    
    // Generate response
    const lowerMsg = message.toLowerCase();
    let reply = "";
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      reply = "ðŸ‘‹ Hello! Welcome to Xbase AI!\n\nSend PRODUCTS to see catalog, PRICING for rates, HELP for support, or ORDER to place order.";
    } 
    else if (lowerMsg.includes("product")) {
      reply = "ðŸ“¦ Products: AI Agent 50k FCFA, Chatbot 25k FCFA, Analytics 15k FCFA. Which interests you?";
    }
    else if (lowerMsg.includes("price") || lowerMsg.includes("pricing")) {
      reply = "ðŸ’° Pricing: AI Agent 50k, Chatbot 25k, Analytics 15k FCFA.";
    }
    else if (lowerMsg.includes("help")) {
      reply = "ðŸ†˜ Support: email support@xbase.ai or visit our website.";
    }
    else if (lowerMsg.includes("order")) {
      reply = "ðŸ›’ To order: Tell me which product and quantity.";
    }
    else {
      reply = "ðŸ¤– How can I help? Try: PRODUCTS, PRICING, HELP, or ORDER";
    }
    
    await sendWhatsAppMessage(phone, reply);
    console.log(`âœ… Reply sent to ${phone}`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: error.message });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Active", number: "+237656508197" });
}