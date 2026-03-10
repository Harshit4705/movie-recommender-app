// API Types and Endpoints

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Types (Matching FastAPI Models) ---

export interface TMDBMovieCard {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  release_date: string | null;
  vote_average: number | null;
}

export interface TMDBMovieDetails {
  tmdb_id: number;
  title: string;
  overview: string | null;
  release_date: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  genres: Array<{ id: number; name: string }>;
}

export interface TFIDFRecItem {
  title: string;
  score: number;
  tmdb: TMDBMovieCard | null;
}

export interface SearchBundleResponse {
  query: string;
  movie_details: TMDBMovieDetails;
  tfidf_recommendations: TFIDFRecItem[];
  genre_recommendations: TMDBMovieCard[];
}

// --- Fetch Helpers ---

export async function fetchTrendingMovies(): Promise<TMDBMovieCard[]> {
  const res = await fetch(`${API_BASE_URL}/home?category=trending&limit=24`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) throw new Error("Failed to fetch trending movies");
  return res.json();
}

export async function searchMovies(query: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/tmdb/search?query=${encodeURIComponent(query)}&page=1`);
    if(!res.ok) return { results: [] };
    return res.json();
}

export async function fetchMovieBundle(query: string): Promise<SearchBundleResponse> {
  const res = await fetch(`${API_BASE_URL}/movie/search?query=${encodeURIComponent(query)}&tfidf_top_n=12&genre_limit=12`);
  if (!res.ok) throw new Error("Failed to fetch movie bundle");
  return res.json();
}
