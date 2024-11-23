import React from 'react';

const Card = ({ children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 dark:shadow-gray-900 dark:text-gray-100">
      {children}
    </div>
  );
};

export default Card;