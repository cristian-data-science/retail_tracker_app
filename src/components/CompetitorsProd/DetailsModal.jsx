// src/components/CompetitorsProd/DetailsModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Package, Layers, Newspaper, Megaphone, ClipboardCopy } from 'lucide-react';

const DetailsModal = ({
  showDetailsModal,
  setShowDetailsModal,
  selectedCompetitorDetails,
  setSelectedCompetitorDetails,
  customUrl,
  setCustomUrl,
  isProcessingUrl,
  handleResumeHtml,
  error,
  processedText,
  processedCode,
  wordCount,
  lineCount,
  activeTab,
  setActiveTab,
}) => {
  return (
    <AnimatePresence>
      {showDetailsModal && selectedCompetitorDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Encabezado con logo */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                {selectedCompetitorDetails.logo && selectedCompetitorDetails.logo !== '' ? (
                  <img 
                    src={selectedCompetitorDetails.logo} 
                    alt={selectedCompetitorDetails.name}
                    className="h-16 w-32 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="h-16 w-40 flex items-center justify-center text-xl font-bold text-slate-700 truncate">${selectedCompetitorDetails.name}</div>`;
                    }}
                  />
                ) : (
                  <div className="h-16 w-42 flex items-center justify-start text-xl font-bold text-slate-700 truncate">
                    {selectedCompetitorDetails.name}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-[#003D5B]">
                    {selectedCompetitorDetails.name}
                  </h2>
                  <a 
                    href={selectedCompetitorDetails.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visitar sitio web
                  </a>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCompetitorDetails.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {selectedCompetitorDetails.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Grid de estadísticas */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-blue-900">Productos</h3>
                </div>
                <p className="text-3xl font-bold text-blue-700">0</p>
                <p className="text-sm text-blue-600">productos escrapeados</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="text-purple-600" size={24} />
                  <h3 className="text-lg font-semibold text-purple-900">Categorías</h3>
                </div>
                <p className="text-3xl font-bold text-purple-700">0</p>
                <p className="text-sm text-purple-600">categorías encontradas</p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Newspaper className="text-amber-600" size={24} />
                  <h3 className="text-lg font-semibold text-amber-900">Noticias</h3>
                </div>
                <p className="text-3xl font-bold text-amber-700">0</p>
                <p className="text-sm text-amber-600">últimas noticias</p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Megaphone className="text-rose-600" size={24} />
                  <h3 className="text-lg font-semibold text-rose-900">Campañas</h3>
                </div>
                <p className="text-3xl font-bold text-rose-700">0</p>
                <p className="text-sm text-rose-600">campañas activas</p>
              </div>
            </div>

            {/* Sección única de Resumir HTML */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-[#003D5B] mb-4">
                Resumir HTML del Competidor
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="url"
                    value={customUrl || selectedCompetitorDetails.url}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="URL a procesar"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent"
                  />
                  <button
                    onClick={() => handleResumeHtml(customUrl || selectedCompetitorDetails.url)}
                    disabled={isProcessingUrl}
                    className="px-4 py-2 bg-[#FF6B2B] text-white rounded-lg hover:bg-[#e55b1e] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isProcessingUrl ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Procesando...
                      </>
                    ) : (
                      'Procesar URL'
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    {error}
                  </div>
                )}

                {(processedText || processedCode) && (
                  <div className="space-y-3">
                    <div className="flex gap-2 border-b">
                      <button
                        onClick={() => setActiveTab('texto')}
                        className={`px-4 py-2 ${
                          activeTab === 'texto'
                            ? 'border-b-2 border-[#FF6B2B] text-[#FF6B2B] font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        Texto ({wordCount} palabras)
                      </button>
                      <button
                        onClick={() => setActiveTab('codigo')}
                        className={`px-4 py-2 ${
                          activeTab === 'codigo'
                            ? 'border-b-2 border-[#FF6B2B] text-[#FF6B2B] font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        HTML ({lineCount} líneas)
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        {activeTab === 'texto' 
                          ? `Texto procesado (${wordCount} palabras)`
                          : `HTML resumido (${lineCount} líneas)`}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(
                          activeTab === 'texto' ? processedText : processedCode
                        )}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ClipboardCopy size={14} />
                        Copiar {activeTab === 'texto' ? 'texto' : 'código'}
                      </button>
                    </div>

                    <div className="relative">
                      <pre className={`p-4 bg-slate-50 rounded-lg text-sm overflow-x-auto max-h-[400px] overflow-y-auto ${
                        activeTab === 'codigo' ? 'whitespace-pre' : 'whitespace-pre-wrap'
                      }`}>
                        {activeTab === 'texto' ? processedText : processedCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium mt-6"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailsModal;
