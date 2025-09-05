import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Читаем файл currencies.json из public папки
    const filePath = path.join(process.cwd(), 'public', 'currencies.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const currencies = JSON.parse(fileContents);

    return NextResponse.json(currencies, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Кешируем на 24 часа
      },
    });
  } catch (error) {
    console.error('Error reading currencies.json:', error);

    return NextResponse.json({ error: 'Failed to load currencies' }, { status: 500 });
  }
}
