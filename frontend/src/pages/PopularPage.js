import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link ,useNavigate} from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';


const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const PopularPeople = () => {
  const [people, setPeople] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularPeople = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('TMDB token missing in localStorage');
        return;
      }

     try {
        const res = await axios.get('https://api.themoviedb.org/3/person/popular', {
          params: {
            api_key: apiKey, 
            language: 'en-US',
            page: page,
          },
        });
        setPeople(res.data.results);
        setTotalPages(res.data.total_pages);
      } catch (error) {
        console.error('Error fetching popular people:', error);
      }
    };

    fetchPopularPeople();
  }, [page]);

  

  const handleHome = () => {
    navigate('/');
    }
  return (
    <div className="bg-stone-900 min-h-screen text-white px-6 py-10">
      <div className="flex items-center justify-between mb-6">
      <BiArrowBack
                className="absolute -mt-1 w-10 h-10 cursor-pointer  text-white hover:text-blue-500"
                onClick={handleHome}
              />
            </div>
      <h2 className="text-2xl font-bold -mt-11 ml-14">Popular People</h2>
           <hr className="border-gray-700 mt-2 mb-8" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {people.map((person) => (
          <div
            key={person.id}
            className="bg-slate-800 p-3 rounded-lg hover:scale-105 border-2 hover:border-green-500"
          >
            <Link to={`/person/${person.id}`}>
            <img
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                  : '/no-profile.jpg'
              }
              alt={person.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            </Link>
            <h3 className="mt-3 text-lg font-semibold">{person.name}</h3>
            <p className="text-gray-400 text-sm truncate">
              {person.known_for?.map((work) => work.title || work.name).join(', ')}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          « Prev
        </button>
        <span className="px-4 py-2">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Next »
        </button>
      </div>
    </div>
  );
};

export default PopularPeople;
