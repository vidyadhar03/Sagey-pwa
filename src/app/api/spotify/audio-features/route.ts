import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'audio-features endpoint is deprecated and no longer available.' },
    { status: 410 }
  );
} 