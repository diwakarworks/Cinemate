import React, { useEffect, useState } from 'react';
import { useParams,Link } from 'react-router-dom';
import axios from 'axios';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const DirectorDetails = () => {
    const { id } = useParams();
    const [director, setDirector] = useState(null);
    const [knownForMovies, setKnownForMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFullBio, setShowFullBio] = useState(false);

    useEffect(() => {
        const fetchDirectorDetails = async () => {
            try {
                const directorResponse = await axios.get(`https://api.themoviedb.org/3/person/${id}`, {
                    params: { api_key: apiKey },
                });

                const movieCreditsResponse = await axios.get(`https://api.themoviedb.org/3/person/${id}/movie_credits`, {
                    params: { api_key: apiKey },
                });

                setDirector(directorResponse.data);
                setKnownForMovies(movieCreditsResponse.data.crew.filter(movie => movie.job === 'Director'));
            } catch (error) {
                console.error('Error fetching director details:', error);
                setError('Failed to fetch director details');
            } finally {
                setLoading(false);
            }
        };

        fetchDirectorDetails();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    
    const formattedBirthday = director.birthday ? new Date(director.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';

    const formattedDeathday = director.deathday? new Date(director.deathday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Alive';
    
    const calculateAge = (birthDate, deathDate) => {
        const birthYear = new Date(birthDate).getFullYear();
        const currentYear = new Date().getFullYear();
        const deathYear = deathDate ? new Date(deathDate).getFullYear() : currentYear;
        return deathYear - birthYear;
    };

    const directorAge = director.birthday
        ? calculateAge(director.birthday, director.deathday)
        : 'N/A'; 

    return (
        <div className="min-h-screen bg-stone-900 text-white p-8">
                <div className="max-w-screen-xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
               
                <div className="flex flex-col space-y-6">
                     <div className="flex-shrink-0">
                    <img
                        src={
                            director.profile_path
                                ? `https://image.tmdb.org/t/p/w500${director.profile_path}`
                                : 'https://via.placeholder.com/500x750?text=No+Image'
                        }
                        alt={director.name}
                        className="w-64  h-auto rounded-lg shadow-md "
                    />
                </div>

                 <div>
                    <h2 className="text-xl font-bold mb-4">Personal Info</h2>
                    <ul className="text-gray-300 space-y-2">
                        <li>
                            <strong>Known For </strong> 
                            <br/>
                            {director.known_for_department}
                        </li>
                        <li>
                            <strong>Gender </strong>
                            <br/>
                             {director.gender === 1 ? 'Female' : 'Male'}
                        </li>
                        <li>
                            <strong>Birthday </strong> 
                            <br/>
                            {formattedBirthday} ({directorAge !== 'N/A' ? `${directorAge} years old` : 'N/A'})
                        </li>
                        <li>
                            <strong>Day of Death </strong>
                            <br/> 
                            {formattedDeathday} ({directorAge !== 'N/A' ? `${directorAge} years old` : 'N/A'})
                        </li>
                        <li>
                            <strong>Place of Birth </strong>
                            <br/> 
                            {director.place_of_birth || 'N/A'}
                        </li>
                        <li>
                            <strong>Also Known As </strong>
                            <br/>
                            {director.also_known_as && director.also_known_as.length > 0 ? (
                                <ul className=" -ml-6 list-none pl-5">
                                    {director.also_known_as.map((name, index) => (
                                        <li key={index}>{name}</li>
                                    ))}
                                </ul>
                            ) : (
                                'N/A'
                            )}
                        </li>

                    </ul>
                    </div>
                    </div>

          
                <div className="md:col-span-2">
                   
                    <h1 className="text-4xl font-bold mb-4 text-center md:text-left">{director.name}</h1>

               
                    <div className="mb-8">
                        <h1 className="text-white font-semibold font-serif mb-4 text-xl">Biography</h1>
                        <p className="text-gray-300 italic">
                            {director.biography ? (
                                <>
                                    {showFullBio ? director.biography : `${director.biography.slice(0, 300)}...`}
                                    {director.biography.length > 300 && (
                                        <button
                                            onClick={() => setShowFullBio(!showFullBio)}
                                            className="text-blue-500 underline ml-2"
                                        >
                                            {showFullBio ? 'Read Less' : 'Read More'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                `No biography available for ${director.name}`
                            )}
                        </p>
                    </div>

                  
                    <div>
                        <h2 className="text-xl font-bold mb-4">Known For</h2>
                        <div className="flex space-x-4 overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                            {knownForMovies.map(movie => (
                                <div key={movie.id} className="flex-shrink-0 w-40">
                                    <Link to={`/movie/${movie.id}`} key={movie.id} className=" movie-card *:p-2">
                                    <img
                                        src={
                                            movie.poster_path
                                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                                : 'https://via.placeholder.com/500x750?text=No+Image'
                                        }
                                        alt={movie.title}
                                        className="rounded-lg shadow-md"
                                    />
                                    </Link>
                                    <p className="mt-2 text-sm text-center">{movie.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </div>
            </div>
            </div>
            
    );
};

export default DirectorDetails;
