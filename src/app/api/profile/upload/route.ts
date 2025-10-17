import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, data } = body;
    if (!filename || !data) {
      return NextResponse.json({ error: 'Missing filename or data' }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Data is expected as data URL: data:image/png;base64,AAAA...
    const match = data.match(/^data:(image\/(png|jpeg|jpg|gif));base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });
    }

    const ext = match[2] === 'jpeg' ? 'jpg' : match[2];
    const base64 = match[3];

    // Create unique filename
    const safeName = filename.replace(/[^a-z0-9.-_]/gi, '_').toLowerCase();
    const uniqueName = `${Date.now()}_${safeName}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image', details: error.message }, { status: 500 });
  }
}
