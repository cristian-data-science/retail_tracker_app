// src/components/CompetitorsProd/ScanModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Settings, ChevronDown, RefreshCcw, AlertTriangle, Package, BarChart2, HelpCircle, ChevronRight, LayoutList, BarChart, Link } from 'lucide-react';

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
  setIsRescanningLogo, // Nueva prop
  handleRescanLogo,    // Nueva prop
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
  const [scanningStates, setScanningStates] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryView, setCategoryView] = useState('hierarchy'); // 'hierarchy' o 'chart'
  const [productLinks, setProductLinks] = useState([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [linksError, setLinksError] = useState(null);
  const [lastProductUpdate, setLastProductUpdate] = useState(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null); // Agregar estado para el enlace seleccionado
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState(null);
  const [showTextModal, setShowTextModal] = useState(false);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentedText, setSegmentedText] = useState(null);
  const [segmentError, setSegmentError] = useState(null);
  const [segmentedTextHistory, setSegmentedTextHistory] = useState({}); // Para mantener el historial
  const [hasExtractedText, setHasExtractedText] = useState(false);
  const [processedLinks, setProcessedLinks] = useState({});
  const [segmentedTextByLink, setSegmentedTextByLink] = useState({});

  // Agregar estado para el conteo de categorías
  const [categoryStats, setCategoryStats] = useState({
    total: 0,
    parent: 0,
    child: 0
  });

  // Referencia para almacenar los intervalos de polling
  const pollIntervals = useRef({});

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      Object.values(pollIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  // Modificar el useEffect para manejar errores sin mostrarlos
  useEffect(() => {
    const loadExistingCategories = async () => {
      if (selectedCompetitor?.name) {
        try {
          console.log('[LOAD] Intentando cargar categorías para:', selectedCompetitor.name);
          const response = await fetch(
            `http://localhost:8000/api/get-existing-categories/${encodeURIComponent(selectedCompetitor.name.toLowerCase())}`
          );
          
          if (!response.ok) {
            console.log('[LOAD] Error al cargar categorías:', response.status);
            setCategories([]);
            setLastUpdate(null);
            return;
          }
          
          const data = await response.json();
          console.log('[LOAD] Datos recibidos:', data);
          
          if (data.categories && Array.isArray(data.categories)) {
            console.log('[LOAD] Categorías encontradas:', data.categories.length);
            const parentCount = data.categories.length;
            const childCount = data.categories.reduce((acc, category) => 
              acc + (category.children?.length || 0), 0);
            
            setCategoryStats({
              total: parentCount + childCount,
              parent: parentCount,
              child: childCount
            });
            
            setCategories(data.categories);
            setLastUpdate(data.last_update);
          } else {
            console.log('[LOAD] No se encontraron categorías válidas');
            setCategories([]);
            setLastUpdate(null);
          }
        } catch (error) {
          console.error('[LOAD] Error al cargar categorías:', error);
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
    if (!selectedCompetitor?.id) return;

    setScanningStates(prev => ({
      ...prev,
      [selectedCompetitor.id]: true
    }));
    setCategoriesError(null);

    try {
      // 1. Escanear categorías
      const scanResponse = await fetch(
        `http://localhost:8000/api/scan-categories/?url=${encodeURIComponent(selectedCompetitor.url)}&competitor_name=${encodeURIComponent(selectedCompetitor.name)}`,
        { method: 'POST' }
      );
      
      if (!scanResponse.ok) {
        throw new Error(`Error HTTP: ${scanResponse.status}`);
      }
      
      // 2. Cargar categorías inmediatamente después del escaneo
      const loadResponse = await fetch(
        `http://localhost:8000/api/get-existing-categories/${encodeURIComponent(selectedCompetitor.name.toLowerCase())}`
      );
      
      if (!loadResponse.ok) {
        throw new Error('Error cargando categorías actualizadas');
      }
      
      const data = await loadResponse.json();
      
      if (data.categories && Array.isArray(data.categories)) {
        setCategories(data.categories);
        setLastUpdate(data.last_update);
        console.log('Categorías actualizadas cargadas exitosamente'); // Cambiado logger.info por console.log
      }
      
      setScanningStates(prev => ({
        ...prev,
        [selectedCompetitor.id]: false
      }));
      
    } catch (error) {
      console.error('Error detallado:', error);
      setCategoriesError('Error obteniendo categorías');
      setScanningStates(prev => ({
        ...prev,
        [selectedCompetitor.id]: false
      }));
    }
  };

  // Modificar la parte del renderizado donde se muestra el estado de carga
  const isLoadingCategories = scanningStates[selectedCompetitor?.id] || false;

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

  // Modificar la función normalizeText para manejar mejor los valores nulos
  const normalizeText = (text) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderCategories = (categories) => {
    if (!Array.isArray(categories)) {
      return null;
    }
  
    return categories.map((category, index) => {
      if (!category || !category.name) return null;
  
      const categoryId = `${selectedCompetitor?.name}-${category.name}`;
      return (
        <div key={categoryId || index} className="mb-4">
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
            <span>{normalizeText(category.name || '')}</span>
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
                    child && (
                      <a
                        key={childIndex}
                        href={child.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 flex items-center gap-2 hover:text-[#FF6B2B] transition-colors"
                      >
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        {normalizeText(child.name || '')}
                      </a>
                    )
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }).filter(Boolean); // Eliminar elementos nulos
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
                {/* Cambiar las clases de color aquí */}
                <div className="h-8 bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  <div 
                    className="h-full bg-blue-200 hover:bg-blue-300 transition-all relative"
                    style={{ width: maxChildren > 0 ? `${((category.children?.length || 0) / maxChildren) * 100}%` : '0%' }}
                  >
                    <div className="absolute inset-0 flex items-center justify-end px-3">
                      <span className="text-sm font-medium text-blue-800">
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

  const handleGetProductLinks = async () => {
    setIsLoadingLinks(true);
    setLinksError(null);
    setProductLinks([]); // Limpiar enlaces anteriores
    
    try {
        // 1. Iniciar el escaneo
        const scanResponse = await fetch(
            `http://localhost:8000/api/products/scan-links/?url=${encodeURIComponent(selectedCompetitor.url)}&competitor_name=${encodeURIComponent(selectedCompetitor.name)}`,
            { method: 'POST' }
        );
      
        if (!scanResponse.ok) {
            throw new Error(`Error HTTP: ${scanResponse.status}`);
        }
      
        const { scan_id } = await scanResponse.json();
        console.log('Scan initiated with ID:', scan_id);
      
        // 2. Polling del estado
        const pollInterval = setInterval(async () => {
            try {
                const statusResponse = await fetch(`http://localhost:8000/api/products/scan-status/${scan_id}`);
                const statusData = await statusResponse.json();
                console.log('Status response:', statusData); // Para debugging
                
                if (statusData.status === 'completed') {
                    clearInterval(pollInterval);
                    setIsLoadingLinks(false);
                    
                    if (statusData.result && statusData.result.product_links) {
                        setProductLinks(statusData.result.product_links);
                        console.log(`Se encontraron ${statusData.result.product_links.length} enlaces`);
                    } else {
                        console.log('No se encontraron enlaces en la respuesta');
                        setLinksError('No se encontraron enlaces de productos');
                    }
                } else if (statusData.status === 'error') {
                    clearInterval(pollInterval);
                    setIsLoadingLinks(false);
                    setLinksError(statusData.error || 'Error al obtener enlaces');
                }
            } catch (error) {
                clearInterval(pollInterval);
                setIsLoadingLinks(false);
                setLinksError('Error en la consulta de estado');
                console.error('Error polling status:', error);
            }
        }, 2000);
        
    } catch (error) {
        console.error('Error initiating scan:', error);
        setLinksError('Error iniciando el escaneo de productos');
        setIsLoadingLinks(false);
    }
};

useEffect(() => {
  const loadExistingLinks = async () => {
    if (selectedCompetitor?.name) {
      try {
        const response = await fetch(`http://localhost:8000/api/products/existing-links/${encodeURIComponent(selectedCompetitor.name)}`);
        
        if (!response.ok) {
          console.log('No se encontraron enlaces');
          setProductLinks([]);
          setLastProductUpdate(null);
          return;
        }
        
        const data = await response.json();
        if (data.links) {
          setProductLinks(data.links);
          setLastProductUpdate(data.last_update);
        }
      } catch (error) {
        console.log('Error al cargar enlaces:', error);
        setProductLinks([]);
        setLastProductUpdate(null);
      }
    }
  };

  loadExistingLinks();
}, [selectedCompetitor]);

useEffect(() => {
  if (productLinks.length > 0 && !selectedProductCategory) {
    const uniqueCategories = [...new Set(productLinks.map(item => item.category))];
    if (uniqueCategories.length > 0) {
      setSelectedProductCategory(uniqueCategories[0]);
    }
  }
}, [productLinks]);

// Modificar handleExtractText para incluir opciones específicas
const handleExtractText = async () => {
  if (!selectedLink) {
    console.log('No hay enlace seleccionado');
    return;
  }
  
  try {
    setIsExtracting(true);
    const response = await fetch(`http://localhost:9000/extract_text?url=${encodeURIComponent(selectedLink)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.text) {
      const formattedText = data.text
        .split('\n')
        .filter(line => line.trim() !== '___' && line.trim() !== '')
        .join('\n');
      
      setExtractedText(formattedText);
      setProcessedLinks(prev => ({
        ...prev,
        [selectedLink]: formattedText
      }));
      setShowTextModal(true);
    }
  } catch (error) {
    console.error('Error al extraer texto:', error);
  } finally {
    setIsExtracting(false);
  }
};

const handleSegmentText = async () => {
  if (!extractedText) {
    console.log('No hay texto para segmentar');
    return;
  }
  
  setIsSegmenting(true);
  setSegmentError(null);
  setSegmentedText(null);

  try {
    console.log('Enviando texto para segmentar:', extractedText); // Debug

    const response = await fetch('http://localhost:9000/segment-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: extractedText }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta recibida:', data); // Debug

    // Parsear el resultado si viene como string
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    
    setSegmentedText(parsedData);
    
  } catch (error) {
    console.error('Error en segmentación:', error);
    setSegmentError(error.message);
  } finally {
    setIsSegmenting(false);
  }
};

const renderProductLinks = (links = []) => {  // Añadir valor por defecto
  const uniqueCategories = [...new Set(links.map(item => item?.category || ''))];

  return (
    <div className="space-y-6">
      {/* Categorías en horizontal */}
      <div className="flex flex-col gap-4">
        <div className="flex space-x-2 overflow-x-auto">
          {uniqueCategories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedProductCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedProductCategory === category 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
        
        {/* Botones de acción actualizados */}
        <div className="flex items-center gap-2">
          {/* Botón Obtener Texto */}
          <motion.button
            onClick={handleExtractText}
            disabled={!selectedLink || isExtracting}
            className={`w-[140px] text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2
              ${!selectedLink || isExtracting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300'}`}
            whileHover={selectedLink && !isExtracting ? { scale: 1.02 } : {}}
            whileTap={selectedLink && !isExtracting ? { scale: 0.98 } : {}}
          >
            {isExtracting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Extrayendo...</span>
              </>
            ) : (
              'Obtener Texto'
            )}
          </motion.button>

          {/* Botón Mostrar Texto - Solo visible si hay texto extraído */}
          {processedLinks[selectedLink] && (
            <motion.button
              onClick={() => {
                setExtractedText(processedLinks[selectedLink]);
                setShowTextModal(true);
              }}
              className="w-[140px] text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-2
                text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <HelpCircle size={14} />
              Mostrar Texto
            </motion.button>
          )}
        </div>
      </div>

      {/* Lista de enlaces */}
      <AnimatePresence mode="wait">
        {selectedProductCategory && (
          <motion.div
            key={selectedProductCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-slate-50 rounded-lg p-4"
          >
            {/* Header con contador de enlaces */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-slate-900">
                  {selectedProductCategory}
                </h4>
                <span className="text-xs text-slate-500">
                  ({links.find(item => item.category === selectedProductCategory)?.links.length || 0} enlaces)
                </span>
              </div>
            </div>

            {/* Lista de enlaces */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {links
                .find(item => item.category === selectedProductCategory)
                ?.links.map((linkUrl, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.03 }
                    }}
                  >
                    <input
                      type="radio"
                      name="selectedLink"
                      value={linkUrl}
                      checked={selectedLink === linkUrl}
                      onChange={(e) => setSelectedLink(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-slate-600 flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      <Link size={14} className="flex-shrink-0 text-slate-400" />
                      <span className="truncate">{linkUrl}</span>
                    </a>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TextModal = ({ extractedText, onClose }) => {
  const [localSegmentedText, setLocalSegmentedText] = useState(null);
  const [localIsSegmenting, setLocalIsSegmenting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 1. Agregar estado para controlar la aparición suave
  const [isSegmentedVisible, setIsSegmentedVisible] = useState(false);

  // 2. Modificar useEffect para manejar la transición suave
  useEffect(() => {
    if (selectedLink && segmentedTextByLink[selectedLink]) {
      // Primero establecemos los datos
      setLocalSegmentedText(segmentedTextByLink[selectedLink]);
      // Luego activamos la visibilidad con un pequeño delay
      setTimeout(() => setIsSegmentedVisible(true), 50);
    }
  }, [selectedLink]);

  // 3. Modificar handleLocalSegment para manejar las transiciones
  const handleLocalSegment = async (e) => {
    e.preventDefault();
    if (!extractedText || !selectedLink) return;

    setLocalIsSegmenting(true);
    setLocalError(null);
    // Ocultar suavemente el contenido anterior si existe
    setIsSegmentedVisible(false);

    try {
        const response = await fetch('http://localhost:9000/segment-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ text: extractedText })
        });

        // Primero obtener el texto de la respuesta para debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        // Intentar parsear la respuesta
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Error parsing JSON:', e);
            throw new Error('Error al parsear la respuesta del servidor');
        }

        console.log('Datos recibidos:', data);

        // Validar la estructura de los datos
        if (!data || typeof data !== 'object') {
            throw new Error('Formato de respuesta inválido');
        }

        // Normalizar los datos
        const normalizedData = {
            name: data.name || 'No especificado',
            price: parseInt(data.price) || 0,
            colors: Array.isArray(data.colors) ? data.colors : [],
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
            sku: data.sku || 'No especificado',
            description_product: Array.isArray(data.description_product) ? data.description_product : [],
            features_product: Array.isArray(data.features_product) ? data.features_product : [],
            materials_product: Array.isArray(data.materials_product) ? data.materials_product : []
        };

        console.log('Datos normalizados:', normalizedData);
        setLocalSegmentedText(normalizedData);
        setSegmentedTextByLink(prev => ({
          ...prev,
          [selectedLink]: normalizedData
        }));
        
      // Mostrar con transición suave
      setTimeout(() => setIsSegmentedVisible(true), 50);
    } catch (error) {
        console.error('Error detallado:', error);
        setLocalError(error.message);
    } finally {
        setLocalIsSegmenting(false);
    }
};

  useEffect(() => {
    if (selectedLink && segmentedTextByLink[selectedLink]) {
      setLocalSegmentedText(segmentedTextByLink[selectedLink]);
    }
  }, [selectedLink]);

  const renderObjectProperties = (obj) => {
    if (!obj) return null;
    return Object.entries(obj).map(([key, value]) => (
      <div key={key} className="flex items-start gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase basis-1/4">{key}:</span>
        <span className="text-sm text-slate-700 flex-1">{value}</span>
      </div>
    ));
  };

  return (
    <AnimatePresence>
      {showTextModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-b from-slate-50 to-white rounded-xl p-6 w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Package className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Contenido del Producto</h3>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Texto extraído */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-slate-800">Texto Extraído</h4>
                  <motion.button
                    onClick={handleLocalSegment}
                    disabled={localIsSegmenting}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                      ${localIsSegmenting 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    whileHover={!localIsSegmenting ? { scale: 1.02 } : {}}
                    whileTap={!localIsSegmenting ? { scale: 0.98 } : {}}
                  >
                    {localIsSegmenting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Segmentando...
                      </>
                    ) : (
                      'Segmentar Texto'
                    )}
                  </motion.button>
                </div>
                <div className="prose prose-sm max-w-none bg-slate-50 rounded-lg p-4 h-[600px] overflow-y-auto">
                  {extractedText.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line.startsWith('#') ? (
                        <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">
                          {line.replace('#', '')}
                        </h3>
                      ) : line.startsWith('##') ? (
                        <h4 className="text-base font-semibold text-slate-800 mt-3 mb-2">
                          {line.replace('##', '')}
                        </h4>
                      ) : (
                        <p className="text-sm text-slate-600 my-1.5 leading-relaxed">
                          {line}
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Texto segmentado */}
              {localSegmentedText && (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isSegmentedVisible ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-slate-800">Datos Estructurados</h4>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      Procesado
                    </motion.span>
                  </div>
                  
                  <motion.div
                    className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Nombre y SKU */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Nombre del Producto
                        </span>
                        <h3 className="text-lg font-semibold text-slate-900 mt-1">
                          {localSegmentedText.name}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                            SKU
                          </span>
                          <p className="font-mono text-sm text-slate-900 mt-1">
                            {localSegmentedText.sku}
                          </p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">
                            Precio
                          </span>
                          <p className="text-lg font-semibold text-emerald-600 mt-1">
                            {new Intl.NumberFormat('es-CL', { 
                              style: 'currency', 
                              currency: 'CLP' 
                            }).format(localSegmentedText.price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Colores y Tallas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                          Colores
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {localSegmentedText.colors.map((color, idx) => (
                            <span key={idx} 
                              className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full border border-violet-200">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                          Tallas
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {localSegmentedText.sizes.map((size, idx) => (
                            <span key={idx} 
                              className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Descripción del Producto */}
                    <div className="pt-4 border-t border-slate-200">
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2 block">
                        Descripción
                      </span>
                      <div className="bg-blue-50/50 rounded-lg p-4 space-y-2">
                        {localSegmentedText.description_product.map((desc, idx) => (
                          <p key={idx} className="text-sm text-slate-700 leading-relaxed">
                            {desc}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Características del Producto */}
                    <div className="pt-4 border-t border-slate-200">
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-2 block">
                        Características
                      </span>
                      <div className="bg-purple-50/50 rounded-lg p-4">
                        <ul className="space-y-4">
                          {localSegmentedText.features_product.map((feature, idx) => (
                            <li key={idx} className="text-slate-700">
                              <div className="font-medium text-sm mb-1">
                                {feature.title}
                              </div>
                              <div className="text-sm text-slate-600">
                                {feature.description}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Materiales */}
                    <div className="pt-4 border-t border-slate-200">
                      <span className="text-xs font-medium text-teal-600 uppercase tracking-wider mb-2 block">
                        Materiales
                      </span>
                      <div className="bg-teal-50/50 rounded-lg p-4">
                        <ul className="space-y-4">
                          {localSegmentedText.materials_product.map((material, idx) => (
                            <li key={idx} className="text-slate-700">
                              <div className="font-medium text-sm mb-1">
                                {material.title}
                              </div>
                              <div className="text-sm text-slate-600">
                                {material.description}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
                              {categoryStats.total > 0 
                                ? `Total de Categorías: ${categoryStats.total}`
                                : 'No hay categorías detectadas'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {categoryStats.total > 0 && 
                                `${categoryStats.parent} principales • ${categoryStats.child} subcategorías`}
                            </p>
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

              {/* Sección de Enlaces de Productos */}
              <motion.div className="border rounded-lg overflow-hidden mb-4">
                <button
                  onClick={() => setOpenSections({ ...openSections, productLinks: !openSections.productLinks })}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Link className="text-[#FF6B2B]" size={20} />
                    <span className="font-medium">Enlaces de Productos</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openSections.productLinks ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openSections.productLinks && (
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
                              {productLinks.length > 0 
                                ? `Enlaces (${productLinks.reduce((total, category) => total + category.links.length, 0)})` 
                                : 'No hay enlaces detectados'}
                            </h4>
                            {lastProductUpdate && (
                              <p className="text-xs text-slate-500">
                                Última actualización: {new Date(lastProductUpdate).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={handleGetProductLinks}
                            disabled={isLoadingLinks}
                            className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2
                              ${isLoadingLinks 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300'}`}
                          >
                            {isLoadingLinks ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Escaneando...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCcw size={14} />
                                <span>Obtener Enlaces</span>
                              </>
                            )}
                          </button>
                        </div>

                        {linksError && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                            <AlertTriangle size={12} />
                            <span>{linksError}</span>
                          </div>
                        )}

                        {!isLoadingLinks && productLinks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center p-8 text-center">
                            <p className="text-slate-600">
                              No hay enlaces disponibles.
                              <br />
                              <span className="text-sm text-slate-400">
                                Usa el botón "Obtener Enlaces" para comenzar.
                              </span>
                            </p>
                          </div>
                        ) : (
                          productLinks.length > 0 && (
                            <div className="mt-4 h-[400px] overflow-hidden">
                              {renderProductLinks(productLinks)}
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Nueva Sección de Productos */}
              <motion.div className="border rounded-lg overflow-hidden mb-4">
                <button
                  onClick={() => setOpenSections({ ...openSections, products: !openSections.products })}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="text-[#FF6B2B]" size={20} />
                    <span className="font-medium">Productos</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openSections.products ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openSections.products && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4 bg-white">
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <p className="text-slate-600">
                            Funcionalidad en desarrollo
                            <br />
                            <span className="text-sm text-slate-400">
                              Próximamente podrás ver los productos aquí
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Programación de Escaneo */}
              <div className="mt-8 p-4 bg-slate-50 rounded-lg"></div>
                <h3 className="font-medium mb-4">Programación de Escaneo</h3>
                <div className="flex gap-4">
                  <button className="flex-1 px-4 py-2 bg-[#FF6B2B] text-white rounded-lg hover:bg-[#e55b1e] transition-colors">
                    Escanear Ahora
                  </button>
                  <button className="flex-1 px-4 py-2 border border-[#FF6B2B] text-[#FF6B2B] rounded-lg hover:bg-[#FF6B2B] hover:text-white transition-colors">
                    Programar Escaneo
                  </button>
                </div>

                <button
                  onClick={handleCancel}
                  className="w-full mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {(isRescanningTech || isRescanningLogo) ? 'Cancelar Escaneo' : 'Cerrar'}
                </button>

                {showTextModal && (
                  <TextModal 
                    extractedText={extractedText} 
                    onClose={() => setShowTextModal(false)} 
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
};

export default ScanModal;
