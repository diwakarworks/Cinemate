import React, { useEffect, useState } from 'react';
import Favorites from '../components/Favorites';
import axios from 'axios';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const API_URL = 'http://localhost:5002';

const Profile = ({ }) => {
    const { userId } = useParams();
    const [movie, setMovie] = useState();
    const [badges, setBadges] = useState([]);
    const [user, setUser] = useState(null);
    const [recentEntries, setRecentEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();




    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authorization token found');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                setError(error.response ? error.response.data.message : 'Error fetching profile');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchDiaryMovies = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No authorization token found');
                return;
            }

            try {
                // const userId = "6729bdee4d96b9e3cf88229b"
                const response = await axios.get(`${API_URL}/api/diary/${userId}/entries`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log(response.data);



                const entries = response.data.entries;



                if (Array.isArray(entries)) {

                    const sortedEntries = entries.sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate));


                    if (sortedEntries.length > 0) {
                        setRecentEntries(sortedEntries.slice(0, 4));
                    } else {
                        setRecentEntries([]);
                        console.log('No entries available');
                    }
                } else {
                    console.error('Response data is not an array:', response.data);
                }
            } catch (error) {
                console.error('Error fetching recent diary entries:', error);
            }
        };

        fetchDiaryMovies();
    }, [userId]);

    useEffect(() => {
        const calculateBadges = () => {
            if (user && user.stats) {
                const userStats = user.stats;
                const newBadges = [];

                if (userStats.totalMoviesWatched > 40) newBadges.push('Screen Savant');
                if (userStats.favoriteGenres && userStats.favoriteGenres['Action'] > 5) {
                    newBadges.push('Action Aficionado');
                }
                if (userStats.favoriteGenres && userStats.favoriteGenres['Drama'] > 8) {
                    newBadges.push('Drama Connoisseur');
                }
                if (userStats.favoriteGenres && userStats.favoriteGenres['Comedy'] > 7) {
                    newBadges.push('Comedy Champion');
                }
                if (userStats.favoriteGenres && userStats.favoriteGenres['Thriller'] > 5) {
                    newBadges.push('Thriller Seeker');
                }
                if (userStats.favoriteGenres && userStats.favoriteGenres['Mystery'] > 3) {
                    newBadges.push('Mystery Maven');
                }

                setBadges(newBadges);
            }
        };

        calculateBadges();
    }, [user]);

    if (loading) return <p>Loading user profile...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!user) return <p>User profile not found.</p>;

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    const handleHome = () => {
        navigate('/');
    };


    const handleViewLists = () => {
            navigate(`/user/${user.id}`);
    }

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStars = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStars;

        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<FaStar key={`full-${i}`} />);
        }
        if (halfStars) {
            stars.push(<FaStarHalfAlt key="half" />);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<FaRegStar key={`empty-${i}`} />);
        }

        return stars;
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-stone-900 py-8 px-4">
            <div className="bg-stone-900 shadow-xl rounded-lg p-12 max-w-3xl w-full text-center space-y-8 transform transition-all duration-300">
                <h2 className="text-3xl font-semibold absolute -mt-1 ml-28 text-white">{user.username}</h2>
                <div className="flex items-left">
                    <BiArrowBack
                        className="-mt-9 w-10 h-10 cursor-pointer text-white hover:text-blue-500"
                        onClick={handleHome}
                    />
                </div>
                <hr className="border-gray-700 mt-10 mb-14" />

                <img
                    src={user.profilePic}
                    alt={`${user.username}'s Profile`}
                    className="w-40 h-40 rounded-full -mt-4 mx-auto border-2 border-gray-500 mb-6"
                />

                <Favorites userId={userId} />

                <hr className="border-gray-200 mb-2" />


                <h3 className="mt-10 text-md text-left font-bold text-gray-400">RECENT ACTIVITY</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {recentEntries && recentEntries.length > 0 ? (
                        recentEntries.map((entry) => (
                            <div key={entry._id} className=" p-4 rounded shadow-md">
                                <Link
                                    to={`/diary/${user.id}/entries/${entry._id}`}>
                                    <img
                                        src={entry.posterPath}
                                        alt={entry.title}
                                        className="rounded mb-4"
                                    />
                                </Link>

                                <p className="text-gray-400 flex items-center space-x-1">{entry.rating ? getStarRating(entry.rating) : 'N/A'}</p>
                            </div>
                        ))
                    ) : (
                        <p>No recent activity yet.</p>
                    )}
                </div>


                <ul>
                    <li
                        className="flex justify-between absolute mt-64 ml-72 items-center cursor-pointer"
                        onClick={handleSignOut}
                    >
                        <div className="flex items-center">
                            <FiLogOut className="mr-2" />
                            <span className="text-gray-400">Sign Out</span>
                        </div>
                    </li>
                </ul>
                <hr className="border-gray-200 mb-2" />

               

                <h3 className="mt-10 text-md text-left text-gray-600">BADGES</h3>
                <ul className="grid grid-cols-3 gap-6 mt-6 mx-auto max-w-md">
                    {badges.map((badge) => (
                        <li
                            key={badge}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-md px-5 py-2 rounded-full text-center"
                        >
                            {badge}
                        </li>
                    ))}
                </ul>
                <div className = "flex justify-end">
                 <button
                    onClick={handleViewLists}
                    className="absolute -mt-2 bg-green-600 text-black px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                    Lists
                </button>
                </div>
                
            </div>
        </div>

    );
};

export default Profile;
