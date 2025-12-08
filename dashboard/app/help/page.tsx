"use client";

import { Title, Text, Card, Tab, TabList, TabGroup, TabPanels, TabPanel, Badge } from "@tremor/react";
import { LayoutDashboard, Layers, Sparkles, Cloud, Settings, BookOpen, HelpCircle, Activity, Database, Code, Globe, CheckCircle, AlertTriangle } from "lucide-react";

export default function HelpPage() {
    return (
        <main className="p-10 bg-slate-950 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-full bg-violet-500/10 text-violet-400">
                        <HelpCircle size={32} />
                    </div>
                    <div>
                        <Title className="text-3xl font-bold text-white">System Documentation</Title>
                        <Text className="text-slate-400">Comprehensive guide to VibeCoder Architect Reviewer functions.</Text>
                    </div>
                </div>

                <TabGroup>
                    <TabList>
                        <Tab icon={LayoutDashboard}>Dashboard</Tab>
                        <Tab icon={Layers}>Portfolio</Tab>
                        <Tab icon={Sparkles}>Architecture</Tab>
                        <Tab icon={Cloud}>Operations</Tab>
                        <Tab icon={Settings}>Settings</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="mt-6 space-y-6">
                                <Card className="glass-card">
                                    <Title className="text-white mb-4">Dashboard Overview</Title>
                                    <Text className="text-slate-300 mb-4">
                                        The Dashboard is your central command center, providing a real-time pulse of your software ecosystem.
                                    </Text>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded bg-slate-900/50 border border-slate-800">
                                            <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2"><Activity size={16} className="text-emerald-400" /> Key Metrics</h3>
                                            <ul className="text-sm text-slate-400 space-y-2">
                                                <li><strong>Total Repositories:</strong> Count of all tracked projects.</li>
                                                <li><strong>Active Services:</strong> Number of deployments currently live.</li>
                                                <li><strong>Cost Estimate:</strong> Approximate monthly infrastructure cost.</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 rounded bg-slate-900/50 border border-slate-800">
                                            <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-400" /> Health Status</h3>
                                            <ul className="text-sm text-slate-400 space-y-2">
                                                <li><strong>Healthy:</strong> All systems operational.</li>
                                                <li><strong>Warning:</strong> Minor issues (e.g., outdated dependencies).</li>
                                                <li><strong>Critical:</strong> Major failures (e.g., build errors, security risks).</li>
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6 space-y-6">
                                <Card className="glass-card">
                                    <Title className="text-white mb-4">Portfolio Management</Title>
                                    <Text className="text-slate-300 mb-6">
                                        Deep dive into your project landscape to optimize strategy and costs.
                                    </Text>

                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-lg font-bold text-violet-400 mb-3">Strategic Insights</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm mb-3">
                                                    The system automatically analyzes your repositories to generate business intelligence:
                                                </p>
                                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                                    <li><strong>Revenue Opportunities:</strong> Identifies projects with high monetization potential (e.g., SaaS, APIs) and estimates ARR.</li>
                                                    <li><strong>Consolidation Clusters:</strong> Groups similar projects (e.g., multiple "Todo Apps" or "Chatbots") to suggest merging them for cost savings.</li>
                                                </ul>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold text-blue-400 mb-3">Business Canvas Editor</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm mb-3">
                                                    Each repository has an associated Business Canvas. You can edit this to refine the strategy.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <strong className="text-slate-200">Value Proposition:</strong>
                                                        <p className="text-slate-500">What problem does this solve?</p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-200">Customer Segments:</strong>
                                                        <p className="text-slate-500">Who is this for?</p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-200">Revenue Streams:</strong>
                                                        <p className="text-slate-500">How does it make money?</p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-200">Cost Structure:</strong>
                                                        <p className="text-slate-500">What are the major expenses?</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold text-rose-400 mb-3">Interconnection Graph</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm mb-3">
                                                    Interactive visualization of your system architecture.
                                                </p>
                                                <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                                                    <li><strong>Navigation:</strong> Drag to pan, scroll to zoom.</li>
                                                    <li><strong>Interaction:</strong> Click a node to highlight its direct dependencies and dependents.</li>
                                                    <li><strong>Filters:</strong> Use the toolbar to filter by category (AI, Web, etc.) or toggle Service nodes.</li>
                                                </ul>
                                            </div>
                                        </section>
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6 space-y-6">
                                <Card className="glass-card">
                                    <Title className="text-white mb-4">Architecture Advisor</Title>
                                    <Text className="text-slate-300 mb-6">
                                        Manage architectural decisions and get AI-powered advice.
                                    </Text>

                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-lg font-bold text-violet-400 mb-3">Architectural Decision Records (ADRs)</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm mb-3">
                                                    Document key design choices to ensure long-term maintainability.
                                                </p>
                                                <div className="flex gap-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Badge size="xs" color="amber">PROPOSED</Badge>
                                                        <span className="text-slate-500">Under discussion</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge size="xs" color="emerald">ACCEPTED</Badge>
                                                        <span className="text-slate-500">Approved & Active</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge size="xs" color="orange">DEPRECATED</Badge>
                                                        <span className="text-slate-500">No longer valid</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold text-violet-400 mb-3">AI Advisor Chat</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm">
                                                    Ask questions like <em>"How can I reduce latency in the API?"</em> or <em>"Suggest a tech stack for a new video app"</em>. The AI analyzes your existing portfolio to give context-aware answers.
                                                </p>
                                            </div>
                                        </section>
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6 space-y-6">
                                <Card className="glass-card">
                                    <Title className="text-white mb-4">Operations & Monitoring</Title>
                                    <Text className="text-slate-300 mb-6">
                                        Monitor the health and compliance of your infrastructure.
                                    </Text>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded bg-slate-900/50 border border-slate-800">
                                            <h3 className="font-bold text-slate-200 mb-2">Service Catalog</h3>
                                            <p className="text-sm text-slate-400">
                                                A registry of all external APIs and services (e.g., Supabase, OpenAI, Vercel) used across your projects. Helps track dependencies and costs.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded bg-slate-900/50 border border-slate-800">
                                            <h3 className="font-bold text-slate-200 mb-2">System Logs</h3>
                                            <p className="text-sm text-slate-400">
                                                Centralized view of application logs. Use this to troubleshoot errors or verify that background jobs (like data syncs) are running correctly.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="mt-6 space-y-6">
                                <Card className="glass-card">
                                    <Title className="text-white mb-4">Settings & Maintenance</Title>
                                    <Text className="text-slate-300 mb-6">
                                        Tools to standardize and maintain the codebase.
                                    </Text>

                                    <div className="space-y-6">
                                        <section>
                                            <h3 className="text-lg font-bold text-violet-400 mb-3">Standardization Scripts</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={16} className="text-cyan-400" />
                                                        <strong className="text-slate-200">Upgrade Tailwind</strong>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Migrates projects to <strong>Tailwind CSS v4.0</strong>, updating configuration and style tokens.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Code size={16} className="text-violet-400" />
                                                        <strong className="text-slate-200">Fix TypeScript</strong>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Enforces TypeScript version <strong>5.8.2</strong> across all repositories to ensure compatibility.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Database size={16} className="text-emerald-400" />
                                                        <strong className="text-slate-200">Fix Supabase</strong>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Updates Supabase client to version <strong>2.49.4</strong> for latest features and security fixes.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={16} className="text-blue-400" />
                                                        <strong className="text-slate-200">Upgrade React</strong>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Systematically upgrades projects to React <strong>19.2</strong>, starting with "Tier 2" (safe) repositories.
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Globe size={16} className="text-violet-400" />
                                                        <strong className="text-slate-200">Sync Domains</strong>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Fetches live deployment URLs from Vercel/Fly.io and updates the database.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-lg font-bold text-slate-200 mb-3">Ecosystem Audit</h3>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                <p className="text-slate-300 text-sm mb-2">
                                                    The <strong>"View Live Status"</strong> button generates a real-time report of all repositories, checking for:
                                                </p>
                                                <ul className="list-disc list-inside text-sm text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <li>Node.js Version Compliance</li>
                                                    <li>TypeScript Version Compliance</li>
                                                    <li>Build Status (Pass/Fail)</li>
                                                    <li>Documentation Presence (README/Changelog)</li>
                                                </ul>
                                            </div>
                                        </section>
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>

                <div className="mt-12 pt-8 border-t border-slate-800">
                    <Title className="text-white mb-4">Documentation Workflow</Title>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <div className="flex items-start gap-4">
                            <BookOpen className="text-slate-500 mt-1" />
                            <div>
                                <h3 className="text-slate-200 font-bold">Keeping Documentation Up-to-Date</h3>
                                <p className="text-slate-400 text-sm mt-2">
                                    When a new feature is released or a version is bumped, this documentation page is updated to reflect the changes.
                                    Check the <strong>Version Display</strong> in the bottom right corner to see the current build info.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
