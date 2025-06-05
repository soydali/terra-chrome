'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from "@heroui/card";
import LoadingSpinner from '@/components/LoadingSpinner';

interface Movie {
  _id: string;
  title: string;
  year: string;
  description: string;
  image: string;
  rating: number;
  director: string;
  cast: string[];
  duration: string;
  genre: string[];
  status: string;
  videoUrl?: string;
}

export default function WatchPage() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`/api/movies/${params.id}`);
        if (!response.ok) {
          throw new Error('Film bulunamadı');
        }
        const data = await response.json();
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [params.id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/90 text-center">
          <h2 className="text-2xl font-semibold mb-2">Hata</h2>
          <p className="text-white/60">{error || 'Film bulunamadı'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Video Player */}
        <div className="aspect-video w-full bg-black mb-8 rounded-lg overflow-hidden">
          {movie.videoUrl ? (
            <video
              src={movie.videoUrl}
              controls
              className="w-full h-full"
              autoPlay
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <p className="text-white/60">Video henüz yüklenmedi</p>
            </div>
          )}
        </div>

        {/* Movie Details Card */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white/90 mb-2">
                  {movie.title}
                </h1>
                <div className="flex items-center gap-4 text-white/60">
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span>{movie.duration}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genre.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm bg-white/5 text-white/90 rounded-full border border-white/10"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-white/90 font-semibold mb-2">Yönetmen</h3>
                <p className="text-white/60">{movie.director}</p>
              </div>

              <div>
                <h3 className="text-white/90 font-semibold mb-2">Oyuncular</h3>
                <p className="text-white/60">{movie.cast.join(', ')}</p>
              </div>

              <div>
                <h3 className="text-white/90 font-semibold mb-2">Açıklama</h3>
                <p className="text-white/60 leading-relaxed">{movie.description}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 