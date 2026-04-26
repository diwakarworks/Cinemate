import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const TVProvidersAndNetwork = () => {
  const { id } = useParams(); // TV Show ID from the URL
  const [networks, setNetworks] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

  const REGION = 'US';

  useEffect(() => {
    const fetchNetworkAndProviders = async () => {
      try {
        // Fetch TV details for networks
        const tvRes = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`
        );
        setNetworks(tvRes.data.networks || []);

        console.log('TV Details:', tvRes.data);
        
        // Fetch streaming providers
        const providerRes = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/watch/providers?api_key=${API_KEY}`
        );
        const regionData = providerRes.data.results?.[REGION]?.flatrate || [];
        setProviders(regionData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching network/providers:', error);
        setLoading(false);
      }
    };

    fetchNetworkAndProviders();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl  mx-auto bg-stone-900">
      {/* Networks Section */}
      {networks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-md font-semibold ml-2 text-gray-500 mb-3">
            NETWORK
          </h2>
          <div className="flex flex-wrap items-center gap-4 ml-2">
            {networks.map((network) => (
              <Link
                to={`/network/${network.id}`}
                key={network.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center gap-3 transition-all"
              >
                {network.logo_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${network.logo_path}`}
                    alt={network.name}
                    className="h-8 object-contain"
                  />
                ) : (
                  <span className="text-sm text-gray-800 font-medium">
                    {network.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

     <hr className="my-6 border-gray-700" />
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
                className="flex flex-col items-center ml-2 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-20"
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
          <div className="text-gray-500 text-sm p-4 border border-gray-200 rounded-lg bg-gray-50 ml-2">
            No streaming providers available in {REGION}
          </div>
        )}
      </div>
    </div>
  );
};

export default TVProvidersAndNetwork;