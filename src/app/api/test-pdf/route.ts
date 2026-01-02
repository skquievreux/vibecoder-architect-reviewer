import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'PDF generation endpoint is working',
    status: 'ready-for-testing',
    environment: process.env.NODE_ENV || 'unknown',
    chromium_version: '2024-12-19',
    timestamp: new Date().toISOString()
  });
}