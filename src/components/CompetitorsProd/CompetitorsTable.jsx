// src/components/CompetitorsProd/CompetitorsTable.jsx

import React, { useState, useEffect } from 'react';
import { Eye, Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitorsTable = ({
  competitors,
  handleViewClick,
  handleScanClick,
  handleDeleteClick,
  getTechnologyLogo,
}) => {
  // Agregar estado para almacenar el conteo de categorías
  const [categoryCounts, setCategoryCounts] = useState({});

  // Efecto para cargar el conteo de categorías para cada competidor
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const counts = {};
      for (const competitor of competitors) {
        try {
          const response = await fetch(`http://localhost:8000/get-existing-categories/${competitor.name}`);
          if (response.ok) {
            const data = await response.json();
            counts[competitor.name] = data.total_categories || 0;
          }
        } catch (error) {
          console.error('Error fetching category count:', error);
          counts[competitor.name] = 0;
        }
      }
      setCategoryCounts(counts);
    };

    fetchCategoryCounts();
  }, [competitors]);

  return (
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
              Categorías
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Productos
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sticky right-0 bg-gradient-to-r from-slate-50 to-slate-100">
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
                  {competitor.link_logo && competitor.show_logo ? (
                    <div className="relative h-10 w-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg overflow-hidden border border-slate-200 group-hover:border-slate-300 transition-colors">
                      <img 
                        src={competitor.link_logo} 
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {categoryCounts[competitor.name] || 0} categorías
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  0 productos
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleViewClick(competitor)}
                    className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleScanClick(competitor)}
                    className="text-indigo-600 hover:text-indigo-800 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(competitor)}
                    className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
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
  );
};

export default CompetitorsTable;
