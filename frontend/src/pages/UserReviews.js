import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';

const API_URL = "https://cinemate-6k9l.onrender.com";


const UserReviews = () => {
    const { userId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authorization token found');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/diary/${userId}/entries`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.user && response.data.entries) {
                    setUser(response.data.user);
                    setReviews(response.data.entries);
                } else {
                    setError('User or entries data is missing.');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 text-white">
            <h1 className="text-4xl font-bold text-left  ml-28">{user?.username}'s Reviews</h1>
            <div className="flex items-left">
                <BiArrowBack className=" -mt-9 w-10 h-10 cursor-pointer text-white hover:text-blue-500" onClick={handleHome} />
            </div>
            <hr className="border-gray-700  mt-10 mb-14" />
            <img src={user.profilePic} alt={`${user.username}'s Profile`} className="w-20 h-20 ml-4 rounded-full -mt-4 mx-auto border-4 border-blue-500 mb-6" />
            <h1 className="text-xl font-bold absolute ml-28 -mt-20 text-gray-400 mb-10 text-center ">{user.username}</h1>
            <div className="space-y-10">
                {reviews.length === 0 ? (
                    <p className="text-lg text-center">You have no reviews yet.</p>
                ) : (
                    reviews.map((entry) => (
                        <div key={entry._id} className="bg-gray-800 p-6 h-96 rounded-lg shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <div className="flex flex-col items-start">
                                

                                <Link to={`/movie/${entry.movieId}`} key={entry._id} className="border-2 hover:border-green-500">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${entry.posterPath}`}
                                        alt={entry.title}
                                        className="w-32 h-48 rounded-md shadow-md"
                                    />
                                </Link>
                                
                                <h2 className="text-xl text-center font-semibold ml-40 -mt-48 mb-2">{entry.title} {entry.year}</h2>
                                <p className="text-lg ml-40  mb-4">Rating: {entry.rating}/10</p>
                                <p className="text-sm ml-40 text-gray-400 mb-10">
                                    Watched {new Date(entry.watchedDate).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "2-digit"
                                    })}
                                </p>

                            </div>
                            {user && (
                            <Link to={`/diary/${user?._id}/entries/${entry._id}`} className="flex items-center">
                                <div className="flex items-center ">
                                    <p className="text-lg -mt-10 -ml-80  font-serif text-gray-500 ">{entry.review}</p>
                                </div>
                            </Link>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserReviews;
