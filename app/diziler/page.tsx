'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import SeriesCard from '@/components/SeriesCard';

interface Series {
  _id: string;
  title: string;
  year: string;
  description: string;
  image: string;
  videoUrl?: string;
  rating: number;
  director: string;
  cast: string[];
  genre: string[];
  numberOfSeasons: number;
  episodes: { title: string; videoUrl?: string }[];
  status: string;
  addedDate: string;
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch('/api/series');
        if (!response.ok) throw new Error('Diziler yüklenirken bir hata oluştu');
        const data = await response.json();
        setSeries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Diziler</h1>
          <p className="text-white/60">Toplam {series.length} dizi bulundu</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Render SeriesCard for each series */}
          {series.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <SeriesCard series={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 