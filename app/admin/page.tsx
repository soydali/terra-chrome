'use client';

import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useRouter } from 'next/navigation';
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
  addedDate: string;
  videoUrl?: string;
}

interface Series {
  _id: string;
  title: string;
  year: string;
  description: string;
  image: string;
  rating: number;
  director: string;
  cast: string[];
  genre: string[];
  numberOfSeasons: number;
  episodes: { title: string; videoUrl?: string }[];
  status: string;
  addedDate: string;
}

// New interfaces for the UI state structure
interface EpisodeUI {
  title: string;
  videoUrl?: string;
}

interface SeasonUI {
  seasonNumber: number;
  episodes: EpisodeUI[];
}

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSeriesModalOpen, setIsAddSeriesModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<(Series & { seasons?: SeasonUI[] }) | null>(null);
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    title: '',
    year: '',
    description: '',
    image: '',
    rating: 0,
    director: '',
    cast: [],
    duration: '',
    genre: [],
    status: 'Aktif',
    addedDate: new Date().toISOString(),
    videoUrl: ''
  });
  const [newSeries, setNewSeries] = useState<Partial<Series> & { seasons?: SeasonUI[] }>({
    title: '',
    year: '',
    description: '',
    image: '',
    rating: 0,
    director: '',
    cast: [],
    genre: [],
    numberOfSeasons: 1,
    seasons: [{
      seasonNumber: 1,
      episodes: []
    }],
    status: 'Aktif',
    addedDate: new Date().toISOString()
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
    fetchSeries();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('/api/movies');
      if (!response.ok) throw new Error('Filmler yüklenirken bir hata oluştu');
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series');
      if (!response.ok) throw new Error('Diziler yüklenirken bir hata oluştu');
      const data = await response.json();
      setSeries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  // Örnek istatistik verileri
  const stats = [
    { title: "Toplam Film", value: "1,234", change: "+12%" },
    { title: "Aktif Kullanıcı", value: "8,456", change: "+5%" },
    { title: "Bugünkü İzlenme", value: "2,345", change: "+23%" },
  ];

  const handleEditClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsEditModalOpen(true);
  };

  const handleEditSeriesClick = (series: Series) => {
    // When editing, convert the flat episodes array back to nested seasons for the UI
    const seasonsMap = new Map<number, EpisodeUI[]>();
    series.episodes.forEach(episode => {
      // Assuming episode titles might contain a pattern like "Sezon X Bölüm Y: Title"
      // This is a rough attempt to parse season number from title if not explicitly stored
      const match = episode.title.match(/Sezon (\d+):/);
      const seasonNumber = match ? parseInt(match[1]) : 1; // Default to season 1 if not found

      if (!seasonsMap.has(seasonNumber)) {
        seasonsMap.set(seasonNumber, []);
      }
      seasonsMap.get(seasonNumber)?.push(episode);
    });

    const sortedSeasons = Array.from(seasonsMap.entries())
      .sort(([s1], [s2]) => s1 - s2)
      .map(([seasonNumber, episodes]) => ({
        seasonNumber,
        episodes: episodes.map(ep => ({
          title: ep.title.replace(/Sezon \d+: /, ''), // Remove season prefix from title for editing
          videoUrl: ep.videoUrl
        }))
      }));

    setSelectedSeries({
      ...series,
      seasons: sortedSeasons.length > 0 ? sortedSeasons : [{
        seasonNumber: 1,
        episodes: []
      }],
      numberOfSeasons: sortedSeasons.length > 0 ? sortedSeasons.length : 1
    });
    setIsEditSeriesModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMovie) return;

    try {
      const response = await fetch(`/api/movies/${selectedMovie._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedMovie),
      });

      if (!response.ok) throw new Error('Film güncellenirken bir hata oluştu');
      
      await fetchMovies();
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu filmi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/movies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Film silinirken bir hata oluştu');
      
      await fetchMovies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  // New handler for deleting series
  const handleDeleteSeries = async (id: string) => {
    if (!confirm('Bu diziyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/series/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Dizi silinirken bir hata oluştu');
      
      await fetchSeries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleAddMovie = async () => {
    try {
      // Validate required fields
      if (!newMovie.title || !newMovie.year || !newMovie.description || !newMovie.image || 
          !newMovie.director || !newMovie.duration || !newMovie.cast?.length || !newMovie.genre?.length) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      // Validate rating
      if (newMovie.rating === undefined || newMovie.rating < 0 || newMovie.rating > 10) {
        setError('Puan 0-10 arasında olmalıdır');
        return;
      }

      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newMovie,
          rating: Number(newMovie.rating),
          cast: newMovie.cast || [],
          genre: newMovie.genre || [],
          status: newMovie.status || 'Beklemede',
          addedDate: new Date().toISOString(),
          videoUrl: newMovie.videoUrl || ''
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Film eklenirken bir hata oluştu');
      }
      
      await fetchMovies();
      setIsAddModalOpen(false);
      setNewMovie({
        title: '',
        year: '',
        description: '',
        image: '',
        rating: 0,
        director: '',
        cast: [],
        duration: '',
        genre: [],
        status: 'Beklemede',
        addedDate: new Date().toISOString(),
        videoUrl: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleAddSeries = async () => {
    try {
      // Validate required fields for series
      if (!newSeries.title || !newSeries.year || !newSeries.description || !newSeries.image || 
          !newSeries.director || !newSeries.cast?.length || !newSeries.genre?.length || newSeries.numberOfSeasons === undefined) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      // Validate rating for series
      if (newSeries.rating === undefined || newSeries.rating < 0 || newSeries.rating > 10) {
        setError('Puan 0-10 arasında olmalıdır');
        return;
      }

      // Flatten the nested seasons/episodes structure for the backend API
      const flattenedEpisodes = newSeries.seasons?.flatMap(season =>
        season.episodes.map(episode => ({
          title: episode.title,
          videoUrl: episode.videoUrl,
        }))
      ) || [];

      const response = await fetch('/api/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSeries,
          episodes: flattenedEpisodes,
          seasons: undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Dizi eklenirken bir hata oluştu');
      }
      
      await fetchSeries();
      setIsAddSeriesModalOpen(false);
      // Reset newSeries state with the new structure
      setNewSeries({
        title: '',
        year: '',
        description: '',
        image: '',
        rating: 0,
        director: '',
        cast: [],
        genre: [],
        numberOfSeasons: 1,
        seasons: [{
          seasonNumber: 1,
          episodes: []
        }],
        status: 'Aktif',
        addedDate: new Date().toISOString()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  // New handler for saving edited series
  const handleSaveEditSeries = async () => {
    if (!selectedSeries) return;

    try {
      // Validate required fields for series
      if (!selectedSeries.title || !selectedSeries.year || !selectedSeries.description || !selectedSeries.image || 
          !selectedSeries.director || !selectedSeries.cast?.length || !selectedSeries.genre?.length || selectedSeries.numberOfSeasons === undefined) {
        setError('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      // Validate rating for series
      if (selectedSeries.rating === undefined || selectedSeries.rating < 0 || selectedSeries.rating > 10) {
        setError('Puan 0-10 arasında olmalıdır');
        return;
      }

      // Flatten the nested seasons/episodes structure for the backend API
      const flattenedEpisodes = selectedSeries.seasons?.flatMap(season =>
        season.episodes.map(episode => ({
          title: `Sezon ${season.seasonNumber}: ${episode.title}`,
          videoUrl: episode.videoUrl,
        }))
      ) || [];

      const response = await fetch(`/api/series/${selectedSeries._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedSeries,
          episodes: flattenedEpisodes,
          seasons: undefined, // Remove seasons from the payload as backend expects flattened episodes
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Dizi güncellenirken bir hata oluştu');
      }

      await fetchSeries();
      setIsEditSeriesModalOpen(false);
      setSelectedSeries(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
        <div className="flex items-center space-x-4">
          <Button 
            variant="bordered"
            className="px-7 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            Yeni Film Ekle
          </Button>
          <Button 
            variant="bordered"
            className="px-7 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
            onClick={() => setIsAddSeriesModalOpen(true)}
          >
            Yeni Dizi Ekle
          </Button>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-md border border-white/20">
            <div className="p-6">
              <h3 className="text-gray-400 text-sm mb-2">{stat.title}</h3>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <span className="text-white/80 text-sm">{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Son Eklenen Filmler */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Son Eklenen Filmler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/20">
                  <th className="pb-3">Film Adı</th>
                  <th className="pb-3">Eklenme Tarihi</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-white">{movie.title}</td>
                    <td className="py-4 text-gray-400">
                      {new Date(movie.addedDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        movie.status === 'Aktif' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
                      }`}>
                        {movie.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="light"
                          className="text-white hover:text-gray-300"
                          onClick={() => handleEditClick(movie)}
                        >
                          Düzenle
                        </Button>
                        <Button 
                          variant="light"
                          className="text-white hover:text-gray-300"
                          onClick={() => handleDelete(movie._id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Son Eklenen Diziler */}
      <Card className="bg-white/10 backdrop-blur-md border border-white/20 mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Son Eklenen Diziler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-white/20">
                  <th className="pb-3">Dizi Adı</th>
                  <th className="pb-3">Eklenme Tarihi</th>
                  <th className="pb-3">Durum</th>
                  <th className="pb-3">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {series.map((seriesItem) => (
                  <tr key={seriesItem._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-white">{seriesItem.title}</td>
                    <td className="py-4 text-gray-400">
                      {new Date(seriesItem.addedDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        seriesItem.status === 'Aktif' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
                      }`}>
                        {seriesItem.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="light"
                          className="text-white hover:text-gray-300"
                          onClick={() => handleEditSeriesClick(seriesItem)}
                        >
                          Düzenle
                        </Button>
                        <Button 
                          variant="light"
                          className="text-white hover:text-gray-300"
                          onClick={() => handleDeleteSeries(seriesItem._id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Film Düzenleme Modalı */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="relative z-[9999]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Dialog.Title className="text-xl font-bold text-white p-6 border-b border-white/20">
              Film Düzenle
            </Dialog.Title>

            <div className="p-6">
              {selectedMovie && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Film Adı</label>
                      <input
                        type="text"
                        value={selectedMovie.title}
                        onChange={(e) => setSelectedMovie({...selectedMovie, title: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Yıl</label>
                      <input
                        type="text"
                        value={selectedMovie.year}
                        onChange={(e) => setSelectedMovie({...selectedMovie, year: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama</label>
                    <textarea
                      value={selectedMovie.description}
                      onChange={(e) => setSelectedMovie({...selectedMovie, description: e.target.value})}
                      className="w-full h-32 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Yönetmen</label>
                      <input
                        type="text"
                        value={selectedMovie.director}
                        onChange={(e) => setSelectedMovie({...selectedMovie, director: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Süre</label>
                      <input
                        type="text"
                        value={selectedMovie.duration}
                        onChange={(e) => setSelectedMovie({...selectedMovie, duration: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Oyuncular (virgülle ayırın)</label>
                    <input
                      type="text"
                      value={selectedMovie.cast.join(", ")}
                      onChange={(e) => setSelectedMovie({...selectedMovie, cast: e.target.value.split(",").map(s => s.trim())})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Türler (virgülle ayırın)</label>
                    <input
                      type="text"
                      value={selectedMovie.genre.join(", ")}
                      onChange={(e) => setSelectedMovie({...selectedMovie, genre: e.target.value.split(",").map(s => s.trim())})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Poster URL</label>
                    <input
                      type="text"
                      value={selectedMovie.image}
                      onChange={(e) => setSelectedMovie({...selectedMovie, image: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Puan</label>
                      <input
                        type="number"
                        value={selectedMovie.rating.toString()}
                        onChange={(e) => setSelectedMovie({...selectedMovie, rating: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
                      <select
                        value={selectedMovie.status}
                        onChange={(e) => setSelectedMovie({...selectedMovie, status: e.target.value})}
                        className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Beklemede">Beklemede</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 p-6 border-t border-white/20">
              <Button
                variant="light"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                İptal
              </Button>
              <Button
                variant="solid"
                onClick={handleSaveEdit}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Kaydet
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Film Ekleme Modalı */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        className="z-[9999] relative"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Dialog.Title className="text-xl font-bold text-white p-6 border-b border-white/20">
              Yeni Film Ekle
            </Dialog.Title>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-white/5 border border-white/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Film Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yıl <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMovie.year}
                      onChange={(e) => setNewMovie({...newMovie, year: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Açıklama <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                    className="w-full h-32 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yönetmen <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMovie.director}
                      onChange={(e) => setNewMovie({...newMovie, director: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Süre <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({...newMovie, duration: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Oyuncular (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovie.cast?.join(", ") || ""}
                    onChange={(e) => setNewMovie({...newMovie, cast: e.target.value.split(",").map(s => s.trim())})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Türler (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovie.genre?.join(", ") || ""}
                    onChange={(e) => setNewMovie({...newMovie, genre: e.target.value.split(",").map(g => g.trim())})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    placeholder="Aksiyon, Komedi, Dram"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Video URL (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={newMovie.videoUrl || ''}
                    onChange={(e) => setNewMovie({...newMovie, videoUrl: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    placeholder="Video URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Poster URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMovie.image}
                    onChange={(e) => setNewMovie({...newMovie, image: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Puan <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={newMovie.rating?.toString() || "0"}
                      onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
                    <select
                      value={newMovie.status}
                      onChange={(e) => setNewMovie({...newMovie, status: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Beklemede">Beklemede</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-6 border-t border-white/20">
              <Button
                variant="light"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                İptal
              </Button>
              <Button
                variant="solid"
                onClick={handleAddMovie}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Ekle
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Dizi Ekleme Modalı */}
      <Dialog
        open={isAddSeriesModalOpen}
        onClose={() => setIsAddSeriesModalOpen(false)}
        className="z-[9999] relative"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Dialog.Title className="text-xl font-bold text-white p-6 border-b border-white/20">
              Yeni Dizi Ekle
            </Dialog.Title>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-white/5 border border-white/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Dizi Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSeries.title}
                      onChange={(e) => setNewSeries({...newSeries, title: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Başlangıç Yılı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSeries.year}
                      onChange={(e) => setNewSeries({...newSeries, year: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Açıklama <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={newSeries.description}
                    onChange={(e) => setNewSeries({...newSeries, description: e.target.value})}
                    className="w-full h-32 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yönetmen/Yapımcı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSeries.director}
                      onChange={(e) => setNewSeries({...newSeries, director: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Sezon Sayısı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={newSeries.numberOfSeasons}
                      onChange={(e) => setNewSeries({...newSeries, numberOfSeasons: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sezonlar ve Bölümler <span className="text-red-400">*</span>
                  </label>
                  {newSeries.seasons?.map((season, seasonIndex) => (
                    <div key={seasonIndex} className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-3">Sezon {season.seasonNumber}</h3>
                      <div className="space-y-3">
                        {season.episodes.map((episode, episodeIndex) => (
                          <div key={episodeIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={episode.title}
                              onChange={(e) => {
                                const updatedSeasons = [...(newSeries.seasons || [])];
                                updatedSeasons[seasonIndex].episodes[episodeIndex].title = e.target.value;
                                setNewSeries({...newSeries, seasons: updatedSeasons});
                              }}
                              className="flex-1 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                              placeholder={`Bölüm ${episodeIndex + 1} Başlığı`}
                              required
                            />
                            <input
                              type="text"
                              value={episode.videoUrl || ''}
                              onChange={(e) => {
                                const updatedSeasons = [...(newSeries.seasons || [])];
                                updatedSeasons[seasonIndex].episodes[episodeIndex].videoUrl = e.target.value;
                                setNewSeries({...newSeries, seasons: updatedSeasons});
                              }}
                              className="flex-1 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                              placeholder="Video URL (Opsiyonel)"
                            />
                            <Button
                              variant="light"
                              onClick={() => {
                                const updatedSeasons = [...(newSeries.seasons || [])];
                                updatedSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
                                setNewSeries({...newSeries, seasons: updatedSeasons});
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Sil
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="bordered"
                          onClick={() => {
                            setNewSeries(prev => {
                              const updatedSeasons = [...(prev.seasons || [])];
                              if (updatedSeasons[seasonIndex]) {
                                updatedSeasons[seasonIndex].episodes.push({ title: '', videoUrl: '' });
                              }
                              return {...prev, seasons: updatedSeasons};
                            });
                          }}
                          className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                        >
                          + Bölüm Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="bordered"
                    onClick={() => {
                      setNewSeries(prev => ({
                        ...prev,
                        numberOfSeasons: (prev.numberOfSeasons || 0) + 1,
                        seasons: [...(prev.seasons || []), { seasonNumber: (prev.seasons?.length || 0) + 1, episodes: [] }]
                      }));
                    }}
                    className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    + Sezon Ekle
                  </Button>
                  <Button
                    variant="bordered"
                    onClick={() => {
                      setNewSeries(prev => {
                        if (!prev || !prev.seasons || prev.seasons.length <= 1) return prev;
                        return {
                          ...prev,
                          numberOfSeasons: (prev.numberOfSeasons || 0) - 1,
                          seasons: prev.seasons.slice(0, prev.seasons.length - 1)
                        };
                      });
                    }}
                    className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    - Son Sezonu Sil
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Oyuncular (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSeries.cast?.join(", ") || ""}
                    onChange={(e) => setNewSeries({...newSeries, cast: e.target.value.split(",").map(s => s.trim())})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Türler (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSeries.genre?.join(", ") || ""}
                    onChange={(e) => setNewSeries({...newSeries, genre: e.target.value.split(",").map(g => g.trim())})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    placeholder="Aksiyon, Komedi, Dram"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Poster URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSeries.image}
                    onChange={(e) => setNewSeries({...newSeries, image: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Puan <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={newSeries.rating?.toString() || "0"}
                      onChange={(e) => setNewSeries({...newSeries, rating: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
                    <select
                      value={newSeries.status}
                      onChange={(e) => setNewSeries({...newSeries, status: e.target.value})}
                      className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Beklemede">Beklemede</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-6 border-t border-white/20">
              <Button
                variant="light"
                onClick={() => setIsAddSeriesModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                İptal
              </Button>
              <Button
                variant="solid"
                onClick={handleAddSeries}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Ekle
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Dizi Düzenleme Modalı */}
      <Dialog
        open={isEditSeriesModalOpen}
        onClose={() => setIsEditSeriesModalOpen(false)}
        className="z-[9999] relative"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <Dialog.Title className="text-xl font-bold text-white p-6 border-b border-white/20">
              Dizi Düzenle
            </Dialog.Title>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-white/5 border border-white/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Dizi Adı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedSeries?.title || ''}
                      onChange={(e) => setSelectedSeries(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Başlangıç Yılı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedSeries?.year || ''}
                      onChange={(e) => setSelectedSeries(prev => prev ? {...prev, year: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Açıklama <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={selectedSeries?.description || ''}
                    onChange={(e) => setSelectedSeries(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full h-32 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Yönetmen/Yapımcı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedSeries?.director || ''}
                      onChange={(e) => setSelectedSeries(prev => prev ? {...prev, director: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Sezon Sayısı <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={selectedSeries?.numberOfSeasons || 1}
                      onChange={(e) => {
                        const newNumSeasons = parseInt(e.target.value);
                        setSelectedSeries(prev => {
                          if (!prev) return null;
                          const currentSeasons = prev.seasons || [];
                          const newSeasons = Array.from({ length: newNumSeasons }, (_, i) => {
                            const seasonNumber = i + 1;
                            const existingSeason = currentSeasons.find(s => s.seasonNumber === seasonNumber);
                            return existingSeason || { seasonNumber, episodes: [] };
                          });
                          return { ...prev, numberOfSeasons: newNumSeasons, seasons: newSeasons };
                        });
                      }}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sezonlar ve Bölümler <span className="text-red-400">*</span>
                  </label>
                  {selectedSeries?.seasons?.map((season, seasonIndex) => (
                    <div key={seasonIndex} className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-3">Sezon {season.seasonNumber}</h3>
                      <div className="space-y-3">
                        {season.episodes.map((episode, episodeIndex) => (
                          <div key={episodeIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={episode.title}
                              onChange={(e) => {
                                setSelectedSeries(prev => {
                                  if (!prev) return null;
                                  const updatedSeasons = [...(prev.seasons || [])];
                                  updatedSeasons[seasonIndex].episodes[episodeIndex].title = e.target.value;
                                  return {...prev, seasons: updatedSeasons};
                                });
                              }}
                              className="flex-1 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                              placeholder={`Bölüm ${episodeIndex + 1} Başlığı`}
                              required
                            />
                            <input
                              type="text"
                              value={episode.videoUrl || ''}
                              onChange={(e) => {
                                setSelectedSeries(prev => {
                                  if (!prev) return null;
                                  const updatedSeasons = [...(prev.seasons || [])];
                                  updatedSeasons[seasonIndex].episodes[episodeIndex].videoUrl = e.target.value;
                                  return {...prev, seasons: updatedSeasons};
                                });
                              }}
                              className="flex-1 px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                              placeholder="Video URL (Opsiyonel)"
                            />
                            <Button
                              variant="light"
                              onClick={() => {
                                setSelectedSeries(prev => {
                                  if (!prev) return null;
                                  const updatedSeasons = [...(prev.seasons || [])];
                                  updatedSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
                                  return {...prev, seasons: updatedSeasons};
                                });
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              Sil
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="bordered"
                          onClick={() => {
                            setSelectedSeries(prev => {
                              if (!prev) return null;
                              const updatedSeasons = [...(prev.seasons || [])];
                              if (updatedSeasons[seasonIndex]) {
                                updatedSeasons[seasonIndex].episodes.push({ title: '', videoUrl: '' });
                              }
                              return {...prev, seasons: updatedSeasons};
                            });
                          }}
                          className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                        >
                          + Bölüm Ekle
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="bordered"
                    onClick={() => {
                      setSelectedSeries(prev => ({
                        ...prev!,
                        numberOfSeasons: (prev!.numberOfSeasons || 0) + 1,
                        seasons: [...(prev!.seasons || []), { seasonNumber: (prev!.seasons?.length || 0) + 1, episodes: [] }]
                      }));
                    }}
                    className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    + Sezon Ekle
                  </Button>
                  <Button
                    variant="bordered"
                    onClick={() => {
                      setSelectedSeries(prev => {
                        if (!prev || !prev.seasons || prev.seasons.length <= 1) return prev;
                        return {
                          ...prev,
                          numberOfSeasons: (prev.numberOfSeasons || 0) - 1,
                          seasons: prev.seasons.slice(0, prev.seasons.length - 1)
                        };
                      });
                    }}
                    className="w-full mt-3 border-2 border-white/20 text-white hover:bg-white/10 transition-colors"
                  >
                    - Son Sezonu Sil
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Oyuncular (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedSeries?.cast?.join(", ") || ""}
                    onChange={(e) => setSelectedSeries(prev => prev ? {...prev, cast: e.target.value.split(",").map(s => s.trim())} : null)}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Türler (virgülle ayırın) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedSeries?.genre?.join(", ") || ""}
                    onChange={(e) => setSelectedSeries(prev => prev ? {...prev, genre: e.target.value.split(",").map(g => g.trim())} : null)}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    placeholder="Aksiyon, Komedi, Dram"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Poster URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedSeries?.image || ''}
                    onChange={(e) => setSelectedSeries(prev => prev ? {...prev, image: e.target.value} : null)}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Puan <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={selectedSeries?.rating?.toString() || "0"}
                      onChange={(e) => setSelectedSeries(prev => prev ? {...prev, rating: parseFloat(e.target.value)} : null)}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                      min="0"
                      max="10"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Durum</label>
                    <select
                      value={selectedSeries?.status || 'Aktif'}
                      onChange={(e) => setSelectedSeries(prev => prev ? {...prev, status: e.target.value} : null)}
                      className="w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Beklemede">Beklemede</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 p-6 border-t border-white/20">
              <Button
                variant="light"
                onClick={() => setIsEditSeriesModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                İptal
              </Button>
              <Button
                variant="solid"
                onClick={handleSaveEditSeries}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Kaydet
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 