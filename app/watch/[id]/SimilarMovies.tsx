'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from '@/components/LoadingSpinner';

interface Movie {
  _id: string;
  title: string;
  year: string;
  image: string;
}

interface SimilarMoviesProps {
  currentMovieId: string;
}

export function SimilarMovies({ currentMovieId }: SimilarMoviesProps) {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      try {
        const response = await fetch('/api/movies?status=Aktif');
        if (!response.ok) throw new Error('Filmler yüklenirken bir hata oluştu');
        const data = await response.json();
        // Mevcut filmi hariç tut ve ilk 3 filmi al
        const similarMovies = data
          .filter((movie: Movie) => movie._id !== currentMovieId)
          .slice(0, 3);
        setMovies(similarMovies);
      } catch (err) {
        console.error('Benzer filmler yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [currentMovieId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      {movies.map((movie) => (
        <div
          key={movie._id}
          className="flex items-center space-x-4 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
          onClick={() => router.push(`/watch/${movie._id}`)}
        >
          <img
            src={movie.image}
            alt={movie.title}
            className="w-20 h-30 object-cover rounded"
          />
          <div>
            <h3 className="text-white font-medium">{movie.title}</h3>
            <p className="text-gray-400 text-sm">{movie.year}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 