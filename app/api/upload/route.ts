import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image } = data;

    if (!image || !image.startsWith('data:image')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Extract the base64 string from the data URL
    // Format: "data:image/webp;base64,UklGRlztAABXRUJQV..."
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid base64 format' }, { status: 400 });
    }

    const type = matches[1];
    const base64Data = matches[2];
    
    // Determine extension from type (e.g., image/webp -> webp, image/jpeg -> jpeg)
    let ext = 'webp'; // Default since client compresses to webp
    if (type.includes('jpeg') || type.includes('jpg')) ext = 'jpg';
    else if (type.includes('png')) ext = 'png';
    else if (type.includes('webp')) ext = 'webp';

    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    
    // Write file to disk
    fs.writeFileSync(filepath, buffer);
    
    // Return the public URL path
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
