import { NextResponse } from 'next/server';

// Use standard Node.js runtime for better compatibility
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Minimal API endpoint working',
    timestamp: new Date().toISOString()
  });
}
