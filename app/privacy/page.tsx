export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-black mb-12 italic border-b-8 border-yellow-500 pb-6 tracking-tighter uppercase">Privacy Protocol v1.0</h1>
        
        <div className="space-y-12 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">1.0 Control Identification</h2>
            <p>This study platform is operated by the Deskmates Development Team. We are committed to protecting the digital privacy of every student synchronized with our study network. This policy outlines how we handle data during your study sessions.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">2.0 Data Synchronization (Collection)</h2>
            <p>We only collect the minimum data necessary to maintain your study rank and session stability:</p>
            <ul className="list-disc ml-6 mt-4 space-y-4">
              <li><strong className="text-yellow-500">Google Identity:</strong> We collect your name and email address via Google OAuth to verify your identity and prevent duplicate accounts.</li>
              <li><strong className="text-yellow-500">Technical Metadata:</strong> We record session timestamps and room participation durations to calculate your "Stronghold Rank."</li>
              <li><strong className="text-yellow-500">Authentication Logs:</strong> IP addresses are logged temporarily by Firebase to protect against brute-force attacks.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">3.0 Protocol Usage (How we use data)</h2>
            <p>Your data is used strictly for internal platform functions. We do not engage in data mining, sell user information to third parties, or use your data for advertising. The data ensures you are placed correctly in the Study Lobby and can access privileged rooms based on your rank.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">4.0 Neural Security (Data Protection)</h2>
            <p>All authentication and database storage is handled via the <strong className="text-white">Google Firebase ecosystem</strong>. We do not store passwords on our local servers. Data transmission is encrypted via SSL/TLS protocols to ensure your uplink remains private.</p>
          </section>

          <section>
            <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">5.0 Agent Rights</h2>
            <p>You have the right to request a full purge of your data at any time. To request account deletion, contact the system founder. Upon verification, your identity will be removed from our active waitlist and user databases within 30 days.</p>
          </section>

          <footer className="pt-20 border-t border-white/5 text-[10px] uppercase tracking-widest text-gray-600">
            Last Updated: February 26, 2026 • Deskmates Labs • Vietnam
          </footer>
        </div>
      </div>
    </div>
  );
}