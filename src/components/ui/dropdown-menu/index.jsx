import React, { useState } from 'react';

export const DropdownMenu = ({ children }) => (
  <div className="relative inline-block text-left">
    {children}
  </div>
);

export const DropdownMenuTrigger = ({ children, className }) => (
  <div>
    {children}
  </div>
);

export const DropdownMenuContent = ({ children }) => (
  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
    {children}
  </div>
);

export const DropdownMenuItem = ({ children }) => (
  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
    {children}
  </div>
);