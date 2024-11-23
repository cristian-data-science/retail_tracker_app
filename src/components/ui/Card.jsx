// src/components/ui/card.jsx

import React from 'react';

export const Card = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 dark:shadow-gray-900">
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div className={`mb-4 dark:text-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <h3 className={`text-lg font-semibold dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className }) => (
  <div className={`dark:text-gray-300 ${className}`}>
    {children}
  </div>
);
