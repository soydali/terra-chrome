import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Series from '@/models/Series';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const series = await Series.find(query).sort({ createdAt: -1 });
    return NextResponse.json(series);
  } catch (error) {
    return NextResponse.json({ error: 'Diziler yüklenirken bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const newSeries = await Series.create(body);
    return NextResponse.json(newSeries, { status: 201 });
  } catch (error) {
    console.error('Error adding series:', error);
    return NextResponse.json({ error: 'Dizi eklenirken bir hata oluştu' }, { status: 500 });
  }
} 