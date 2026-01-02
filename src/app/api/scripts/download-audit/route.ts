import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'ecosystem-audit.csv');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'Audit file not found. Run the audit script first.' }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=ecosystem-audit.csv',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
}
