import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const apiKey = process.env.REACT_APP_TMDB_API_KEY;

const PersonDetails = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageCount, setImageCount] = useState(0);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPersonDetails = async () => {
      try {
        const personRes = await axios.get(
          `https://api.themoviedb.org/3/person/${id}`,
          {
            params: { api_key: apiKey },
          },
        );

        const creditsRes = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/movie_credits`,
          {
            params: { api_key: apiKey },
          },
        );

        const imagesRes = await axios.get(
          `https://api.themoviedb.org/3/person/${id}/images`,
          { params: { api_key: apiKey } },
        );

        setImageCount(imagesRes.data.profiles.length);

        setPerson(personRes.data);

        // Combine cast and crew credits
        const allCredits = [
          ...creditsRes.data.cast.map((c) => ({ ...c, role: "Actor" })),
          ...creditsRes.data.crew.map((c) => ({ ...c, role: c.job })),
        ];

        // Remove duplicates by movie ID
        const uniqueCredits = Object.values(
          allCredits.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
          }, {}),
        );

        setCredits(uniqueCredits);
      } catch (err) {
        console.error("Error fetching person details:", err);
        setError("Failed to fetch person details");
      } finally {
        setLoading(false);
      }
    };

    fetchPersonDetails();
  }, [id]);

  if (loading)
    return <p className="text-white text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  const formattedBirthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const formattedDeathday = person.deathday
    ? new Date(person.deathday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Alive";

  const calculateAge = (birthDate, deathDate) => {
    const birthYear = new Date(birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const deathYear = deathDate
      ? new Date(deathDate).getFullYear()
      : currentYear;
    return deathYear - birthYear;
  };

  const personAge = person.birthday
    ? calculateAge(person.birthday, person.deathday)
    : "N/A";

  return (
    <div className="min-h-screen bg-stone-900 text-white p-8">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Image and Personal Info */}
          <div className="flex flex-col space-y-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                    : "https://via.placeholder.com/500x750?text=No+Image"
                }
                alt={person.name}
                className="w-64 h-auto rounded-lg shadow-md"
              />
            </div>

            {/* Personal Info */}
            <div>
              <h2 className="text-xl font-bold mb-4">Personal Info</h2>
              <ul className="text-gray-300 space-y-2">
                <li>
                  <strong>Known For </strong>
                  <br />
                  {person.known_for_department || "N/A"}
                </li>
                <li>
                  <strong>Gender </strong>
                  <br />
                  {person.gender === 1
                    ? "Female"
                    : person.gender === 2
                      ? "Male"
                      : "Other"}
                </li>
                <li>
                  <strong>Birthday </strong>
                  <br />
                  {formattedBirthday}{" "}
                  {personAge !== "N/A" && `(${personAge} years old)`}
                </li>
                <li>
                  <strong>Day of Death </strong>
                  <br />
                  {formattedDeathday}
                </li>
                <li>
                  <strong>Place of Birth </strong>
                  <br />
                  {person.place_of_birth || "N/A"}
                </li>
                <li>
                  <strong>Also Known As </strong>
                  <br />
                  {person.also_known_as && person.also_known_as.length > 0 ? (
                    <ul className="-ml-6 list-none pl-5">
                      {person.also_known_as.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    "N/A"
                  )}
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Name & Bio */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-4 text-center md:text-left">
              {person.name}
            </h1>
            <div className="mt-6">
              <details className="cursor-pointer">
                <summary className="text-lg font-semibold">Media</summary>

                <Link
                  to={`/person/${id}/images`}
                  className="block mt-2 text-gray-400 "
                >
                  Profiles {imageCount} 
                </Link>
              </details>
            </div>  

            <div className="mb-10">
              <h2 className="text-white font-semibold font-serif mb-4 text-xl">
                Biography
              </h2>
              <p className="text-gray-300 italic">
                {person.biography ? (
                  <>
                    {showFullBio
                      ? person.biography
                      : `${person.biography.slice(0, 300)}...`}
                    {person.biography.length > 300 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-blue-500 underline ml-2"
                      >
                        {showFullBio ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </>
                ) : (
                  `No biography available for ${person.name}`
                )}
              </p>
            </div>

            {/* Known For */}
            <div>
              <h2 className="text-xl font-bold mb-4">Known For</h2>
              <div className="flex space-x-4 overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                {credits.slice(0, 20).map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-40">
                    <Link
                      to={`/movie/${movie.id}`}
                      className="movie-card *:p-2"
                    >
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "https://via.placeholder.com/500x750?text=No+Image"
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

export default PersonDetails;
