import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Search, Loader2 } from "lucide-react";
import { BiArrowBack } from "react-icons/bi";

const TMDB_KEY = process.env.REACT_APP_TMDB_API_KEY;
const MIN_SHOWS_PER_PAGE = 12;

const TV_GENRES = [
  { code: 10759, name: "Action & Adventure" },
  { code: 16, name: "Animation" },
  { code: 35, name: "Comedy" },
  { code: 80, name: "Crime" },
  { code: 99, name: "Documentary" },
  { code: 18, name: "Drama" },
  { code: 10751, name: "Family" },
  { code: 10762, name: "Kids" },
  { code: 9648, name: "Mystery" },
  { code: 10763, name: "News" },
  { code: 10764, name: "Reality" },
  { code: 10765, name: "Sci-Fi & Fantasy" },
  { code: 10766, name: "Soap" },
  { code: 10767, name: "Talk" },
  { code: 10768, name: "War & Politics" },
  { code: 37, name: "Western" },
];

export default function BrowseSeriesByCountryLanguage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "country");
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const cachedC = localStorage.getItem("tmdb_countries_v2");
      const cachedL = localStorage.getItem("tmdb_languages_v2");
      if (cachedC && cachedL) {
        setCountries(JSON.parse(cachedC));
        setLanguages(JSON.parse(cachedL));
        setLoadingList(false);
        return;
      }
      try {
        const [cRes, lRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/configuration/countries?api_key=${TMDB_KEY}`,
          ),
          fetch(
            `https://api.themoviedb.org/3/configuration/languages?api_key=${TMDB_KEY}`,
          ),
        ]);
        const cData = await cRes.json();
        const lData = await lRes.json();

        if (!Array.isArray(cData) || !Array.isArray(lData)) {
          console.error("Unexpected TMDB config response", cData, lData);
          setLoadingList(false);
          return;
        }

        const cSorted = cData
          .map((c) => ({ code: c.iso_3166_1, name: c.english_name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        const lSorted = lData
          .filter((l) => l.english_name)
          .map((l) => ({ code: l.iso_639_1, name: l.english_name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(cSorted);
        setLanguages(lSorted);
        localStorage.setItem("tmdb_countries_v2", JSON.stringify(cSorted));
        localStorage.setItem("tmdb_languages_v2", JSON.stringify(lSorted));
      } catch (err) {
        console.error("Failed to load TMDB config", err);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setShows([]);
    setPage(1);
    setTotalPages(1);
  }, [selected, sortBy]);

  const fetchPage = useCallback(
    async (pageNum) => {
      let param;
      if (selected.type === "country") {
        param = `with_origin_country=${selected.code}`;
      } else if (selected.type === "language") {
        param = `with_original_language=${selected.code}`;
      } else {
        param = `with_genres=${selected.code}`;
      }
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_KEY}&${param}&sort_by=${sortBy}&vote_count.gte=100&page=${pageNum}`,
      );
      const data = await res.json();
      const withPosters = (data.results || []).filter((s) => !!s.poster_path);
      return { withPosters, totalPages: data.total_pages || 1 };
    },
    [selected, sortBy],
  );

  useEffect(() => {
    if (!selected) return;

    async function loadShows() {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let collected = [];
        let p = page;
        let lastTotalPages = totalPages;

        while (collected.length < MIN_SHOWS_PER_PAGE && p <= lastTotalPages) {
          const { withPosters, totalPages: tp } = await fetchPage(p);
          lastTotalPages = tp;
          collected = [...collected, ...withPosters];
          p += 1;
        }

        if (sortBy === "popularity.desc") {
          collected.sort((a, b) => b.popularity - a.popularity);
        } else if (sortBy === "vote_average.desc") {
          collected.sort((a, b) => b.vote_average - a.vote_average);
        }

        setTotalPages(lastTotalPages);
        setPage(p - 1 === 0 ? 1 : p - 1);
        setShows((prev) => (page === 1 ? collected : [...prev, ...collected]));
      } catch (err) {
        console.error("Failed to load shows", err);
        if (page === 1) setShows([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    loadShows();
  }, [selected, fetchPage]);

  const loadNextPage = useCallback(async () => {
    if (!selected) return;
    setLoadingMore(true);
    try {
      let collected = [];
      let p = page + 1;
      let lastTotalPages = totalPages;
      while (collected.length < MIN_SHOWS_PER_PAGE && p <= lastTotalPages) {
        const { withPosters, totalPages: tp } = await fetchPage(p);
        lastTotalPages = tp;
        collected = [...collected, ...withPosters];
        p += 1;
      }

      if (sortBy === "popularity.desc") {
        collected.sort((a, b) => b.popularity - a.popularity);
      } else if (sortBy === "vote_average.desc") {
        collected.sort((a, b) => b.vote_average - a.vote_average);
      }

      setTotalPages(lastTotalPages);
      setPage(p - 1 === 0 ? 1 : p - 1);
      setShows((prev) => [...prev, ...collected]);
    } catch (err) {
      console.error("Failed to load more shows", err);
    } finally {
      setLoadingMore(false);
    }
  }, [selected, page, totalPages, fetchPage, sortBy]);

  const list =
    tab === "country" ? countries : tab === "language" ? languages : TV_GENRES;
  const filtered = useMemo(() => {
    if (!query) return list;
    return list.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [list, query]);

  if (selected) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <div className="flex items-center gap-4 px-5 py-4">
          <button onClick={() => setSelected(null)} className="p-0">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-2xl font-extrabold m-0">{selected.name}</h1>
        </div>

        <div className="flex gap-2 px-5 mb-4">
          <button
            onClick={() => setSortBy("popularity.desc")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              sortBy === "popularity.desc"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setSortBy("vote_average.desc")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              sortBy === "vote_average.desc"
                ? "bg-white text-black"
                : "bg-neutral-800 text-neutral-300"
            }`}
          >
            Top Rated
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-neutral-400">
            Loading series…
          </div>
        ) : shows.length === 0 ? (
          <div className="px-6 py-8 text-center text-neutral-400">
            No series with posters found for {selected.name}.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-5 pb-6">
              {shows.map((show, i) => (
                <div key={`${show.id}-${i}`} className="flex flex-col gap-1.5">
                  <div className="rounded-md overflow-hidden bg-neutral-800 aspect-[2/3]">
                    <Link
                      to={`/show/${show.id}`}
                      className="w-full h-full block hover:opacity-90 transition-opacity duration-200"
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                        alt={show.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2 pb-10">
              {page < totalPages && (
                <button
                  onClick={loadNextPage}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-300 disabled:opacity-60"
                >
                  {loadingMore && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
  const handleHome = () => {
    navigate("/");
  }


  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="flex items-center gap-4 px-5 py-4">
        <button className="p-0">
          <BiArrowBack
            className="absolute w-10 h-10 -mt-4 cursor-pointer text-white hover:text-blue-500"
            onClick={handleHome}
          />
        </button>
        <h1 className="text-2xl font-extrabold ml-8 mt-2">Browse Series by</h1>
      </div>

      <div className="flex border-b border-neutral-700 px-5">
        <TabButton
          label="Genre"
          active={tab === "genre"}
          onClick={() => {
            setTab("genre");
            setQuery("");
          }}
        />
        <TabButton
          label="Country"
          active={tab === "country"}
          onClick={() => {
            setTab("country");
            setQuery("");
          }}
        />
        <TabButton
          label="Language"
          active={tab === "language"}
          onClick={() => {
            setTab("language");
            setQuery("");
          }}
        />
      </div>

      <div className="flex items-center gap-2 mx-5 my-3 px-3 py-2 bg-neutral-800 rounded-lg">
        <Search size={16} className="text-neutral-400" />
        <input
          className="bg-transparent border-none outline-none ml-4 text-white text-sm w-full placeholder:text-neutral-500"
          placeholder={`Search ${tab}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pb-10">
        {loadingList && tab !== "genre" ? (
          <div className="px-6 py-8 text-center text-neutral-400">
            Loading {tab === "country" ? "countries" : "languages"}…
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.code}
              onClick={() =>
                setSelected({ type: tab, code: item.code, name: item.name })
              }
              className="flex justify-between items-center px-5 py-4 ml-4 cursor-pointer hover:bg-neutral-800/60"
            >
              <span className="text-[17px] text-neutral-200">{item.name}</span>
              <ChevronRight size={18} className="text-neutral-500" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-base border-b-2 ${
        active
          ? "text-white border-green-500"
          : "text-neutral-400 border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
