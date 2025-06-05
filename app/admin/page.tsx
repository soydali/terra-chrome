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

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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
    addedDate: new Date().toISOString()
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMovies();
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
          addedDate: new Date().toISOString()
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
        addedDate: new Date().toISOString()
      });
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

                  <div className="mb-4">
                    <label className="block text-white/90 mb-2">Video URL</label>
                    <input
                      type="text"
                      value={selectedMovie.videoUrl || ''}
                      onChange={(e) => setSelectedMovie({ ...selectedMovie, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      placeholder="https://example.com/video.mp4"
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

            <div className="p-6">
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
                    onChange={(e) => setNewMovie({...newMovie, genre: e.target.value.split(",").map(s => s.trim())})}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    required
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

                <div className="mb-4">
                  <label className="block text-white/90 mb-2">Video URL</label>
                  <input
                    type="text"
                    value={newMovie.videoUrl || ''}
                    onChange={(e) => setNewMovie({ ...newMovie, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Puan (0-10) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={newMovie.rating?.toString() || "0"}
                      onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 bg-white/5 text-white placeholder-gray-400 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/40 hover:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Durum
                    </label>
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

    </div>
  );
} 