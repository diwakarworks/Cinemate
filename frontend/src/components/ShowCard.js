import React from 'react';
import { Link } from 'react-router-dom';

const ShowCard = ({ show }) => {
    const { name, poster_path, first_air_date, overview } = show;
    const posterUrl = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

    // Format the date
    const formattedDate = new Date(first_air_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
            <Link to={`/show/${show.id}`} className="block">
                <img
                    src={posterUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold">{name}</h3> 
                    <p className="text-sm text-gray-500 font-semibold"> {formattedDate}</p>
                    <p className="text-sm text-gray-300 mt-2">{overview ? overview : 'No overview available'}</p>
                </div>
            </Link>
        </div>
    );
};

export default ShowCard;
