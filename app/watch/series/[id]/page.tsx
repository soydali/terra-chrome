'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card } from '@heroui/card';

interface EpisodeUI {
  title: string;
  videoUrl?: string;
}

interface SeasonUI {
  seasonNumber: number;
  episodes: EpisodeUI[];
}

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
  episodes: EpisodeUI[]; // Keep original for backend, but we'll process for UI
  status: string;
  addedDate: string;
}

// Extended Series interface for UI state to include nested seasons
interface SeriesUI extends Omit<Series, 'episodes' | 'numberOfSeasons'> {
  seasons: SeasonUI[];
  numberOfSeasons: number;
}

export default function WatchSeriesPage() {
  const { id } = useParams();
  const [series, setSeries] = useState<SeriesUI | null>(null); // Use SeriesUI for state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<EpisodeUI | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1); // New state for selected season

  useEffect(() => {
    async function fetchSeries() {
      try {
        setLoading(true);
        const response = await fetch(`/api/series/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch series');
        }
        const data: Series = await response.json();

        // Process flat episodes into nested seasons for UI
        const seasonsMap = new Map<number, EpisodeUI[]>();
        data.episodes.forEach(episode => {
          const match = episode.title.match(/Sezon (\d+):\s*(.*)/);
          const seasonNumber = match ? parseInt(match[1]) : 1; // Default to season 1
          const episodeTitle = match ? match[2] : episode.title; // Extract title without season prefix

          if (!seasonsMap.has(seasonNumber)) {
            seasonsMap.set(seasonNumber, []);
          }
          seasonsMap.get(seasonNumber)?.push({ title: episodeTitle, videoUrl: episode.videoUrl });
        });

        const sortedSeasons = Array.from(seasonsMap.entries())
          .sort(([s1], [s2]) => s1 - s2)
          .map(([seasonNumber, episodes]) => ({
            seasonNumber,
            episodes,
          }));

        // Update series state with processed seasons
        const seriesWithSeasons: SeriesUI = {
          ...data,
          seasons: sortedSeasons,
          numberOfSeasons: sortedSeasons.length,
        };
        setSeries(seriesWithSeasons);

        // Select first episode of the first season by default
        if (sortedSeasons.length > 0 && sortedSeasons[0].episodes.length > 0) {
          setSelectedEpisode(sortedSeasons[0].episodes[0]);
          setSelectedSeasonNumber(sortedSeasons[0].seasonNumber);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchSeries();
    }
  }, [id]);

  // Find the currently selected season's episodes
  const currentSeasonEpisodes = series?.seasons.find(season => season.seasonNumber === selectedSeasonNumber)?.episodes || [];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">Error: {error}</div>;
  }

  if (!series) {
    return <div className="text-center mt-10">Series not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-white/90 mb-6">{series.title}</h1>

        <div className="aspect-video w-full bg-black mb-8 rounded-lg overflow-hidden">
          {selectedEpisode?.videoUrl ? (
            <video
              controls
              src={selectedEpisode.videoUrl}
              className="w-full h-full"
              autoPlay
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <p className="text-white/60">Video not available for this episode.</p>
            </div>
          )}
        </div>

        {/* Episodes List - Wrapped in a Card, above details card */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white/90 mb-4">Bölümler</h2>

            {/* Season selection buttons */}
            {series.seasons.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {series.seasons.map(season => (
                  <button
                    key={season.seasonNumber}
                    onClick={() => {
                      setSelectedSeasonNumber(season.seasonNumber);
                      // Optionally select the first episode of the newly selected season
                      if (season.episodes.length > 0) {
                        setSelectedEpisode(season.episodes[0]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSeasonNumber === season.seasonNumber ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-white/90'}`}
                  >
                    Sezon {season.seasonNumber}
                  </button>
                ))}
              </div>
            )}

            {currentSeasonEpisodes.length > 0 ? (
              <ul className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {currentSeasonEpisodes.map((episode, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 border border-white/10 rounded-md cursor-pointer transition-colors flex items-center justify-between ${selectedEpisode?.title === episode.title && selectedEpisode.videoUrl === episode.videoUrl ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-white/90'}`}
                    onClick={() => setSelectedEpisode(episode)}
                  >
                    <span className="text-sm font-medium">{`Bölüm ${index + 1}: ${episode.title}`}</span>
                    {selectedEpisode?.title === episode.title && selectedEpisode.videoUrl === episode.videoUrl && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/60">Bu sezon için bölüm bulunamadı.</p>
            )}
          </div>
        </Card>

        {/* Series Details Card - Now below the episodes list */}
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 mb-8">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-white/90 mb-2">
                  {series.title}
                </h1>
                <div className="flex items-center gap-4 text-white/60">
                  <span>{series.year}</span>
                  <span>•</span>
                  <span>{series.numberOfSeasons} Sezon</span>
                  {series.rating > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{series.rating}/10</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {series.genre.map((genre, index) => (
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
                <p className="text-white/60">{series.director}</p>
              </div>

              <div>
                <h3 className="text-white/90 font-semibold mb-2">Oyuncular</h3>
                <p className="text-white/60">{series.cast.join(', ')}</p>
              </div>

              <div>
                <h3 className="text-white/90 font-semibold mb-2">Açıklama</h3>
                <p className="text-white/60 leading-relaxed">{series.description}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 