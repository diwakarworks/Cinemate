import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';

const API_URL = "https://cinemate-6k9l.onrender.com/api/diary";
const API_URLL = "http://localhost:5002";


const DiaryEntry = () => {
    const { userId, entryId, directorId } = useParams();
    const [rankingData, setRankingData] = useState(null);
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const navigate = useNavigate();

    // const entryId = "6755762a85aa9dac93242daa"; 

    // 672c3f492d0e6224ab9b19cb  //67318437bd7d120ee9b3a2ca

    // const userId = '6729bdee4d96b9e3cf88229b'; 

    // console.log('userId:', userId, 'entryId:', entryId);














    useEffect(() => {
        const fetchDiaryEntry = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authorization token found');
                setLoading(false);
                return;
            }

            try {
                const { data } = await axios.get(`${API_URL}/${userId}/entries/${entryId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setEntry(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (entryId) {
            fetchDiaryEntry();
        } else {
            setError('No entry ID found');
            setLoading(false);
        }
    }, [userId, entryId]);



    const handleDeleteEntry = async () => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authorization token found');
            return;
        }

        try {
            await axios.delete(`${API_URL}/${userId}/entries/${entryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Diary entry deleted successfully!');
            navigate(`/diary/${userId}`); 
        } catch (error) {
            console.error('Error deleting entry:', error);
            setError('Failed to delete diary entry');
        }
    };








    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;




    const handleHome = () => {
        navigate(`/diary/${userId}`);
    }

    const handleViewRanking = () => {
        if (entry && entry.directorId) {
            navigate(`/ranked/${userId}/${entry.directorId}`);
        }
    };


    const handleCopyLink = () => {
        const link = `${window.location.origin}/diary/${userId}/entries/${entryId}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                alert("Link copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy link:", err);
            });
    };


   


    return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
                <BiArrowBack
                    className="absolute w-10 h-10 mt-2 cursor-pointer text-white hover:text-blue-500"
                    onClick={handleHome}
                    />
              <h1 className="text-4xl mt-1 ml-20 font-bold text-white">
                Your <span className="text-orange-500">Diary Entry</span>
              </h1>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mb-10" />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Movie Info & Review */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Title & Rating */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-4">
                {entry.title} 
                <span className="text-gray-400 font-normal ml-2">({entry.year})</span>
              </h2>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl">
                    <span className="text-2xl font-bold text-white">{entry.rating}</span>
                  </div>
                  <span className="text-gray-400 text-lg">/10</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Watched on</span>
                  <span className="text-white font-medium">
                    {new Date(entry.watchedDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h8a2 2 0 002-2V8M9 12h6" />
                </svg>
                My Review
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {entry.review}
              </p>
            </div>
          </div>

          {/* Right Column - Movie Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
                <Link to={`/movie/${entry.movieId}`} className="group relative block rounded-2xl overflow-hidden shadow-lg transition-transform transform hover:scale-105">
              
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`}
                    alt={entry.title}
                    className="w-full h-auto object-cover group-hover:brightness-110 transition-all duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500x750/374151/9CA3AF?text=No+Poster';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-medium text-center">View Movie Details</p>
                  </div>
                </div>
                 </Link>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-between items-center bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCopyLink}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>

            {entry.directorId && (
              <button
                onClick={handleViewRanking}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-orange-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Filmography
              </button>
            )}
          </div>

          <button
            onClick={handleDeleteEntry}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Entry
          </button>
        </div>

        {/* Mobile-specific improvements */}
        <style jsx>{`
          @media (max-width: 640px) {
            .sticky {
              position: static;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DiaryEntry;
