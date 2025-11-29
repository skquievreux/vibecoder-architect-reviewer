import { NextResponse } from 'next/server';

const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN?.replace(/^Bearer\s+/i, '');
const BASE_URL = 'https://api.cloudflare.com/client/v4';

export async function GET(request: Request) {
    if (!CLOUDFLARE_API_TOKEN) {
        return NextResponse.json({ error: 'CLOUDFLARE_API_TOKEN not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const zoneId = searchParams.get('zone_id');
    const target = searchParams.get('target');

    try {
        if (target) {
            // Reverse Lookup: Find CNAME records pointing to 'target'
            // 1. Fetch all zones
            const zonesRes = await fetch(`${BASE_URL}/zones`, {
                headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
            });
            const zonesData = await zonesRes.json();
            if (!zonesData.success) throw new Error('Failed to fetch zones');

            const zones = zonesData.result;
            const matches: any[] = [];

            // 2. Search each zone for CNAME records matching the target
            // Note: This might be slow if there are many zones. Cloudflare API doesn't support global search across zones easily.
            // Optimization: We could parallelize this.
            const searchPromises = zones.map(async (zone: any) => {
                const recordsRes = await fetch(`${BASE_URL}/zones/${zone.id}/dns_records?type=CNAME&content=${target}&match=all`, {
                    headers: { 'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
                });
                const recordsData = await recordsRes.json();
                if (recordsData.success && recordsData.result.length > 0) {
                    matches.push(...recordsData.result);
                }
            });

            await Promise.all(searchPromises);
            return NextResponse.json(matches);
        } else if (zoneId) {
            // Fetch DNS Records for a Zone
            const res = await fetch(`${BASE_URL}/zones/${zoneId}/dns_records`, {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (!data.success) {
                if (res.status === 403) {
                    throw new Error('Access Denied: Token lacks DNS:Read permission');
                }
                throw new Error(data.errors[0]?.message || 'Failed to fetch records');
            }
            return NextResponse.json(data.result);
        } else {
            // Fetch Zones
            const res = await fetch(`${BASE_URL}/zones`, {
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.errors[0]?.message || 'Failed to fetch zones');
            return NextResponse.json(data.result);
        }
    } catch (error: any) {
        console.error('Cloudflare API Error:', error);
        return NextResponse.json({ error: error.message }, { status: error.message.includes('Access Denied') ? 403 : 500 });
    }
}
