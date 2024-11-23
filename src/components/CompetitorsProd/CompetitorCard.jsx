// src/components/CompetitorsProd/CompetitorCard.jsx

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Eye, Settings, Trash2 } from 'lucide-react';

const CompetitorCard = ({
  competitor,
  handleViewClick,
  handleScanClick,
  handleDeleteClick,
  getTechnologyLogo,
}) => {
  return (
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
  );
};

export default CompetitorCard;
