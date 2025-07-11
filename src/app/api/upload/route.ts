import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const media = formData.get('media') as File;
  const type = formData.get('type') as string;
  const details = formData.get('details') as string;
  const bullyType = formData.get('bullyType') as string;
  const dateTime = formData.get('dateTime') as string;
  const location = formData.get('location') as string;
  const anonymous = formData.get('anonymous') === 'true';
  const name = formData.get('name') as string;

  // Validate required fields
  if (!media || !type || !details || !bullyType || !dateTime || !location) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Generate consistent timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Determine file extension
  const extension =
    type === 'audio' || type === 'video'
      ? '.webm'
      : type === 'picture'
      ? '.png'
      : '';

  const buffer = Buffer.from(await media.arrayBuffer());

  // Create folder name (either timestamp or name)
  const folderName = anonymous
    ? timestamp
    : name.trim().replace(/\s+/g, '_');

  const baseDir = path.join(process.cwd(), 'uploads', folderName);
  await mkdir(baseDir, { recursive: true });

  // File paths
  const mediaFilename = `media${extension}`;
  const mediaPath = path.join(baseDir, mediaFilename);
  const jsonPath = path.join(baseDir, 'report.json');

  // Save media file
  await writeFile(mediaPath, buffer);

  // Save JSON metadata
  const metadata = {
    details,
    bullyType,
    dateTime,
    location,
    anonymous,
    name: anonymous ? undefined : name,
    mediaType: type,
    mediaFilename,
  };

  await writeFile(jsonPath, JSON.stringify(metadata, null, 2));

  return NextResponse.json({ success: true });
}
