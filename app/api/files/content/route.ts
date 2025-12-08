import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file || file !== 'ecosystem-audit.csv') {
        return NextResponse.json({ error: 'Invalid or missing file parameter' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
    }
}
