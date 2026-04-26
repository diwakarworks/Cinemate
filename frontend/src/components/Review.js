
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Review = () => {
    const { userId, entryId } = useParams();
    const [entry, setEntry] = useState(null);

    useEffect(() => {
        const fetchEntry = async () => {
            const response = await axios.get(`/api/diary/${userId}/entries`);
            setEntry(response.data);
        };
        fetchEntry();
    }, [userId, entryId]);

    if (!entry) return <p>Loading...</p>;

    return (
        <div className="text-gray-900 p-8 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-semibold mb-4">Your Diary Entry</h2>
            <div className="flex items-center">
                <img src={`https://image.tmdb.org/t/p/w200${entry.posterPath}`} alt={entry.title} className="w-32 h-48 object-cover mr-6" />
                <div>
                    <h3 className="text-2xl font-bold">{entry.title}</h3>
                    <p>{entry.releaseYear}</p>
                    <p>Rating: {entry.rating}/10</p>
                    <p className="mt-4 text-lg">{entry.review}</p>
                </div>
            </div>
        </div>
    );
};

export default Review;
