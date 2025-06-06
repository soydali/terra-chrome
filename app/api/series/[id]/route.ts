import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Series from '@/models/Series';

// GET
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const series = await Series.findById(id);

    if (!series) {
      return NextResponse.json({ error: 'Dizi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ error: 'Diziler yüklenirken bir hata oluştu' }, { status: 500 });
  }
}

// PUT
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    const updatedSeries = await Series.findByIdAndUpdate(id, body, { new: true });

    if (!updatedSeries) {
      return NextResponse.json({ error: 'Dizi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(updatedSeries);
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json({ error: 'Dizi güncellenirken bir hata oluştu' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await context.params;

    const deletedSeries = await Series.findByIdAndDelete(id);

    if (!deletedSeries) {
      return NextResponse.json({ error: 'Dizi bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Dizi başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json({ error: 'Dizi silinirken bir hata oluştu' }, { status: 500 });
  }
}
