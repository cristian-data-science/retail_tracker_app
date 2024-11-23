// src/components/CompetitorsProd/ScanModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings, ChevronDown, RefreshCcw, AlertTriangle, Package, BarChart2, HelpCircle } from 'lucide-react';

const ScanModal = ({
  showScanModal,
  setShowScanModal,
  selectedCompetitor,
  handleDisplayPreferenceChange,
  isRescanningLogo,
  handleRescanLogo,
  rescanError,
  openPreferences,
  setOpenPreferences,
  openSections,
  setOpenSections,
  isRescanningTech,
  handleRescanTechnology,
  rescanTechError,
  cmsLogos,
}) => {
  return (
    <AnimatePresence>
      {showScanModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowScanModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#003D5B] mb-2">
              Configuración de Escaneo
            </h2>
            <p className="text-slate-600 mb-6">
              Configurar opciones de escaneo para {selectedCompetitor?.name}
              <br />
              <span className="text-sm text-slate-400">URL: {selectedCompetitor?.url || 'No disponible'}</span>
            </p>
            
            <div className="space-y-4">
              {/* Sección de Preferencias de Visualización */}
              <motion.div className="border rounded-lg overflow-hidden mb-4">
                <button
                  onClick={() => setOpenPreferences(!openPreferences)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="text-[#FF6B2B]" size={20} />
                    <span className="font-medium">Preferencias de Visualización</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openPreferences ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openPreferences && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-6 bg-white">
                        {/* Logo preferences */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-slate-900">Mostrar como:</h4>
                          <div className="flex gap-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`display-${selectedCompetitor?.id}`}
                                checked={selectedCompetitor?.showLogo === true}
                                onChange={() => handleDisplayPreferenceChange(selectedCompetitor, true)}
                                className="mr-2"
                              />
                              <span className="text-sm">Logo</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`display-${selectedCompetitor?.id}`}
                                checked={selectedCompetitor?.showLogo === false}
                                onChange={() => handleDisplayPreferenceChange(selectedCompetitor, false)}
                                className="mr-2"
                              />
                              <span className="text-sm">Nombre</span>
                            </label>
                          </div>
                          
                          {/* Logo preview and rescan */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              {selectedCompetitor?.logo && (
                                <>
                                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                    <img
                                      src={selectedCompetitor.logo}
                                      alt="Vista previa"
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500">Logo actual</span>
                                </>
                              )}
                            </div>
                            <button
                              onClick={() => handleRescanLogo(selectedCompetitor)}
                              disabled={isRescanningLogo}
                              className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2
                                ${isRescanningLogo 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300'}`}
                            >
                              {isRescanningLogo ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Escaneando...
                                </>
                              ) : (
                                <>
                                  <RefreshCcw size={14} />
                                  Re-escanear Logo
                                </>
                              )}
                            </button>
                          </div>
                          {rescanError && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                              <AlertTriangle size={12} />
                              {rescanError}
                            </div>
                          )}
                        </div>

                        {/* Sección de Tecnología */}
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="text-sm font-medium text-slate-900">Tecnología detectada:</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {selectedCompetitor?.technology && cmsLogos[selectedCompetitor.technology.toLowerCase()] ? (
                                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center p-1">
                                  <img
                                    src={cmsLogos[selectedCompetitor.technology.toLowerCase()]}
                                    alt={selectedCompetitor.technology}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              ) : null}
                              <span className="text-sm">{selectedCompetitor?.technology || 'Desconocido'}</span>
                            </div>
                            <button
                              onClick={() => handleRescanTechnology(selectedCompetitor)}
                              disabled={isRescanningTech}
                              className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2
                                ${isRescanningTech 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300'}`}
                            >
                              {isRescanningTech ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Escaneando...
                                </>
                              ) : (
                                <>
                                  <RefreshCcw size={14} />
                                  Re-detectar
                                </>
                              )}
                            </button>
                          </div>
                          {rescanTechError && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                              <AlertTriangle size={12} />
                              {rescanTechError}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Secciones adicionales (Productos, Categorías, Noticias, RRSS) */}
              {/* Puedes agregar aquí las demás secciones siguiendo el mismo patrón */}

              {/* Programación de Escaneo */}
              <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-medium mb-4">Programación de Escaneo</h3>
                <div className="flex gap-4">
                  <button className="flex-1 px-4 py-2 bg-[#FF6B2B] text-white rounded-lg hover:bg-[#e55b1e] transition-colors">
                    Escanear Ahora
                  </button>
                  <button className="flex-1 px-4 py-2 border border-[#FF6B2B] text-[#FF6B2B] rounded-lg hover:bg-[#FF6B2B] hover:text-white transition-colors">
                    Programar Escaneo
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowScanModal(false)}
              className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanModal;
