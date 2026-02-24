export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-12 font-sans selection:bg-yellow-500 selection:text-black">
      <h1 className="text-6xl font-black mb-12 italic border-b-8 border-yellow-500 pb-6 tracking-tighter">PRIVACY PROTOCOL v1.0</h1>
      
      <div className="space-y-12 max-w-4xl text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">1.0 Data Controller Identification</h2>
          <p>This platform is operated by the Deskmates Development Team, led by Nguyen Nam Long. We are committed to protecting the neural integrity and digital privacy of every Agent synchronized with our network.</p>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">2.0 Information We Collect</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="text-yellow-500">Identity Data:</strong> Name and Email address provided via Google OAuth.</li>
            <li><strong className="text-yellow-500">Technical Data:</strong> IP addresses, browser types, and session timestamps used to maintain stable neural links during study sessions.</li>
            <li><strong className="text-yellow-500">Usage Data:</strong> Focus durations and room participation metrics to calculate your global rank.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">3.0 Purpose of Processing</h2>
          <p>We process your data exclusively to provide the Study Lobby service. This includes: session authentication, rank calculation, and waitlist positioning. We do not engage in data mining, third-party advertising, or the sale of Agent information to external entities.</p>
        </section>

        <section>
          <h2 className="text-2xl text-white font-black uppercase tracking-tighter mb-4 italic">4.0 Data Retention & Erasure</h2>
          <p>Data is stored securely within the Firebase ecosystem. Agents retain the right to terminate their link at any time. Upon account deletion, all personal identifiers are purged from our active databases within 30 days.</p>
        </section>
      </div>
    </div>
  );
}