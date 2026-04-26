import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const MovieProvidersAndProduction = () => {
  const { id } = useParams(); // Movie ID from the route
  const [productionCompany, setProductionCompany] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const REGION = 'US';

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // 1️⃣ Fetch movie details to get production companies
        const movieRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`
        );
        setProductionCompany(movieRes.data.production_companies || []);

        // 2️⃣ Fetch movie streaming providers
        const providerRes = await axios.get(
          `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`
        );
        const regionData = providerRes.data.results?.[REGION]?.flatrate || [];
        setProviders(regionData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-gray-500">
      {/* Production Companies */}
      {productionCompany.length > 0 && (
        <div className="mb-8">
          <h2 className="text-md font-semibold ml-2 text-gray-500 mb-3">PRODUCTION COMPANIES</h2>
          <div className="flex flex-wrap gap-4">
            {productionCompany.map((company) => (
              <div 
                key={company.id} 
                className="flex flex-col ml-2 items-center p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-20"
              >
                {company.logo_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                    alt={company.name}
                    className="h-10 w-10 object-contain mb-2"
                  />
                )}
                <span className="text-xs text-gray-600 text-center font-medium">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming Providers */}
      <div className="mb-6">
        <h2 className="text-md ml-2 font-semibold text-gray-500 mb-3">
          AVAILABLE ON ({REGION})
        </h2>
        
        {providers.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {providers.map((provider) => (
              <div 
                key={provider.provider_id} 
                className="flex flex-col ml-2 items-center p-3 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors min-w-20"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="h-10 w-10 object-contain mb-2"
                />
                <span className="text-xs text-gray-600 text-center font-medium">
                  {provider.provider_name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded-lg bg-gray-50">
            No streaming providers available in {REGION}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieProvidersAndProduction;