// src/components/CompetitorsProd/DeleteConfirmModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmModal = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleConfirmDelete,
  competitorToDelete,
  error,
}) => {
  return (
    <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#003D5B] mb-4">
              Confirmar Eliminación
            </h2>
            <p className="text-slate-600 mb-6">
              ¿Está seguro que desea eliminar al competidor {competitorToDelete?.name}?
              Esta acción no se puede deshacer.
            </p>
            {error && (
              <div className="text-red-600 mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
