import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid ID Format' }, { status: 400 });
    }

    // 1. Check current waitlist size
    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;
    const isPriority = currentCount < 100;

    // 2. Save to Firestore
    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      priority: isPriority ? 'founder' : 'standard',
      position: currentCount + 1
    });

    // 3. Send Confirmation Email
    // NOTE: If you haven't verified deskmates.online, use 'onboarding@resend.dev'
    await resend.emails.send({
      from: 'Deskmates <onboarding@resend.dev>', 
      to: email,
      subject: isPriority ? '⚠️ FOUNDER PRIORITY SECURED' : 'Deskmates Waitlist: Joined',
      html: `<div style="background:#000;color:#fff;padding:40px;font-family:sans-serif;border:1px solid #eab308;">
                <h1 style="color:#eab308;">PROTOCOL SYNCED</h1>
                <p>Agent ID: #${currentCount + 1}</p>
                <p>Welcome to the laboratory.</p>
             </div>`
    });

    return NextResponse.json({ success: true, position: currentCount + 1, isPriority });
  } catch (error: any) {
    console.error("WAITLIST_CRITICAL_FAILURE:", error);
    // Returning the actual error message helps you debug in the alert box
    return NextResponse.json({ error: error.message || 'System Failure' }, { status: 500 });
  }
}