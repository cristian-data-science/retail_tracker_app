// src/components/CompetitorsProd/CompetitorsTable.jsx

import React from 'react';
import { Eye, Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitorsTable = ({
  competitors,
  handleViewClick,
  handleScanClick,
  handleDeleteClick,
  getTechnologyLogo,
}) => {
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
  );
};

export default CompetitorsTable;
