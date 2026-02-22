import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1. Position Check
    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;
    const isPriority = currentCount < 100;

    // 2. Database Entry
    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      priority: isPriority ? 'founder' : 'standard',
      position: currentCount + 1
    });

    // 3. THE FIX: Using 'onboarding@resend.dev' stops the "System Error" 
    // because it doesn't require domain verification.
    await resend.emails.send({
      from: 'Deskmates <onboarding@resend.dev>',
      to: email,
      subject: isPriority ? '⚠️ FOUNDER PRIORITY SECURED' : 'Deskmates Waitlist: Joined',
      html: `<div style="background:#000;color:#fff;padding:40px;border:1px solid #eab308;font-family:sans-serif;">
                <h1 style="color:#eab308;">PROTOCOL SYNCED</h1>
                <p>Agent ID: #${currentCount + 1}</p>
                <p>Welcome to the laboratory. Access starts Monday 18:00 ICT.</p>
             </div>`
    });

    return NextResponse.json({ success: true, position: currentCount + 1, isPriority });
  } catch (error: any) {
    console.error("WAITLIST_FAIL:", error);
    return NextResponse.json({ error: error.message || 'System Failure' }, { status: 500 });
  }
}