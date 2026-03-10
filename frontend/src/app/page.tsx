"use client";

import { useEffect, useState } from "react";
import { Search, Popcorn, Sparkles, TrendingUp, Info, Play, Film } from "lucide-react";
import { 
  fetchTrendingMovies, 
  searchMovies, 
  fetchMovieBundle,
  type TMDBMovieCard,
  type SearchBundleResponse 
} from "@/lib/api";

export default function Home() {
  const [trending, setTrending] = useState<TMDBMovieCard[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Bundle Data (Details + Recs)
  const [bundle, setBundle] = useState<SearchBundleResponse | null>(null);
  const [isBundleLoading, setIsBundleLoading] = useState(false);
  const [bundleError, setBundleError] = useState("");

  // Load Trending on Mount
  useEffect(() => {
    fetchTrendingMovies()
      .then(setTrending)
      .catch((err) => console.error("Failed to load trending:", err))
      .finally(() => setIsTrendingLoading(false));
  }, []);

  // Handle Search Input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        setIsSearching(true);
        searchMovies(query)
          .then((data) => setSuggestions(data.results || []))
          .catch(console.error)
          .finally(() => setIsSearching(false));
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle Selecting a Movie
  const handleSelectMovie = async (title: string, id: number) => {
    setQuery(title);
    setShowSuggestions(false);
    setIsBundleLoading(true);
    setBundleError("");
    setBundle(null);

    // Scroll slightly down when searching
    window.scrollTo({ top: window.innerHeight * 0.3, behavior: 'smooth' });

    try {
      // The API endpoint takes the query string to do the lookup
      const data = await fetchMovieBundle(title);
      setBundle(data);
    } catch (err: any) {
      setBundleError("Could not fetch recommendations for this title.");
      console.error(err);
    } finally {
      setIsBundleLoading(false);
    }
  };

  // Movie Card Component (Internal to avoid passing too many props)
  const MovieCardGridItem = ({ movie, onClick }: { movie: TMDBMovieCard, onClick?: () => void }) => (
    <div 
      className="glass-card glass-card-hover group cursor-pointer flex flex-col h-full"
      onClick={() => onClick && onClick()}
    >
      <div className="relative aspect-[2/3] w-full bg-white/5 overflow-hidden">
        {movie.poster_url ? (
          <img 
            src={movie.poster_url} 
            alt={movie.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-white/30 p-4 text-center">
            <Popcorn size={32} className="mb-2 opacity-50" />
            <span className="text-xs">No Poster Available</span>
          </div>
        )}
        
        {/* Rating Badge */}
        {movie.vote_average ? (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-yellow-400 border border-white/10 shadow-lg">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        ) : null}
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-violet-400 transition-colors">{movie.title}</h3>
        {movie.release_date && (
          <p className="text-xs text-white/50 mt-2">{movie.release_date.split('-')[0]}</p>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pb-20">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setBundle(null); setQuery(""); }}>
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-500 p-2 rounded-xl shadow-lg shadow-violet-500/30 animate-float">
              <Film size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Movie<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-gradient-text">Brain</span></h1>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-white/70">
            <span className="hover:text-white transition-colors cursor-pointer">Recommender Model</span>
            <span className="hover:text-white transition-colors cursor-pointer">About AI</span>
          </div>
        </div>
      </nav>

      {/* Hero Search Section */}
      <section className="pt-32 pb-16 px-6 relative max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[50vh]">
        {/* Floating background aesthetic elements */}
        <div className="absolute top-20 left-10 text-violet-500/20 animate-float">
          <Popcorn size={64} />
        </div>
        <div className="absolute bottom-20 right-10 text-indigo-500/20 animate-float-delayed">
          <Film size={80} />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300 mb-6 backdrop-blur-md crazy-pulse-border">
          <Sparkles size={14} className="animate-pulse" /> Powered by ML & TF-IDF
        </div>
        
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight hover:scale-105 transition-transform duration-500 cursor-default">
          Find Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 animate-gradient-text text-glow">
            Cinematic Obsession
          </span>
        </h2>
        
        <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Our machine learning model analyzes thousands of films to find the perfect match for your exact taste.
        </p>

        {/* Search Bar Container */}
        <div className="relative w-full max-w-2xl z-40 animate-float-delayed">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
            <div className="relative flex items-center bg-[#09090b]/80 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl transition-all duration-300 group-hover:border-fuchsia-500/50 group-hover:scale-105">
              <Search className="text-white/40 ml-4 mr-3" size={24} />
              <input 
                type="text"
                placeholder="Search for a movie title..."
                className="w-full bg-transparent text-lg text-white placeholder-white/30 outline-none py-4"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              {isSearching && (
                <div className="mr-6">
                  <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (query.length >= 2) && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 pb-2 pt-2">Suggestions</div>
                  {suggestions.slice(0, 5).map((m: any) => (
                    <div 
                      key={m.id}
                      onClick={() => handleSelectMovie(m.title || m.name, m.id)}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer rounded-xl transition-colors group"
                    >
                      {m.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="poster" className="w-10 h-14 object-cover rounded-md shadow-md" />
                      ) : (
                        <div className="w-10 h-14 bg-white/5 rounded-md flex items-center justify-center">
                          <Popcorn size={16} className="text-white/20" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-white group-hover:text-violet-400 transition-colors">{m.title || m.name}</h4>
                        <p className="text-xs text-white/50">{m.release_date?.split('-')[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !isSearching && query.length >= 2 && (
                  <div className="p-8 text-center text-white/40">
                    No movies found. Try another title.
                  </div>
                )
              )}
            </div>
          )}
        </div>
        
        {/* Click outside search handler (invisible overlay) */}
        {showSuggestions && (
          <div className="fixed inset-0 z-[-1]" onClick={() => setShowSuggestions(false)} />
        )}
      </section>

      {/* --- BUNDLE VIEW (Active Search Results) --- */}
      {isBundleLoading && (
        <section className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-white/60 animate-pulse text-lg font-medium">Analyzing neural pathways & TF-IDF vectors...</p>
        </section>
      )}

      {bundleError && !isBundleLoading && (
        <div className="max-w-3xl mx-auto px-6 py-8 mt-8 glass-card border-red-500/30 bg-red-500/5 text-center">
          <p className="text-red-400">{bundleError}</p>
          <button onClick={() => setBundle(null)} className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">Clear Search</button>
        </div>
      )}

      {bundle && !isBundleLoading && (
        <section className="max-w-7xl mx-auto px-6 space-y-20 pb-20 fade-in">
          
          {/* Main Movie Hero */}
          <div className="relative glass-panel overflow-hidden border-white/5 shadow-2xl">
            {/* Backdrop Image with Gradient Fade */}
            {bundle.movie_details.backdrop_url && (
              <>
                <div className="absolute inset-0 z-0">
                  <img src={bundle.movie_details.backdrop_url} alt="Backdrop" className="w-full h-full object-cover object-top opacity-30" />
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
              </>
            )}

            <div className="relative z-10 flex flex-col md:flex-row gap-8 p-8 md:p-12">
              <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
                {bundle.movie_details.poster_url ? (
                  <img 
                    src={bundle.movie_details.poster_url} 
                    alt={bundle.movie_details.title} 
                    className="w-full rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 transform transition-transform duration-700 hover:scale-105 hover:rotate-2"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                     <span className="text-white/40">No Poster</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 mb-4">
                  {bundle.movie_details.genres.map(g => (
                    <span key={g.id} className="text-xs font-semibold px-3 py-1 bg-violet-600/30 text-violet-200 rounded-full border border-violet-500/30 backdrop-blur-md">
                      {g.name}
                    </span>
                  ))}
                  {bundle.movie_details.release_date && (
                    <span className="text-xs font-semibold px-3 py-1 bg-white/10 text-white/70 rounded-full border border-white/10 backdrop-blur-md">
                      {bundle.movie_details.release_date.split('-')[0]}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white text-glow leading-tight">{bundle.movie_details.title}</h2>
                <div className="glass-panel p-6 bg-black/40 backdrop-blur-xl border-white/5">
                  <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={16}/> Overview</h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    {bundle.movie_details.overview || "No overview available for this title."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TF-IDF Recommendations AI Model */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-violet-500/20 rounded-xl text-violet-400 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Because you liked {bundle.movie_details.title}</h2>
                <p className="text-white/50 text-sm mt-1">Sourced via our ML TF-IDF similarity matrix</p>
              </div>
            </div>
            
            {bundle.tfidf_recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {bundle.tfidf_recommendations.map((rec, i) => (
                  <div key={i} className="relative group">
                    <MovieCardGridItem 
                      movie={{
                        tmdb_id: rec.tmdb?.tmdb_id || 0,
                        title: rec.title,
                        poster_url: rec.tmdb?.poster_url || null,
                        release_date: rec.tmdb?.release_date || null,
                        vote_average: rec.tmdb?.vote_average || null
                      }} 
                      onClick={() => {
                        if(rec.tmdb?.tmdb_id) handleSelectMovie(rec.title, rec.tmdb.tmdb_id);
                      }}
                    />
                    {/* ML Score Overlay */}
                    <div className="absolute top-2 left-2 bg-violet-600/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase font-bold text-white border border-violet-400/50 shadow-lg z-10">
                      Match: {(rec.score * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 glass-card p-8 text-center italic">No complex internal matches found for this title.</p>
            )}
          </div>

          {/* Genre Recommendations (TMDB Provider) */}
          {bundle.genre_recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
                  <Play size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Explore More Like This</h2>
                  <p className="text-white/50 text-sm mt-1">Popular movies in the same primary genre</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {bundle.genre_recommendations.map((movie) => (
                  <MovieCardGridItem 
                    key={movie.tmdb_id} 
                    movie={movie} 
                    onClick={() => handleSelectMovie(movie.title, movie.tmdb_id)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- DEFAULT VIEW (Trending) --- */}
      {!bundle && !isBundleLoading && (
        <section className="max-w-7xl mx-auto px-6 py-10 mt-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/70">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-2xl font-bold">Trending Right Now</h2>
          </div>
          
          {isTrendingLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                 <div key={i} className="aspect-[2/3] glass-card animate-pulse bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {trending.map((movie) => (
                <MovieCardGridItem 
                  key={movie.tmdb_id} 
                  movie={movie} 
                  onClick={() => handleSelectMovie(movie.title, movie.tmdb_id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Global generic fade-in styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.5s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </main>
  );
}
