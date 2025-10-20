import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Minimal test API working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
