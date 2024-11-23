import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, BarChart2, RefreshCcw, HelpCircle, Settings, Trash2, Eye, Loader2, ChevronDown, Package, Layers, Newspaper, Megaphone, ClipboardCopy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import cmsData from '@/data/cms.csv';  // Asegúrate de configurar el loader de CSV en tu bundler

// Competidores iniciales fijos - Ya no los necesitamos
const initialCompetitors = [];

const CompetitorsProd = () => {
  const [competitors, setCompetitors] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    autoLogo: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [competitorToDelete, setCompetitorToDelete] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const [openSections, setOpenSections] = useState({
    categories: false,
    products: false,
    news: false,
    social: false
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompetitorDetails, setSelectedCompetitorDetails] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [processedHtml, setProcessedHtml] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [processedText, setProcessedText] = useState('');
  const [processedCode, setProcessedCode] = useState('');
  const [activeTab, setActiveTab] = useState('texto'); // 'texto' o 'codigo'
  const [competitorResults, setCompetitorResults] = useState({});
  const [lineCount, setLineCount] = useState(0);
  const [cmsLogos, setCmsLogos] = useState({});
  const [displayPreferences, setDisplayPreferences] = useState({});
  const [isRescanningLogo, setIsRescanningLogo] = useState(false);
  const [rescanError, setRescanError] = useState(null);
  const [openPreferences, setOpenPreferences] = useState(false);
  const [isRescanningTech, setIsRescanningTech] = useState(false);
  const [rescanTechError, setRescanTechError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' o 'table'

  // Cargar los logos de CMS al inicio
  useEffect(() => {
    // Convertir el CSV a un objeto para fácil acceso
    const logos = {};
    cmsData.forEach(row => {
      logos[row.nombre_cms.toLowerCase()] = row.link;
    });
    setCmsLogos(logos);
  }, []);

  const loadCompetitors = async () => {
    try {
      const response = await fetch('http://localhost:8000/competitors/details');
      if (!response.ok) throw new Error('Error cargando competidores');
      
      const data = await response.json();
      const formattedCompetitors = data.competitors.map(comp => ({
        id: comp.name, // Usando name como id único
        name: comp.name,
        url: comp.url, // Agregamos la URL
        logo: comp.link_logo || '', // Asegurarnos de que siempre haya un valor
        technology: comp.technology || 'Unknown',
        technologyLogo: comp.technology_logo || '',
        products: 0,
        lastScraped: "Pendiente",
        status: "active",
        // Mostrar logo por defecto solo si existe un logo válido
        showLogo: comp.show_logo !== undefined ? 
          comp.show_logo === 'true' : 
          (comp.link_logo && comp.link_logo !== '' && comp.link_logo !== 'undefined')
      }));
      
      setCompetitors(formattedCompetitors);
    } catch (error) {
      console.error('Error loading competitors:', error);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

  const handleDeleteClick = (competitor) => {
    setCompetitorToDelete(competitor);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/competitor/delete/${competitorToDelete.name}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar competidor');
      }

      // Actualizar la lista de competidores después de eliminar
      await loadCompetitors();
      
      setShowDeleteConfirm(false);
      setCompetitorToDelete(null);
    } catch (error) {
      console.error('Error:', error);
      setError(`Error al eliminar el competidor: ${error.message}`);
    }
  };

  const handleCreateCompetitor = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // Verificar competidor existente
        const existingCompetitors = await fetch('http://localhost:8000/competitors/details');
        const data = await existingCompetitors.json();
        
        const competitorExists = data.competitors.some(
            comp => comp.name.toLowerCase() === formData.name.toLowerCase()
        );

        if (competitorExists) {
            setError(`El competidor "${formData.name}" ya existe en el sistema`);
            setIsLoading(false);
            return;
        }

        let logoUrl = '';
        
        // Obtener logo si autoLogo está activado
        if (formData.autoLogo) {
            try {
                const logoResponse = await fetch(`http://localhost:8000/get-logo/?url=${encodeURIComponent(formData.url)}`);
                if (logoResponse.ok) {
                    const logoData = await logoResponse.json();
                    // Usar directamente logo_link del response
                    if (logoData && logoData.logo_link) {
                        logoUrl = logoData.logo_link;
                    }
                }
            } catch (logoError) {
                console.error('Error obteniendo logo:', logoError);
            }
        }

        // Crear competidor usando el logoUrl obtenido
        const createResponse = await fetch(
            `http://localhost:8000/competitor/create/${formData.name}?url=${encodeURIComponent(formData.url)}&logo=${encodeURIComponent(logoUrl)}`,
            { method: 'POST' }
        );

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.detail || 'Error al crear el competidor');
        }

        await loadCompetitors();
        setShowAddModal(false);
        setFormData({ name: '', url: '', autoLogo: true });

    } catch (error) {
        setError(error.message);
        console.error('Error completo:', error);
    } finally {
        setIsLoading(false);
    }
};

  // Mejorar el componente de error en el modal
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

  const handleScanClick = (competitor) => {
    setSelectedCompetitor(competitor);
    setShowScanModal(true);
  };

  const handleViewClick = (competitor) => {
    setSelectedCompetitorDetails(competitor);
    setShowDetailsModal(true);
    
    // Si hay resultados guardados para este competidor, cargarlos
    if (competitorResults[competitor.id]) {
      const savedResults = competitorResults[competitor.id];
      setProcessedText(savedResults.texto);
      setProcessedCode(savedResults.codigo);
      setWordCount(savedResults.palabras);
      setLineCount(savedResults.lineas);
    } else {
      // Limpiar resultados si no hay datos guardados
      setProcessedText('');
      setProcessedCode('');
      setWordCount(0);
      setLineCount(0);
    }
    
    // Establecer la URL del competidor
    setCustomUrl(competitor.url);
  };

  // Modificar la función handleResumeHtml
