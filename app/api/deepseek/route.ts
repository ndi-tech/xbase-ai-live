import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    const userMessage = messages[messages.length - 1]?.content || "";
    const lowerMsg = userMessage.toLowerCase();
    
    let answer = "";
    
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      answer = "👋 Hello! Welcome to Xbase AI! How can I help you today?";
    } else if (lowerMsg.includes("product")) {
      answer = "📦 Our products:\n• AI Agent - 150,000 FCFA\n• Smart Chatbot - 75,000 FCFA\n• Analytics Dashboard - 50,000 FCFA";
    } else if (lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      answer = "💰 Pricing:\n• AI Agent: 150,000 FCFA\n• Chatbot: 75,000 FCFA\n• Analytics: 50,000 FCFA";
    } else if (lowerMsg.includes("help")) {
      answer = "🆘 I can help with:\n• Product information\n• Pricing\n• Order placement\n• Support";
    } else {
      answer = `🤖 I understand you're asking about "${userMessage}". How can I help you better?`;
    }
    
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ answer: "How can I help you today?" });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Xbase AI Chat Active" });
}