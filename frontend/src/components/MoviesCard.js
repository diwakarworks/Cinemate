
import React from 'react';

const MoviesCard = ({ posterPath }) => {
    const posterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;

    return (
        <div className="movie-card">
            <img src={posterUrl} alt="Movie Poster" className="w-full h-auto rounded-lg" />
        </div>
    );
};

export default MoviesCard;