const handleResumeHtml = async (url) => {
  try {
    setIsProcessingUrl(true);
    setError(null);
    
    console.log('Procesando URL:', url); // Debug

    const response = await axios.post('http://localhost:8000/procesar-html/', null, {
      params: { html: url }
    });

    console.log('Respuesta:', response.data); // Debug

    if (response.data) {
      const { texto, codigo, palabras_texto, lineas_codigo } = response.data;
      
      setProcessedText(texto);
      setProcessedCode(codigo);
      setWordCount(palabras_texto);
      setLineCount(lineas_codigo);

      // Guardar resultados para este competidor
      if (selectedCompetitorDetails) {
        setCompetitorResults(prev => ({
          ...prev,
          [selectedCompetitorDetails.id]: {
            texto,
            codigo,
            palabras: palabras_texto,
            lineas: lineas_codigo
          }
        }));
      }
    }
  } catch (error) {
    console.error('Error procesando URL:', error);
    setError('Error procesando la URL. Por favor, intente nuevamente.');
  } finally {
    setIsProcessingUrl(false);
  }
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent);
  };

  useEffect(() => {
    if (selectedCompetitorDetails) {
      setCustomUrl(selectedCompetitorDetails.url);
    }
  }, [selectedCompetitorDetails]);

  // Modificar la sección del logo de tecnología en el card del competidor
  const getTechnologyLogo = (technology) => {
    if (!technology) return null;
    
    // Normalizar el nombre de la tecnología
    const normalizedTech = technology.toLowerCase().replace(/ /g, '_');
    
    // Intentar obtener el logo con el nombre exacto primero
    if (cmsLogos[normalizedTech]) {
      return cmsLogos[normalizedTech];
    }
    
    // Si no se encuentra, intentar con variantes conocidas
    const techMappings = {
      'salesforce_commerce_cloud': ['salesforce', 'sfcc', 'demandware'],
      'magento': ['magento2', 'adobe_commerce'],
      'wordpress': ['wp'],
    };
    
    // Buscar en los mappings
    for (const [mainTech, aliases] of Object.entries(techMappings)) {
      if (aliases.includes(normalizedTech) || mainTech === normalizedTech) {
        return cmsLogos[mainTech] || cmsLogos[aliases[0]];
      }
    }
    
    return null;
  };

  // Agregar función para actualizar la preferencia de visualización
  const handleDisplayPreferenceChange = async (competitor, showLogo) => {
    try {
      // Actualizar inmediatamente el estado local solo para este competidor
      const updatedCompetitors = competitors.map(comp => {
        if (comp.id === competitor.id) {
          return { ...comp, showLogo };
        }
        return comp;
      });
      setCompetitors(updatedCompetitors);
      
      // Actualizar también el selectedCompetitor para que los radio buttons se actualicen
      setSelectedCompetitor(prev => ({
        ...prev,
        showLogo
      }));

      const response = await fetch(`http://localhost:8000/competitor/update-display/${competitor.name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_logo: showLogo })
      });

      if (!response.ok) {
        // Si hay error, revertir los cambios
        setCompetitors(competitors);
        setSelectedCompetitor(prev => ({
          ...prev,
          showLogo: !showLogo
        }));
        throw new Error('Error actualizando preferencia');
      }

    } catch (error) {
      console.error('Error:', error);
      setError('Error al actualizar la preferencia de visualización');
    }
  };

  // Agregar nueva función para re-escanear logo
const handleRescanLogo = async (competitor) => {
  try {
    setIsRescanningLogo(true);
    setRescanError(null);
    
    const logoResponse = await fetch(`http://localhost:8000/get-logo/?url=${encodeURIComponent(competitor.url)}`);
    if (!logoResponse.ok) throw new Error('No se pudo obtener el logo automáticamente');
    
    const logoData = await logoResponse.json();
    if (logoData && logoData.logo_link) {
      const updatedCompetitors = competitors.map(comp => {
        if (comp.id === competitor.id) {
          return { ...comp, logo: logoData.logo_link };
        }
        return comp;
      });
      setCompetitors(updatedCompetitors);
      
      setSelectedCompetitor(prev => ({
        ...prev,
        logo: logoData.logo_link
      }));
    } else {
      throw new Error('No se encontró un logo válido');
    }
  } catch (error) {
    console.error('Error:', error);
    setRescanError(error.message);
  } finally {
    setIsRescanningLogo(false);
  }
};

// Agregar nueva función para re-escanear tecnología
const handleRescanTechnology = async (competitor) => {
  try {
    setIsRescanningTech(true);
    setRescanTechError(null);
    
    const response = await fetch(`http://localhost:8000/detect-technology/?url=${encodeURIComponent(competitor.url)}`);
    if (!response.ok) throw new Error('No se pudo detectar la tecnología');
    
    const techData = await response.json();
    if (techData && techData.name) {
      const updatedCompetitors = competitors.map(comp => {
        if (comp.id === competitor.id) {
          return { 
            ...comp, 
            technology: techData.name,
            technologyLogo: techData.logo 
          };
        }
        return comp;
      });
      setCompetitors(updatedCompetitors);
      
      setSelectedCompetitor(prev => ({
        ...prev,
        technology: techData.name,
        technologyLogo: techData.logo
      }));
    } else {
      throw new Error('No se encontró información de tecnología válida');
    }
  } catch (error) {
    console.error('Error:', error);
    setRescanTechError(error.message);
  } finally {
    setIsRescanningTech(false);
  }
};

  return (
    <div className="p-8 relative">
      {/* Header Section with Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#003D5B] mb-2">Competidores_prod</h1>
          <p className="text-slate-600">Gestión y monitoreo de competidores - Ambiente de producción</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-xl transition-colors duration-200 ${viewMode === 'cards' ? 'bg-[#FF6B2B] text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Tarjetas
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-xl transition-colors duration-200 ${viewMode === 'table' ? 'bg-[#FF6B2B] text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            Tabla
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6B2B] text-white rounded-xl hover:bg-[#e55b1e] transition-colors duration-200"
          >
            <Plus size={20} />
            Agregar Nuevo Competidor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Total Competidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#003D5B]">{competitors.length}</div>
            <p className="text-sm text-slate-600 mt-1">En monitoreo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Productos Rastreados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#003D5B]">
              {competitors.reduce((acc, curr) => acc + curr.products, 0)}
            </div>
            <p className="text-sm text-slate-600 mt-1">Total actual</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Último Escrapeo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#003D5B]">
              Pendiente
            </div>
            <p className="text-sm text-emerald-600 mt-1">Estado del sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Updated Competitors List with Delete functionality */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {competitors.map((competitor) => (
            <Card 
              key={competitor.id} 
              className="hover:shadow-lg transition-all duration-200 border border-slate-200/60 bg-white/50 backdrop-blur-sm hover:border-slate-300 hover:bg-white"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
                <div className="flex items-center gap-4">
                  {competitor.logo && competitor.logo !== '' && competitor.logo !== 'undefined' && competitor.showLogo ? (
                    <div className="relative h-12 w-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden">
                      {/* Patrón de fondo */}
                      <div className="absolute inset-0 opacity-10" 
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '8px 8px'
                          }}>
                      </div>
                      <img 
                        src={competitor.logo} 
                        alt={competitor.name}
                        className="h-full w-full object-contain p-1 relative z-10"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.parentElement.innerHTML = `<div class="h-12 w-32 flex items-center justify-center text-xl font-bold text-slate-700 truncate">${competitor.name}</div>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-36 flex items-center justify-start text-xl font-bold text-slate-700 truncate">
                      {competitor.name}
                    </div>
                  )}
                </div>
                {competitor.technology && getTechnologyLogo(competitor.technology) && (
                  <div className="w-12 h-12 rounded-lg overflow-visible bg-white p-1 hover:bg-slate-50 transition-colors border border-slate-200 relative group">
                    <img 
                      src={getTechnologyLogo(competitor.technology)}
                      alt={competitor.technology}
                      className="w-full h-full object-contain"
                      width="48"
                      height="48"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                    {/* Tooltip revisado */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8
                      opacity-0 group-hover:opacity-100
                      pointer-events-none
                      bg-gray-900 text-white
                      px-2 py-1 rounded text-xs
                      whitespace-nowrap
                      transition-opacity duration-200
                      z-[100]">
                      {competitor.technology}
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Último escrapeo</span>
                    <span className="text-sm font-medium">{competitor.lastScraped}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">URL</span>
                    <a href={competitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline">
                      Visitar sitio
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Estado</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      competitor.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {competitor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={() => handleViewClick(competitor)}
                      className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </button>
                    <button 
                      onClick={() => handleScanClick(competitor)}
                      className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                      <Settings size={16} className="mr-1" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(competitor)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Tecnología
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {competitors.map((competitor, index) => (
                <motion.tr 
                  key={competitor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {competitor.logo && competitor.logo !== '' && competitor.logo !== 'undefined' && competitor.showLogo ? (
                        <div className="relative h-10 w-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                          <img 
                            src={competitor.logo} 
                            alt={competitor.name}
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : null}
                      <span className="text-sm font-medium text-slate-900">{competitor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a 
                      href={competitor.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {competitor.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {competitor.technology && getTechnologyLogo(competitor.technology) && (
                        <img 
                          src={getTechnologyLogo(competitor.technology)}
                          alt={competitor.technology}
                          className="h-6 w-6 object-contain"
                        />
                      )}
                      <span className="text-sm text-slate-600">{competitor.technology}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${competitor.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                        ${competitor.status === 'active' 
                          ? 'bg-emerald-400'
                          : 'bg-red-400'}`}
                      />
                      {competitor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleViewClick(competitor)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleScanClick(competitor)}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(competitor)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
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

      {/* Delete Confirmation Modal */}
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

      {/* Scan Modal */}
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

          {/* Technology section */}
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

                {/* Sección de Productos */}
                <motion.div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenSections({...openSections, products: !openSections.products})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="text-[#FF6B2B]" size={20} />
                      <span className="font-medium">Obtener Productos</span>
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
                        <div className="p-4 space-y-3 bg-white">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Nombre de productos</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Precios</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Color y tallas</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Características</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Sección de Categorías */}
                <motion.div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenSections({...openSections, categories: !openSections.categories})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart2 className="text-[#FF6B2B]" size={20} />
                      <span className="font-medium">Jerarquía de Categorías</span>
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
                        <div className="p-4 space-y-3 bg-white">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Incluir subcategorías</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Guardar metadatos</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Sección de Noticias */}
                <motion.div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenSections({...openSections, news: !openSections.news})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCcw className="text-[#FF6B2B]" size={20} />
                      <span className="font-medium">Obtener Últimas Noticias</span>
                    </div>
                    <motion.div
                      animate={{ rotate: openSections.news ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openSections.news && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 bg-white">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Incluir imágenes de noticias</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Recopilar enlaces</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Extraer fechas de publicación</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Analizar sentimiento</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Clasificar por categorías</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Sección de RRSS */}
                <motion.div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenSections({...openSections, social: !openSections.social})}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-[#FF6B2B]" size={20} />
                      <span className="font-medium">Escrapear RRSS</span>
                    </div>
                    <motion.div
                      animate={{ rotate: openSections.social ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openSections.social && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 bg-white">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Facebook</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Instagram</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded text-[#FF6B2B]" />
                            <span>Twitter/X</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

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

      {/* Details Modal */}
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
              {/* Header con logo */}
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
                className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CompetitorsProd;