import { NextRequest, NextResponse } from "next/server";

// This is where you'll put your Fapshi API integration
// Once you have your API keys, replace this with real payment processing

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, phoneNumber, method } = await request.json();
    
    // TODO: Replace with actual Fapshi API call
    // const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY;
    // const response = await fetch("https://api.fapshi.com/v1/payments", {
    //   method: "POST",
    //   headers: { "Authorization": `Bearer ${FAPSHI_API_KEY}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ amount, phone: phoneNumber, currency: "XAF", reference: `ORDER_${orderId}` })
    // });
    
    // For now, simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 90% success rate
    const isSuccess = Math.random() < 0.9;
    
    if (isSuccess) {
      return NextResponse.json({ 
        success: true, 
        transactionId: `TXN_${Date.now()}`,
        message: "Payment successful" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Payment failed. Please try again." 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Payment processing error" }, { status: 500 });
  }
}
