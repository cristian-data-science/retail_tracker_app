// src/components/CompetitorsProd/ScanModal.jsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings, ChevronDown, RefreshCcw, AlertTriangle, Package, BarChart2, HelpCircle, ChevronRight, LayoutList, BarChart } from 'lucide-react';

const loadingPhrases = [
  "Cazando datos frescos...",
  "Descifrando bits...",
  "Leyendo entre píxeles...",
  "Desempolvando páginas",
  "Sacando jugo a la web",
  "Rastreando información...",
  "Hackeando la paciencia"
];

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
  onCancelScan,  // Agregar esta prop
}) => {
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryView, setCategoryView] = useState('hierarchy'); // 'hierarchy' o 'chart'

  // Modificar el useEffect para manejar errores sin mostrarlos
  useEffect(() => {
    const loadExistingCategories = async () => {
      if (selectedCompetitor?.name) {
        try {
          const response = await fetch(`http://localhost:8000/get-existing-categories/${encodeURIComponent(selectedCompetitor.name)}`);
          
          if (!response.ok) {
            console.log('No se encontraron categorías');
            setCategories([]);
            setLastUpdate(null);
            return;
          }
          
          const data = await response.json();
          
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
            setLastUpdate(data.last_update);
          } else {
            setCategories([]);
            setLastUpdate(null);
          }
        } catch (error) {
          console.log('Error al cargar categorías:', error);
          setCategories([]);
          setLastUpdate(null);
        }
      }
    };

    loadExistingCategories();
  }, [selectedCompetitor]);

  // Limpiar el estado de categorías expandidas cuando cambia el competidor
  useEffect(() => {
    setExpandedCategories({}); // Reset del estado
    setCategories([]); // Reset de categorías
    setLastUpdate(null); // Reset de última actualización
    setCategoriesError(null); // Reset de errores
  }, [selectedCompetitor?.name]); // Se ejecuta cuando cambia el competidor

  // Modificar handleGetCategories para usar los datos correctamente
  const handleGetCategories = async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      // Modificar la URL para usar http://localhost:8000
      const url = `http://localhost:8000/get-categories/?url=${encodeURIComponent(selectedCompetitor.url)}&competitor_name=${encodeURIComponent(selectedCompetitor.name)}`;
      console.log('Requesting categories from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Categorías obtenidas:', data);
      
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      setCategoriesError('Error obteniendo categorías');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isLoadingCategories) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoadingCategories]);

  const handleCancel = async () => {
    if (isRescanningLogo || isRescanningTech) {
      try {
        await onCancelScan();  // Esperar a que se complete la cancelación
      } catch (error) {
        console.error('Error al cancelar el escaneo:', error);
      }
    }
    setShowScanModal(false);
  };

  // Agregar función de normalización
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderCategories = (categories) => {
    return categories.map((category, index) => {
      const categoryId = `${selectedCompetitor?.name}-${category.name}`; // ID único por competidor y categoría
      return (
        <div key={categoryId} className="mb-4">
          <button
            onClick={() => setExpandedCategories(prev => ({
              ...prev,
              [categoryId]: !prev[categoryId]
            }))}
            className="w-full text-sm text-slate-800 font-medium flex items-center gap-2 mb-2 hover:text-[#FF6B2B] transition-colors"
          >
            <motion.div
              animate={{ rotate: expandedCategories[categoryId] ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={16} className="text-[#FF6B2B]" />
            </motion.div>
            <span>{normalizeText(category.name)}</span>
            {category.children && (
              <span className="text-xs text-slate-400 ml-2">
                ({category.children.length})
              </span>
            )}
          </button>

          <AnimatePresence>
            {expandedCategories[categoryId] && category.children && category.children.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="ml-6 space-y-2 py-2">
                  {category.children.map((child, childIndex) => (
                    <a
                      key={childIndex}
                      href={child.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 flex items-center gap-2 hover:text-[#FF6B2B] transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                      {normalizeText(child.name)}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  };

  const renderBarChart = (categories) => {
    const maxChildren = Math.max(...categories.map(cat => cat.children?.length || 0));
    
    return (
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="relative group">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium min-w-[150px]">{normalizeText(category.name)}</span>
              <div className="relative flex-1">
                {/* Barra base */}
                <div className="h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-blue-100 hover:bg-blue-200 transition-all relative"
                    style={{ width: maxChildren > 0 ? `${((category.children?.length || 0) / maxChildren) * 100}%` : '0%' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-end px-3">
                      <span className="text-sm font-medium text-blue-700">
                        {category.children?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tooltip mejorado */}
                {category.children && category.children.length > 0 && (
                  <div className="absolute left-[calc(100%+16px)] top-0 hidden group-hover:block z-50 min-w-[250px]">
                    <div className="bg-white shadow-xl rounded-lg p-4 border border-slate-200">
                      <div className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Package size={14} className="text-blue-600" />
                        {normalizeText(category.name)}
                      </div>
                      <div className="grid gap-2 max-h-[200px] overflow-y-auto">
                        {category.children.map((child, idx) => (
                          <a
                            key={idx}
                            href={child.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-2 transition-colors"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            {normalizeText(child.name)}
                          </a>
                        ))}
                      </div>
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute left-0 top-4 -translate-x-[6px] w-3 h-3 bg-white transform rotate-45 border-l border-b border-slate-200"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
                                value="true"
                                checked={selectedCompetitor?.show_logo === 'true' || selectedCompetitor?.show_logo === true}
                                onChange={() => handleDisplayPreferenceChange(selectedCompetitor, true)}
                                className="mr-2"
                              />
                              <span className="text-sm">Logo</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`display-${selectedCompetitor?.id}`}
                                value="false"
                                checked={selectedCompetitor?.show_logo === 'false' || selectedCompetitor?.show_logo === false}
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

              {/* Sección de Categorías */}
              <motion.div className="border rounded-lg overflow-hidden mb-4">
                <button
                  onClick={() => setOpenSections({ ...openSections, categories: !openSections.categories })}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="text-[#FF6B2B]" size={20} />
                    <span className="font-medium">Categorías</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openSections.categories ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openSections.categories && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 bg-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-slate-900">
                              {categories.length > 0 ? `Categorías (${categories.length})` : 'No hay categorías detectadas'}
                            </h4>
                            {lastUpdate && (
                              <p className="text-xs text-slate-500">
                                Última actualización: {new Date(lastUpdate).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Toggle de vista */}
                            <div className="bg-slate-100 rounded-lg p-1 flex items-center gap-1">
                              <button
                                onClick={() => setCategoryView('hierarchy')}
                                className={`p-1.5 rounded-md transition-colors ${
                                  categoryView === 'hierarchy' 
                                    ? 'bg-white shadow-sm text-[#FF6B2B]' 
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <LayoutList size={18} />
                              </button>
                              <button
                                onClick={() => setCategoryView('chart')}
                                className={`p-1.5 rounded-md transition-colors ${
                                  categoryView === 'chart' 
                                    ? 'bg-white shadow-sm text-[#FF6B2B]' 
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <BarChart size={18} />
                              </button>
                            </div>
                            {/* Botón de escaneo */}
                            <button
                              onClick={handleGetCategories}
                              disabled={isLoadingCategories}
                              className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2
                                ${isLoadingCategories 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300'}`}
                            >
                              {isLoadingCategories ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" />
                                  Escaneando...
                                </>
                              ) : (
                                <>
                                  <RefreshCcw size={14} />
                                  {categories.length > 0 ? 'Re-escanear' : 'Obtener Categorías'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {isLoadingCategories ? (
                          <div className="flex flex-col items-center justify-center p-8">
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              className="w-full max-w-sm text-center"
                            >
                              <Loader2 className="w-8 h-8 mb-4 mx-auto text-[#FF6B2B] animate-spin" />
                              <motion.p
                                key={currentPhraseIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-lg text-slate-600 font-medium"
                              >
                                {loadingPhrases[currentPhraseIndex]}
                              </motion.p>
                              <p className="mt-2 text-sm text-slate-400">
                                Esto puede tomar un momento
                              </p>
                            </motion.div>
                          </div>
                        ) : (
                          <>
                            {categoriesError && (
                              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={12} />
                                {categoriesError}
                              </div>
                            )}

                            {!isLoadingCategories && categories.length === 0 ? (
                              <div className="flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-slate-600">
                                  No hay categorías disponibles.
                                  <br />
                                  <span className="text-sm text-slate-400">
                                    Usa el botón "Obtener Categorías" para comenzar.
                                  </span>
                                </p>
                              </div>
                            ) : (
                              <div className="mt-4 space-y-2">
                                {categoryView === 'hierarchy' ? renderCategories(categories) : renderBarChart(categories)}
                              </div>
                            )}
                          </>
                        )}
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
              onClick={handleCancel}
              className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {(isRescanningTech || isRescanningLogo) ? 'Cancelar Escaneo' : 'Cerrar'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanModal;
