import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    const start = Date.now();
    try {
        const response = await fetch(targetUrl, {
            method: 'HEAD', // Try HEAD first for speed
            headers: { 'User-Agent': 'ArchitectureReviewDashboard/1.0' },
            signal: AbortSignal.timeout(5000) // 5s timeout
        });

        // If HEAD fails (some servers block it), try GET
        if (response.status === 405 || response.status === 403) {
            const getResponse = await fetch(targetUrl, {
                method: 'GET',
                headers: { 'User-Agent': 'ArchitectureReviewDashboard/1.0' },
                signal: AbortSignal.timeout(5000)
            });
            const latency = Date.now() - start;
            return NextResponse.json({
                status: getResponse.status,
                reachable: getResponse.ok,
                latency
            });
        }

        const latency = Date.now() - start;
        return NextResponse.json({
            status: response.status,
            reachable: response.ok,
            latency
        });

    } catch (error: any) {
        const latency = Date.now() - start;
        return NextResponse.json({
            status: 0,
            reachable: false,
            latency,
            error: error.message
        });
    }
}
