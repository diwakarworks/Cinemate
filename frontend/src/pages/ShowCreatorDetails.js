import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const ShowCreatorDetails = () => {
  const { creatorId } = useParams();
  const [creator, setCreator] = useState(null);
  const [knownForShows, setKnownForShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchCreatorDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/person/${creatorId}?api_key=${apiKey}&append_to_response=combined_credits`
        );
        setCreator(response.data);
        setKnownForShows(
          response.data.combined_credits?.crew?.filter((show) => show.department === 'Creator')
        );
      } catch (error) {
        console.error('Error fetching creator details:', error);
        setError('Failed to fetch creator details');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorDetails();
  }, [creatorId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const formattedBirthday = creator.birthday
    ? new Date(creator.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const formattedDeathday = creator.deathday
    ? new Date(creator.deathday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Alive';

  const calculateAge = (birthDate, deathDate) => {
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const deathYear = deathDate ? new Date(deathDate).getFullYear() : currentYear;
    return deathYear - birthYear;
  };

  const creatorAge = creator.birthday
    ? calculateAge(creator.birthday, creator.deathday)
    : 'N/A';

  return (
    <div className="p-8 text-white max-w-screen-xl min-h-screen mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="flex flex-col space-y-6">
        <div className="flex-shrink-0">
          <img
            src={
              creator.profile_path
                ? `https://image.tmdb.org/t/p/w500${creator.profile_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image'
            }
            alt={creator.name}
            className="w-64 h-auto rounded-lg shadow-md"
          />
        </div>

          <div>
          <h2 className="text-xl font-bold mb-4">Personal Info</h2>
          <ul className="text-gray-300 space-y-2">
            <li>
              <strong>Known For </strong>
              <br />
              {creator.known_for_department}
            </li>
            <li>
              <strong>Gender </strong>
              <br />
              {creator.gender === 1 ? 'Female' : 'Male'}
            </li>
            <li>
              <strong>Birthday </strong>
              <br />
              {formattedBirthday} ({creatorAge !== 'N/A' ? `${creatorAge} years old` : 'N/A'})
            </li>
            <li>
              <strong>Day of Death </strong>
              <br />
              {formattedDeathday} ({creatorAge !== 'N/A' ? `${creatorAge} years old` : 'N/A'})
            </li>
            <li>
              <strong>Place of Birth </strong>
              <br />
              {creator.place_of_birth || 'N/A'}
            </li>
            <li>
              <strong>Also Known As </strong>
              <br />
              {creator.also_known_as && creator.also_known_as.length > 0 ? (
                <ul className="-ml-6 list-none pl-5">
                  {creator.also_known_as.map((name, index) => (
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
          <h1 className="text-4xl font-bold mb-4 text-center md:text-left">{creator.name}</h1>

          <div className="mb-8">
            <h1 className="text-white font-semibold font-serif mb-4 text-xl">Biography</h1>
            <p className="text-gray-300 italic">
              {creator.biography ? (
                <>
                  {showFullBio ? creator.biography : `${creator.biography.slice(0, 300)}...`}
                  {creator.biography.length > 300 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-blue-500 underline ml-2"
                    >
                      {showFullBio ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </>
              ) : (
                `No biography available for ${creator.name}`
              )}
            </p>
          </div>
    

          <div>
            <h2 className="text-xl font-bold mb-4">Known For</h2>
            <div className="flex space-x-4 overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {knownForShows.map((show) => (
                <div key={show.id} className="flex-shrink-0 w-40">
                  <Link to={`/show/${show.id}`} key={show.id} className="movie-card p-2">
                    <img
                      src={
                        show.poster_path
                          ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                          : 'https://via.placeholder.com/500x750?text=No+Image'
                      }
                      alt={show.name}
                      className="rounded-lg shadow-md"
                    />
                  </Link>
                  <p className="mt-2 text-sm text-center">{show.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        </div>

      

  );
};

export default ShowCreatorDetails;
