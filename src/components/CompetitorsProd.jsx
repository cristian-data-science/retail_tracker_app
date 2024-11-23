// src/components/CompetitorsProd.jsx

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import axios from 'axios';
import cmsData from '@/data/cms.csv';  // Asegúrate de configurar el loader de CSV en tu bundler

// Importar los componentes segmentados
import CompetitorCard from './CompetitorsProd/CompetitorCard';
import CompetitorsTable from './CompetitorsProd/CompetitorsTable';
import AddCompetitorModal from './CompetitorsProd/AddCompetitorModal';
import DeleteConfirmModal from './CompetitorsProd/DeleteConfirmModal';
import ScanModal from './CompetitorsProd/ScanModal';
import DetailsModal from './CompetitorsProd/DetailsModal';
import StatsCards from './CompetitorsProd/StatsCards';
import ErrorMessage from './CompetitorsProd/ErrorMessage';

// Competidores iniciales fijos - Ya no los necesitamos
const initialCompetitors = [];

const CompetitorsProd = () => {
  // Variables de estado
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

  // Componente ErrorMessage
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

  // Obtener el logo de tecnología
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

  // Actualizar preferencia de visualización
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

  // Re-escanear logo
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

  // Re-escanear tecnología
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
      {/* Sección de encabezado con botón de agregar */}
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

      {/* Tarjetas de estadísticas */}
      <StatsCards competitors={competitors} />

      {/* Lista de competidores */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {competitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              handleViewClick={handleViewClick}
              handleScanClick={handleScanClick}
              handleDeleteClick={handleDeleteClick}
              getTechnologyLogo={getTechnologyLogo}
            />
          ))}
        </div>
      ) : (
        <CompetitorsTable
          competitors={competitors}
          handleViewClick={handleViewClick}
          handleScanClick={handleScanClick}
          handleDeleteClick={handleDeleteClick}
          getTechnologyLogo={getTechnologyLogo}
        />
      )}

      {/* Modales */}
      <AddCompetitorModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleCreateCompetitor={handleCreateCompetitor}
        isLoading={isLoading}
        error={error}
        formData={formData}
        setFormData={setFormData}
      />

      <DeleteConfirmModal
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        handleConfirmDelete={handleConfirmDelete}
        competitorToDelete={competitorToDelete}
        error={error}
      />

      <ScanModal
        showScanModal={showScanModal}
        setShowScanModal={setShowScanModal}
        selectedCompetitor={selectedCompetitor}
        handleDisplayPreferenceChange={handleDisplayPreferenceChange}
        isRescanningLogo={isRescanningLogo}
        handleRescanLogo={handleRescanLogo}
        rescanError={rescanError}
        openPreferences={openPreferences}
        setOpenPreferences={setOpenPreferences}
        openSections={openSections}
        setOpenSections={setOpenSections}
        isRescanningTech={isRescanningTech}
        handleRescanTechnology={handleRescanTechnology}
        rescanTechError={rescanTechError}
        cmsLogos={cmsLogos}
      />

      <DetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedCompetitorDetails={selectedCompetitorDetails}
        setSelectedCompetitorDetails={setSelectedCompetitorDetails}
        customUrl={customUrl}
        setCustomUrl={setCustomUrl}
        isProcessingUrl={isProcessingUrl}
        handleResumeHtml={handleResumeHtml}
        error={error}
        processedText={processedText}
        processedCode={processedCode}
        wordCount={wordCount}
        lineCount={lineCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

    </div>
  );
};

export default CompetitorsProd;
