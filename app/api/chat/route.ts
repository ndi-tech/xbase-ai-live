import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    console.log("Question:", question);
    console.log("Context length:", context?.length || 0);
    
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      return NextResponse.json({ answer: "API key not configured" }, { status: 500 });
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `Answer using: ${context || 'No context'}` },
          { role: 'user', content: question }
        ],
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No response';
    
    return NextResponse.json({ answer });
  } catch (err) {
    const error = err as Error;
    console.error("Error:", error.message);
    return NextResponse.json({ answer: "Error: " + error.message }, { status: 500 });
  }
}
