import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid Email Format' }, { status: 400 });
    }

    const waitlistRef = collection(db, 'waitlist');
    const snapshot = await getDocs(query(waitlistRef, limit(101)));
    const currentCount = snapshot.size;
    const isPriority = currentCount < 100;

    await addDoc(waitlistRef, {
      email,
      timestamp: serverTimestamp(),
      priority: isPriority ? 'founder' : 'standard',
      position: currentCount + 1
    });

    await resend.emails.send({
      from: 'Deskmates <hq@deskmates.online>',
      to: email,
      subject: isPriority ? '⚠️ FOUNDER PRIORITY SECURED' : 'Deskmates Waitlist: Joined',
      html: `<div style="background:#000;color:#fff;padding:40px;border:1px solid #eab308;font-family:monospace;">
              <h1 style="color:#eab308;">${isPriority ? 'FOUNDER STATUS ACTIVE' : 'PROTOCOL SYNCED'}</h1>
              <p>Position: #${currentCount + 1}</p>
              <p>Deskmates is a community project for students. No cost, just focus.</p>
             </div>`
    });

    return NextResponse.json({ success: true, position: currentCount + 1, isPriority });
  } catch (error) {
    return NextResponse.json({ error: 'System Failure' }, { status: 500 });
  }
}