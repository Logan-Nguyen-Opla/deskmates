// app/api/rooms/create/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const apiKey = process.env.WHEREBY_API_KEY;

    const response = await fetch("https://api.whereby.dev/v1/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: new Date(Date.now() + 14400000).toISOString(),
        isLocked: false,
        roomMode: "normal"
      }),
    });

    const data = await response.json();
    
    // ENSURE THESE FIELD NAMES MATCH WHAT ADMINPAGE EXPECTS
    return NextResponse.json({
      roomUrl: data.roomUrl,
      hostRoomUrl: data.hostRoomUrl || data.roomUrl, // Fallback if host URL isn't returned
      success: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}