import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid Email Protocol' }, { status: 400 });
    }

    // 2. Check current waitlist size for Priority Status
    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;
    const isPriority = currentCount < 100;

    // 3. Save to Firestore with Metadata
    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      priority: isPriority ? 'founder' : 'standard',
      position: currentCount + 1,
      notified: true
    });

    // 4. Send Personalized Confirmation
    await resend.emails.send({
      from: 'Deskmates <hq@deskmates.online>',
      to: email,
      subject: isPriority ? '⚠️ FOUNDER PRIORITY SECURED' : 'Deskmates Protocol: Joined',
      html: `
        <div style="font-family: monospace; background: #000; color: #fff; padding: 40px; border: 1px solid #eab308;">
          <h1 style="color: #eab308;">${isPriority ? 'FOUNDER STATUS: ACTIVE' : 'PROTOCOL JOINED'}</h1>
          <p>Email: ${email}</p>
          <p>Position: #${currentCount + 1}</p>
          <hr style="border-color: #333" />
          <p style="font-size: 12px;">Deskmates is a community-first initiative. Launching Feb 22, 18:00 ICT.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, position: currentCount + 1, isPriority });
  } catch (error) {
    return NextResponse.json({ error: 'System Failure' }, { status: 500 });
  }
}