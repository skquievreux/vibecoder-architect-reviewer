import { Shield, Mail, MapPin, Phone, FileText, Scale } from "lucide-react";
import { Icon } from "@squievreux/ui";

export default function ImpressumPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-300">
            <div className="max-w-4xl mx-auto px-6 py-24">

                {/* Header */}
                <div className="mb-16 border-b border-slate-800 pb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                            <Icon icon={Scale} className="w-8 h-8 text-violet-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Impressum</h1>
                    </div>
                    <p className="text-xl text-slate-400">
                        Angaben gemäß § 5 TMG
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Company Details */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <Icon icon={Shield} className="w-5 h-5 mr-3 text-violet-400" />
                            Verantwortlich
                        </h2>
                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                            <p className="font-medium text-white text-lg">Quievreux Consulting</p>
                            <p>Steffen Quievreux</p>
                            <div className="flex items-start space-x-3 text-slate-400">
                                <Icon icon={MapPin} className="w-5 h-5 mt-0.5 shrink-0" />
                                <span>
                                    Musterstraße 123<br />
                                    12345 Musterstadt<br />
                                    Deutschland
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="space-y-6">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <Icon icon={Mail} className="w-5 h-5 mr-3 text-violet-400" />
                            Kontakt
                        </h2>
                        <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
                            <div className="flex items-center space-x-3">
                                <Icon icon={Phone} className="w-5 h-5 text-slate-500" />
                                <span>+49 (0) 123 456789</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Icon icon={Mail} className="w-5 h-5 text-slate-500" />
                                <a href="mailto:steffen@quievreux.de" className="text-violet-400 hover:text-violet-300 transition-colors">
                                    steffen@quievreux.de
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Legal IDs */}
                    <section className="space-y-6 md:col-span-2">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <Icon icon={FileText} className="w-5 h-5 mr-3 text-violet-400" />
                            Registereintrag & Umsatzsteuer
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Umsatzsteuer-ID</h3>
                                <p className="text-white font-mono">DE 123 456 789</p>
                                <p className="text-xs text-slate-500 mt-2">Gemäß § 27 a Umsatzsteuergesetz</p>
                            </div>
                            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                                <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Redaktionell Verantwortlich</h3>
                                <p className="text-white">Steffen Quievreux</p>
                                <p className="text-xs text-slate-500 mt-2">Gemäß § 55 Abs. 2 RStV</p>
                            </div>
                        </div>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="space-y-6 md:col-span-2 pt-8 border-t border-slate-800">
                        <h2 className="text-lg font-semibold text-white">EU-Streitschlichtung</h2>
                        <p className="text-slate-400 leading-relaxed">
                            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                                https://ec.europa.eu/consumers/odr/
                            </a>.<br />
                            Unsere E-Mail-Adresse finden Sie oben im Impressum.
                        </p>
                        <p className="text-slate-500 text-sm">
                            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </section>

                </div>
            </div>
        </div>
    );
}
