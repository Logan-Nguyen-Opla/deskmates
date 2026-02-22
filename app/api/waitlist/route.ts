// app/api/waitlist/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;

    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      position: currentCount + 1
    });

    // FIXED: Using onboarding@resend.dev bypasses domain verification
    await resend.emails.send({
      from: 'Deskmates <onboarding@resend.dev>',
      to: email, // MUST BE YOUR OWN EMAIL ON FREE TIER UNLESS DOMAIN IS VERIFIED
      subject: 'Protocol Synchronized',
      html: `<div style="background:#000;color:#fff;padding:40px;border:1px solid #fbbf24;font-family:sans-serif;"><h1>WELCOME</h1><p>Agent ID: #${currentCount + 1}</p></div>`
    });

    return NextResponse.json({ success: true, position: currentCount + 1 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}