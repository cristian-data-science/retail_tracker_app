// src/components/CompetitorsProd/AddCompetitorModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';

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

const AddCompetitorModal = ({
  showAddModal,
  setShowAddModal,
  handleCreateCompetitor,
  isLoading,
  error,
  formData,
  setFormData,
}) => {
  return (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => !isLoading && setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#003D5B] mb-4">
              Agregar Nuevo Competidor
            </h2>

            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleCreateCompetitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del Competidor
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent transition-all"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL del Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({...formData, url: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent transition-all"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoLogo"
                  checked={formData.autoLogo}
                  onChange={e => setFormData({...formData, autoLogo: e.target.checked})}
                  className="rounded text-[#FF6B2B] focus:ring-[#FF6B2B]"
                  disabled={isLoading}
                />
                <label htmlFor="autoLogo" className="text-sm text-slate-700">
                  Obtener logo automáticamente
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => !isLoading && setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#FF6B2B] text-white rounded-lg hover:bg-[#e55b1e] transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Procesando...
                    </>
                  ) : (
                    'Crear Competidor'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCompetitorModal;
