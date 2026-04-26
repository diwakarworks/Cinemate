import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams} from "react-router-dom";

const API_URL = 'http://localhost:5002';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const Favorites = () => {
    const {userId} = useParams();
    const [user,setUser] = useState();
    const [entry,setEntry] = useState();
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState('');

    // const userId = '6729bdee4d96b9e3cf88229b';

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('token');
            if(!token){
                console.log('No authorization token needed');
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/api/user/${userId}/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log(response.data);
                setFavorites(response.data);
            } catch (err) {
                setError('Failed to fetch favorites');
                console.error(err);
            }
        };

        fetchFavorites();
    }, []);

   

    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <hr className="border-gray-200  mb-2" />
            <h2 className="text-md text-gray-400 text-left font-bold mb-4">FAVORITES</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favorites.map(movie => (
                    <div  className="bg-white rounded-lg shadow-md ">
                        <img
                            src={`${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}`} 
                            alt={movie.title}
                            className="w-30 h-auto" 
                        />
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favorites;
