import { Shield, Lock, Eye, Server, FileCheck } from "lucide-react";
import { Icon } from "@squievreux/ui";

export default function DatenschutzPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-24">

                {/* Header */}
                <div className="mb-16 border-b border-slate-800 pb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                            <Icon icon={Lock} className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Datenschutzerklärung</h1>
                    </div>
                    <p className="text-xl text-slate-400">
                        Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                    </p>
                </div>

                <div className="space-y-12">

                    {/* Intro */}
                    <section className="prose prose-invert max-w-none">
                        <p className="text-lg leading-relaxed text-slate-300">
                            Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck der Verarbeitung von personenbezogenen Daten
                            (nachfolgend kurz „Daten“) im Rahmen unseres Onlineangebotes auf.
                        </p>
                    </section>

                    {/* Grid for Key Points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-violet-500/30 transition-colors">
                            <Icon icon={Shield} className="w-8 h-8 text-violet-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Verantwortlicher</h3>
                            <p className="text-sm text-slate-400">
                                Steffen Quievreux<br />
                                Quievreux Consulting<br />
                                steffen@quievreux.de
                            </p>
                        </div>

                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-violet-500/30 transition-colors">
                            <Icon icon={Server} className="w-8 h-8 text-violet-400 mb-4" />
                            <h3 className="text-lg font-bold text-white mb-2">Hosting</h3>
                            <p className="text-sm text-slate-400">
                                Diese Website wird bei <strong>Vercel Inc.</strong> gehostet.<br />
                                Serverstandort: EU / USA
                            </p>
                        </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-slate-800 text-violet-400 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
                                Datenerfassung auf unserer Website
                            </h2>
                            <div className="pl-11 space-y-4 text-slate-400">
                                <p>
                                    <strong>Cookies:</strong> Wir verwenden Cookies, um die Benutzerfreundlichkeit zu erhöhen.
                                    Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden.
                                </p>
                                <p>
                                    <strong>Server-Log-Dateien:</strong> Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien,
                                    die Ihr Browser automatisch an uns übermittelt (Browsertyp, Betriebssystem, Referrer URL, etc.).
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-slate-800 text-violet-400 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
                                Analyse-Tools und Tools von Drittanbietern
                            </h2>
                            <div className="pl-11 space-y-4 text-slate-400">
                                <p>
                                    Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden.
                                    Das geschieht vor allem mit Cookies und mit sogenannten Analyseprogrammen.
                                    Die Analyse Ihres Surf-Verhaltens erfolgt in der Regel anonym.
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <span className="bg-slate-800 text-violet-400 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
                                Ihre Rechte
                            </h2>
                            <div className="pl-11 space-y-4 text-slate-400">
                                <p>
                                    Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten.
                                    Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                        <p className="text-slate-500 text-sm">
                            Stand: Februar 2026 | Erstellt mit VibeCoder Compliance
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
