import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import mime from 'mime';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path from the URL params
    const filePathParam = params.path.join('/');
    
    // Determine the upload directory
    // Priority: Env Var -> Standalone Public Path -> Dev Public Path
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    
    // Validate path to prevent directory traversal
    const fullPath = path.resolve(uploadDir, filePathParam);
    
    // Ensure the resolved path is within the upload directory
    if (!fullPath.startsWith(path.resolve(uploadDir))) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type
    const contentType = mime.getType(fullPath) || 'application/octet-stream';

    // Return the file as a response
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
