import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const apiKey = process.env.WHEREBY_API_KEY; // Use server-side key (no NEXT_PUBLIC_)

    const response = await fetch("https://api.whereby.dev/v1/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour session
        isLocked: false,
        roomNamePrefix: "/deskmates-",
        roomMode: "normal"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whereby API Error: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}