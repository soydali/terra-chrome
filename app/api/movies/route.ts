import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = status ? { status } : {};
    const movies = await Movie.find(query).sort({ createdAt: -1 });
    return NextResponse.json(movies);
  } catch (error) {
    return NextResponse.json({ error: 'Filmler yüklenirken bir hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const movie = await Movie.create({
      title: body.title,
      year: body.year,
      description: body.description,
      image: body.image,
      videoUrl: body.videoUrl || '',
      rating: body.rating,
      director: body.director,
      cast: body.cast,
      duration: body.duration,
      genre: body.genre,
      status: body.status || 'Beklemede'
    });

    return NextResponse.json(movie);
  } catch (error) {
    return NextResponse.json({ error: 'Film eklenirken bir hata oluştu' }, { status: 500 });
  }
} 