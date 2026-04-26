import React from 'react';

const MovieCard = ({ movie }) => {
    return (
        <div className="max-w-lg mx-auto p-4 border rounded shadow-lg">
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto mb-8 rounded"
            />
            <h2 className="text-2xl text-white font-bold mb-4 ">
                {movie.title} {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
            </h2>
            <p className="text-white"><strong>Rating:</strong> {movie.vote_average ? movie.vote_average : 'N/A'}/10</p>
            <p className="text-white"><strong>Plot:</strong> {movie.overview ? movie.overview : 'N/A'}</p>
            <p className="text-white"><strong>Directed By:</strong> {movie.director ? movie.director.name : 'N/A'}</p>
            <p className="text-white"><strong>Release Date:</strong> {movie.release_date ? movie.release_date : 'N/A'}</p>
            <p className="text-white"><strong>Duration:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}</p>
            <p className="text-white"><strong>Cast:</strong> {movie.cast ? movie.cast.map(member => member.name).join(', ') : 'N/A'}</p>
        </div>
    );
};

export default MovieCard;
