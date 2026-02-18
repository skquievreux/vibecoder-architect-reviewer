export default function ImpressumPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-24 text-slate-300 space-y-8">
            <h1 className="text-4xl font-black text-white">Impressum</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">Angaben gemäß § 5 TMG</h2>
                <p>
                    Quievreux Consulting<br />
                    Steffen Quievreux<br />
                    [Strasse]<br />
                    [PLZ Ort]
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">Kontakt</h2>
                <p>
                    Telefon: [Telefonnummer]<br />
                    E-Mail: steffen@quievreux.de
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">Umsatzsteuer-ID</h2>
                <p>
                    Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                    [USt-ID]
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">Redaktionell verantwortlich</h2>
                <p>Steffen Quievreux</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-white">EU-Streitschlichtung</h2>
                <p>
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                    <a href="https://ec.europa.eu/consumers/odr/" className="text-violet-400 hover:underline"> https://ec.europa.eu/consumers/odr/</a>.
                </p>
            </section>
        </div>
    );
}
