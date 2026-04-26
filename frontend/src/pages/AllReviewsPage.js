import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "axios";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const AllReviewsPage = () => {
    const { movieDetailsid } = useParams(); // Ensure the param name matches the one used in your Route
  
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
  
    const getAllReviews = async () => {
      try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieDetailsid}/reviews?api_key=${apiKey}`);
        const data = response.data;
        console.log(response.data);
        setReviews(data.results);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      if (movieDetailsid) {
        getAllReviews(movieDetailsid); // Only fetch reviews if id is available
      }
    }, [movieDetailsid]);
  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl w-full bg-gray-800 p-12 rounded-lg shadow-2xl space-y-8">
        {loading ? (
          <p>Loading reviews...</p>
        ) : (
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-blue-400">{review.author}</h3>
                  <p className="text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</p>
                  <p className="mt-4 text-lg text-gray-300" dangerouslySetInnerHTML={{ __html: review.content }}></p>
                </div>
              ))
            ) : (
              <p>No reviews found for this movie.</p>
            )}
          </div>
        )}

        {/* Back to Movie Details Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-semibold text-lg transition duration-300"
          >
            Back to Movie Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllReviewsPage;
