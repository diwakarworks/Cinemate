import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BiArrowBack } from "react-icons/bi";



const API_URL = 'https://cinemate-6k9l.onrender.com'
const ListPosters = () => {
  const { userId, listId } = useParams();
  const [token, setToken] = useState();
  const [movies, setMovies] = useState([]);
  const [listDetails, setListDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      const token = localStorage.getItem('token');


      const res = await axios.get(`${API_URL}/api/lists/${listId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = res.data;
      setMovies(data.movies);
      setListDetails({ name: data.name, description: data.description });
    };

    fetchList();
  }, [listId]);

  const handleBack = () => {
    navigate(`/user/${userId}`)
  }

  const sortedMovies = movies.sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen p-4">
      <h1 className="absolute text-3xl font-bold  ml-24 text-white mb-2 text-left">List</h1>
      <BiArrowBack
        className="w-8 h-8 mt-2 cursor-pointer text-white hover:text-blue-500"
        onClick={handleBack}
      />
      <hr className="border-gray-700 mt-10 mb-10" />

      {listDetails && (
        <>
          <h1 className="text-3xl text-white font-bold mb-4">{listDetails.name}</h1>
          <p className="text-gray-300 font-semibold mb-8">{listDetails.description}</p>
        </>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedMovies.map((movie) => (
          <Link to={`/movie/${movie.tmdbId}`} key={movie._id} className="transition-transform transform hover:scale-105 hover:shadow-lg hover:brightness-110 duration-300">
            <img
              key={movie.id}
              src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
              alt={movie.title}
              className="rounded-lg shadow-md hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-4 left-32 bg-gray-600  pl-2.5 border-2 border-black bg-opacity-100 text-white text-sm font-bold px-2 py-1 w-8 h-8 rounded-full">
              {movie.position}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ListPosters;
