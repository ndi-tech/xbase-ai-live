import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yllquiyrnhicvnrhihfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, phoneNumber, method } = await request.json();

    await new Promise(resolve => setTimeout(resolve, 1500));

    const isSuccess = Math.random() < 0.9;
    const transactionRef = `SIM_${orderId}_${Date.now()}`;

    if (isSuccess) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          transaction_reference: transactionRef,
          customer_phone: phoneNumber,
          payment_method: method
        })
        .eq('id', orderId);

      return NextResponse.json({
        success: true,
        transactionRef: transactionRef,
        message: 'Payment successful! Order confirmed.',
        method: method
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment failed. Please try again.',
        method: method
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Payment processing error. Please try again.'
    }, { status: 500 });
  }
}
