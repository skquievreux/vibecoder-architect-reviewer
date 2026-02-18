export default function DatenschutzPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 text-slate-300 space-y-8">
            <h1 className="text-4xl font-black text-white">Datenschutz</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">1. Datenschutz auf einen Blick</h2>
                <p>
                    Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert,
                    wenn Sie diese Website besuchen.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">2. Hosting</h2>
                <p>
                    Wir hosten die Inhalte unserer Website bei folgendem Anbieter: Vercel Inc.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                <p>
                    Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                    Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften.
                </p>
            </section>

            <p className="text-sm text-slate-500 italic">
                Hinweis: Dies ist eine Kurzfassung. Die vollständige Datenschutzerklärung orientiert sich an Quievreux Consulting Standards.
            </p>
        </div>
    );
}
