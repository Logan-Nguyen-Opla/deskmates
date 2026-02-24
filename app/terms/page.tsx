export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans">
      <h1 className="text-6xl font-black mb-12 italic border-b-8 border-yellow-500 pb-6 tracking-tighter">TERMS OF ENGAGEMENT</h1>
      
      <div className="space-y-12 max-w-4xl text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">1.0 Acceptance of Protocol</h2>
          <p>By accessing Deskmates, you agree to abide by the high-intensity focus protocols established by the Founder. If you do not agree to these terms, you are prohibited from synchronizing with the lobby.</p>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">2.0 Agent Conduct (Rules of the Room)</h2>
          <p>To maintain the focus environment, every Agent must adhere to the following:</p>
          <ul className="list-disc ml-6 space-y-2 text-yellow-500/80 font-bold uppercase italic text-sm">
            <li>Strict focus: No disruptive background noise or visuals.</li>
            <li>Neural Integrity: No harassment, bullying, or inappropriate content in video feeds or chat.</li>
            <li>Protocol Silence: Microphones must remain muted unless otherwise authorized by a Moderator.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">3.0 System Limitations & Liability</h2>
          <p>Deskmates is provided as a study tool "as is." We are not liable for any technical failures, data loss, or "signal drops" during study sessions. Participation is at the Agent's own risk.</p>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">4.0 Founder Authority (Omega Clearance)</h2>
          <p>The Founder reserves the right to terminate any room session, reset Agent ranks, or ban any user who violates the core focus protocols without prior notice.</p>
        </section>
      </div>
    </div>
  );
}