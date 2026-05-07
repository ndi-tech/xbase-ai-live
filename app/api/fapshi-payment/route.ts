import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { amount, phoneNumber, orderId, method } = await request.json();
    
    const FAPSHI_API_USER = process.env.FAPSHI_API_USER;
    const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY;
    
    console.log("=== FAPSHI PAYMENT ===");
    console.log("Amount:", amount);
    console.log("Phone:", phoneNumber);
    
    if (!FAPSHI_API_USER || !FAPSHI_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        message: "Payment configuration error" 
      }, { status: 500 });
    }
    
    // Try the correct Fapshi endpoint format
    const auth = Buffer.from(`${FAPSHI_API_USER}:${FAPSHI_API_KEY}`).toString("base64");
    
    // Try multiple possible endpoints
    const endpoints = [
      "https://api.fapshi.com/initiate-pay",
      "https://api.fapshi.com/v1/initiate-pay", 
      "https://api.fapshi.com/collect",
      "https://sandbox.fapshi.com/initiate-pay",
      "https://sandbox.fapshi.com/v1/initiate-pay"
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log("Trying endpoint:", endpoint);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: amount,
            phone: phoneNumber,
            currency: "XAF",
            reference: `XBASE_${orderId}_${Date.now()}`
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Success with endpoint:", endpoint);
          return NextResponse.json({ 
            success: true, 
            data: data,
            message: "Payment initiated. Check your phone."
          });
        }
      } catch (e) {
        console.log(`Endpoint ${endpoint} failed:`, e.message);
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: "Unable to connect to payment provider. Please try again later."
    }, { status: 500 });
    
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Payment error: " + error.message 
    }, { status: 500 });
  }
}
