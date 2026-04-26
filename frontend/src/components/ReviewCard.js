import React from 'react';

const ReviewCard = ({ title, year }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 shadow-md">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <h4 className="font-sm italic text-gray-300 mt-1"> {year}</h4> 
        </div>
    );
};

export default ReviewCard;
