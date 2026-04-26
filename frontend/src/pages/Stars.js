import React from 'react';

const Stars = ({ rating }) => {
    const maxStars = 10;
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;

    return (
        <div className="flex space-x-0.5"> 
          
            {Array.from({ length: fullStars }).map((_, index) => (
                <div key={`full-${index}`} className="relative inline-block text-lg text-green-500">
                    ★
                </div>
            ))}

          
            {decimalPart > 0 && (
                <div className="relative inline-block text-lg text-gray-400">
               
                    <span className="absolute inset-0 text-green-500 overflow-hidden"
                        style={{ width: `${decimalPart * 100}%` }}>
                        ★
                    </span>
               
                    ★
                </div>
            )}

         
            {Array.from({ length: maxStars - fullStars - (decimalPart > 0 ? 1 : 0) }).map((_, index) => (
                <div key={`empty-${index}`} className="relative inline-block text-lg text-gray-400">
                    ★
                </div>
            ))}
        </div>
    );
};

export default Stars;
