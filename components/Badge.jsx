import React from 'react';

const Badge = ({ text, color = 'blue', size = 'medium' }) => {
    const colors = {
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
    };

    const sizes = {
        small: 'py-1 px-2 text-sm',
        medium: 'py-2 px-4',
        large: 'py-3 px-6 text-lg',
    };

    return (
        <span className={`inline-flex items-center ${colors[color]} ${sizes[size]} text-white rounded`}> 
            {text}  
        </span>
    );
};

export default Badge;
