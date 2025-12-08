import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const res = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; VibeCoderBot/1.0; +http://vibecoder.dev)'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch URL: ${res.status}`);
        }

        const html = await res.text();

        // Simple regex to extract OG tags
        const getMetaTag = (property: string) => {
            const regex = new RegExp(`<meta property="${property}" content="([^"]+)"`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        // Also try name attribute if propery not found
        const getMetaName = (name: string) => {
            const regex = new RegExp(`<meta name="${name}" content="([^"]+)"`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };


        const image = getMetaTag('og:image') || getMetaTag('twitter:image');
        const title = getMetaTag('og:title') || getMetaName('title') || (html.match(/<title>([^<]+)<\/title>/i)?.[1]);
        const description = getMetaTag('og:description') || getMetaName('description');

        // Resolve relative URLs for image
        let absoluteImage = image;
        if (image && !image.startsWith('http')) {
            absoluteImage = new URL(image, targetUrl).toString();
        }

        return NextResponse.json({
            url: targetUrl,
            image: absoluteImage,
            title,
            description
        });

    } catch (error: any) {
        console.error('Preview Error:', error);
        return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
    }
}
