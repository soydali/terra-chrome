import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import Link from "next/link";
import Image from "next/image";

interface SeriesCardProps {
  series: {
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
  };
}

export default function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:bg-white/10 transition-all duration-300">
      <div className="relative aspect-[2/3]">
        <Image
          src={series.image}
          alt={series.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white/90 font-semibold mb-2 text-lg">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/80 text-sm">{series.year}</span>
            <span className="text-white/80 text-sm">•</span>
            <span className="text-white/80 text-sm">{series.numberOfSeasons} Sezon</span>
            <span className="text-white/80 text-sm">•</span>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white/80 text-sm">{series.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {series.genre.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white/5 text-white/90 rounded-full border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="text-white/80 text-sm line-clamp-2 mb-3">
            {series.description}
          </p>
          {/* Link should go to a series watch page, needs adjustment */}
          <Link href={`/watch/series/${series._id}`} className="block">
            <Button
              variant="solid"
              className="w-full bg-white/5 hover:bg-white/10 text-white/90 border border-white/10"
            >
              İzle
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
} 