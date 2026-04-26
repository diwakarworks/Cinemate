import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const TVReviewPage = () => {
  const { id } = useParams(); 
  const { reviewId } = useParams(); 
  const [review, setReview] = useState(null);
  const [tvDetails, setTvDetails] = useState(null);

  
  const getReviewById = async (reviewId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/review/${reviewId}?api_key=${apiKey}`);
    return response.data;
  };

 
  const getTvDetails = async (tvId) => {
    const response = await axios.get(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}`);
    return response.data;
  };

  useEffect(() => {
    const fetchData = async () => {
      const reviewData = await getReviewById(reviewId);
      setReview(reviewData);

      if (reviewData?.media_id) {
        const tvData = await getTvDetails(reviewData.media_id);
        setTvDetails(tvData);
      }
    };

    fetchData();
  }, [reviewId]);

  if (!review || !tvDetails) {
    return <p>Loading...</p>;
  }

  const tvPoster = tvDetails?.poster_path
    ? `https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-8">
      <div className="max-w-8xl w-full bg-gray-800 p-12 rounded-lg shadow-2xl space-y-8">

        <div className="flex flex-col md:flex-row items-start md:space-x-8">

          <div className="w-full md:w-1/4 mb-6 md:mb-0">
            <img
              src={tvPoster}
              alt={tvDetails.name}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="flex-1">
            <div className="text-left mb-6">
              <h1 className="text-3xl font-bold text-white inline">
                {tvDetails.name}
              </h1>
              <h3 className="text-gray-400 inline ml-2">({new Date(tvDetails.first_air_date).getFullYear()})</h3>

              {review.author_details?.rating ? (
                <div className="flex items-center justify-left mt-4 mb-4 space-x-2">
                  {Array.from({ length: Math.floor(review.author_details.rating) }, (_, i) => (
                    <span key={i} className="text-green-300 text-2xl">★</span>
                  ))}
                  {review.author_details.rating % 1 !== 0 && (
                    <span className="text-green-500 text-2xl opacity-50">★</span>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 mt-6">No Rating Given</p>
              )}

              <p className="text-gray-400 mt-2">
                Written by <span className="text-gray-200">{review.author}</span> on {formattedDate}
              </p>
            </div>

            <div className="space-y-6 max-w-7xl text-lg text-gray-300">
              <p dangerouslySetInnerHTML={{ __html: review.content }}></p>
            </div>
          </div>
        </div>

        <div className="flex ml-28 justify-left mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-black font-semibold text-lg transition duration-300"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TVReviewPage;
