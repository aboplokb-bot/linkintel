// ============================================================
// LINKINTEL — /api/export route
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { exportAsTXT, exportAsMarkdown, exportAsSRT } from '@/app/lib/exportFormatter';
import { ExportRequest } from '@/app/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ExportRequest;
    const { format, data } = body;

    if (!format || !data) {
      return NextResponse.json({ success: false, error: 'format and data are required.' }, { status: 400 });
    }

    let content: string;
    let contentType: string;
    let extension: string;
    const filename = data.metadata.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);

    switch (format) {
      case 'txt':
        content = exportAsTXT(data);
        contentType = 'text/plain';
        extension = 'txt';
        break;
      case 'md':
        content = exportAsMarkdown(data);
        contentType = 'text/markdown';
        extension = 'md';
        break;
      case 'srt':
        content = exportAsSRT(data);
        contentType = 'text/srt';
        extension = 'srt';
        break;
      default:
        return NextResponse.json({ success: false, error: 'Invalid format. Use txt, md, or srt.' }, { status: 400 });
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Export failed.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
