import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { htmlContent } = await request.json();
    
    // Simple test response to verify PDF generation works
    return NextResponse.json({ 
      success: true, 
      message: 'PDF generation endpoint is working',
      received: htmlContent ? 'HTML content received' : 'No HTML content',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('PDF endpoint test error:', error);
    return NextResponse.json(
      { 
        error: 'PDF endpoint test failed', 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}