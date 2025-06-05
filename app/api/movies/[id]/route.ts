import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await dbConnect();
    const movie = await Movie.findById(id);
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Film getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await dbConnect();
    const body = await request.json();
    
    console.log('Güncellenecek film ID:', id);
    console.log('Gelen veri:', body);

    // Validate required fields
    if (!body.title || !body.year || !body.description || !body.image || 
        !body.director || !body.duration || !body.cast?.length || !body.genre?.length) {
      console.log('Eksik alanlar:', {
        title: !body.title,
        year: !body.year,
        description: !body.description,
        image: !body.image,
        director: !body.director,
        duration: !body.duration,
        cast: !body.cast?.length,
        genre: !body.genre?.length
      });
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating === undefined || body.rating < 0 || body.rating > 10) {
      return NextResponse.json(
        { error: 'Puan 0-10 arasında olmalıdır' },
        { status: 400 }
      );
    }

    const updateData = {
      title: body.title,
      year: body.year,
      description: body.description,
      image: body.image,
      videoUrl: body.videoUrl || '',
      rating: Number(body.rating),
      director: body.director,
      cast: body.cast,
      duration: body.duration,
      genre: body.genre,
      status: body.status || 'Beklemede'
    };

    console.log('Güncellenecek veri:', updateData);

    const movie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    );

    if (!movie) {
      console.log('Film bulunamadı:', id);
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Güncellenen film:', movie);
    return NextResponse.json(movie);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { 
        error: 'Film güncellenirken bir hata oluştu', 
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await dbConnect();
    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return NextResponse.json(
        { error: 'Film bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Film başarıyla silindi' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Film silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 