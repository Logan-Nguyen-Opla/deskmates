import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    const apiKey = process.env.WHEREBY_API_KEY; // NO 'NEXT_PUBLIC_' HERE

    const response = await fetch("https://api.whereby.dev/v1/meetings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endDate: new Date(Date.now() + 14400000).toISOString(), // 4 hour session
        isLocked: false,
        roomMode: "normal"
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Whereby Failure");

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}