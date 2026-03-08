import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { imageData } = await request.json();

        // Strip the data URL prefix to get raw base64
        const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment; filename="isaireplacing.me.png"',
                'Content-Length': buffer.length.toString(),
            },
        });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
}
