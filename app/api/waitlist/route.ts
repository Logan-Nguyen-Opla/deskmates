import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // 1. Validate environment
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing from .env.local");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    // 2. Check current waitlist size
    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;
    const isPriority = currentCount < 100;

    // 3. Save to Firestore
    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      priority: isPriority ? 'founder' : 'standard',
      position: currentCount + 1
    });

    // 4. Send Confirmation Email
    // FIX: Using onboarding@resend.dev to bypass unverified domain errors
    const { data, error } = await resend.emails.send({
      from: 'Deskmates <onboarding@resend.dev>', 
      to: email,
      subject: isPriority ? '⚠️ FOUNDER PRIORITY SECURED' : 'Deskmates Waitlist: Joined',
      html: `
        <div style="background:#000;color:#fff;padding:40px;font-family:sans-serif;border:1px solid #eab308;">
            <h1 style="color:#eab308;">${isPriority ? 'FOUNDER STATUS ACTIVE' : 'PROTOCOL SYNCED'}</h1>
            <p>Position: #${currentCount + 1}</p>
            <p>Welcome to the laboratory. Access opens Feb 23, 18:00 ICT.</p>
        </div>`
    });

    if (error) {
      console.error("RESEND_ERROR:", error);
      throw new Error(`Email failed: ${error.message}`);
    }

    return NextResponse.json({ success: true, position: currentCount + 1, isPriority });
  } catch (error: any) {
    console.error("WAITLIST_CRITICAL_FAILURE:", error);
    return NextResponse.json({ error: error.message || 'System Failure' }, { status: 500 });
  }
}