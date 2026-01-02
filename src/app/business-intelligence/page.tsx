'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Metric, Flex, Grid, Badge, ProgressBar } from '@tremor/react';
import {
    DollarSign,
    Users,
    Megaphone,
    BarChart3
} from 'lucide-react';

interface Overview {
    product: string;
    targetARR: string;
    currentMRR: string;
    q1Budget: string;
    status: string;
}

interface Persona {
    name: string;
    title: string;
    ltv: string;
    willingnessToPay: string;
    priority: 'primary' | 'secondary' | 'tertiary';
}

interface Campaign {
    name: string;
    type: string;
    budget: string;
    status: 'planned' | 'active' | 'completed';
    goal: string;
}

export default function BusinessIntelligencePage() {
    const [overview, setOverview] = useState<Overview | null>(null);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [overviewRes, personasRes, campaignsRes] = await Promise.all([
                    fetch('/api/business-intelligence/overview'),
                    fetch('/api/business-intelligence/personas'),
                    fetch('/api/business-intelligence/campaigns')
                ]);

                if (overviewRes.ok) {
                    const overviewData = await overviewRes.json();
                    setOverview(overviewData);
                }

                if (personasRes.ok) {
                    const personasData = await personasRes.json();
                    setPersonas(personasData.personas || []);
                }

                if (campaignsRes.ok) {
                    const campaignsData = await campaignsRes.json();
                    setCampaigns(campaignsData.campaigns || []);
                }

            } catch (error) {
                console.error('Failed to fetch business intelligence data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-screen">
                <Text>Loading business intelligence dashboard...</Text>
            </div>
        );
    }

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    // Hardcoded total budget for MVP visualization based on Q1 budget in overview
    const totalQ1Budget = 17700;

    return (
        <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Header */}
            <div>
                <Title className="text-3xl font-bold">Business Intelligence</Title>
                <Text className="mt-2 text-slate-500">Marketing strategy, customer personas, and campaign performance</Text>
            </div>

            {/* Marketing Overview */}
            <Grid numItemsMd={2} numItemsLg={4} className="gap-6">
                <Card decoration="top" decorationColor="violet">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-2 bg-violet-100 rounded-lg dark:bg-violet-900/30">
                            <DollarSign className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <Text>Target ARR (Year 1)</Text>
                            <Metric>{overview?.targetARR || '-'}</Metric>
                        </div>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="blue">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <Text>Current MRR</Text>
                            <Metric>{overview?.currentMRR || '-'}</Metric>
                            <Text className="text-xs text-gray-500">Starting phase</Text>
                        </div>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="amber">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-2 bg-amber-100 rounded-lg dark:bg-amber-900/30">
                            <Megaphone className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <Text>Q1 2025 Budget</Text>
                            <Metric>{overview?.q1Budget || '-'}</Metric>
                        </div>
                    </Flex>
                </Card>

                <Card decoration="top" decorationColor="emerald">
                    <Flex justifyContent="start" className="space-x-4">
                        <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-900/30">
                            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <Text>Customer Personas</Text>
                            <Metric>{personas.length}</Metric>
                            <Text className="text-xs text-gray-500">Defined segments</Text>
                        </div>
                    </Flex>
                </Card>
            </Grid>

            {/* Customer Personas */}
            <div>
                <Title className="mb-4">Customer Personas</Title>
                <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
                    {personas.map((persona) => (
                        <Card key={persona.name} decoration="left" decorationColor={
                            persona.priority === 'primary' ? 'violet' :
                                persona.priority === 'secondary' ? 'blue' : 'gray'
                        } className="flex flex-col h-full">
                            <div className="flex-1">
                                <Text className="font-bold text-lg text-slate-900 dark:text-slate-100">{persona.name}</Text>
                                <Text className="text-sm text-gray-500 mb-4">{persona.title}</Text>

                                <div className="space-y-3 mt-4">
                                    <Flex justifyContent="between">
                                        <Text className="text-xs font-medium">LTV</Text>
                                        <Text className="font-bold text-slate-700 dark:text-slate-300">{persona.ltv}</Text>
                                    </Flex>
                                    <Flex justifyContent="between">
                                        <Text className="text-xs font-medium">WTP</Text>
                                        <Text className="font-bold text-xs text-slate-700 dark:text-slate-300">{persona.willingnessToPay}</Text>
                                    </Flex>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Badge
                                    color={persona.priority === 'primary' ? 'violet' : 'blue'}
                                >
                                    {persona.priority.charAt(0).toUpperCase() + persona.priority.slice(1)} Target
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </Grid>
            </div>

            {/* Active Campaigns */}
            <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
                <Card>
                    <Title className="mb-4">Marketing Campaigns</Title>
                    <div className="space-y-4">
                        {campaigns.map((campaign) => (
                            <div key={campaign.name} className="p-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                                <Flex alignItems="start">
                                    <div className="flex-1">
                                        <Flex justifyContent="start" alignItems="center" className="space-x-2 mb-1">
                                            <Text className="font-semibold text-slate-900 dark:text-slate-100">{campaign.name}</Text>
                                            <Badge size="xs" color={
                                                campaign.status === 'active' ? 'emerald' :
                                                    campaign.status === 'completed' ? 'blue' : 'gray'
                                            }>
                                                {campaign.status}
                                            </Badge>
                                        </Flex>
                                        <Text className="text-xs text-gray-500">{campaign.type}</Text>
                                        <Text className="text-xs mt-2 italic text-slate-600 dark:text-slate-400">Target: {campaign.goal}</Text>
                                    </div>
                                    <div className="text-right pl-4">
                                        <Text className="font-bold text-slate-700 dark:text-slate-300">{campaign.budget}</Text>
                                    </div>
                                </Flex>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Flex justifyContent="between" className="mb-2">
                            <Text className="font-medium">Total Q1 Budget Allocation</Text>
                            <Text className="font-bold">${totalQ1Budget.toLocaleString()}</Text>
                        </Flex>
                        <ProgressBar value={100} color="violet" className="mt-2" />
                        <Text className="text-xs text-gray-500 mt-2 text-center">
                            Allocated across {campaigns.length} campaigns
                        </Text>
                    </div>
                </Card>

                {/* Link to Hub */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none h-full flex flex-col justify-center">
                        <div className="mb-4">
                            <Title className="text-white text-2xl">Business Intelligence Hub</Title>
                            <Text className="text-violet-100 mt-2">
                                Access detailed documentation, visual strategy boards, and cross-repository insights in our centralized Obsidian vault.
                            </Text>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-violet-100 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                <span>Centralized Knowledge Base</span>
                            </div>
                            <div className="flex items-center space-x-2 text-violet-100 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                <span>Metric Aggregation</span>
                            </div>
                            <div className="flex items-center space-x-2 text-violet-100 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                <span>Campaign Planning</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <a
                                href="https://github.com/skquievreux/business-intelligence-hub"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-white text-violet-700 rounded-lg hover:bg-violet-50 transition-colors font-semibold w-full sm:w-auto"
                            >
                                Access Hub Dashboard →
                            </a>
                        </div>
                    </Card>
                </div>
            </Grid>
        </div>
    );
}
