// src/components/CompetitorsProd/ErrorMessage.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2"
  >
    <AlertTriangle size={20} />
    <span>{message}</span>
  </motion.div>
);

export default ErrorMessage;
