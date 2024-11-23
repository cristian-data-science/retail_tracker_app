// src/components/CompetitorsProd/StatsCards.jsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const StatsCards = ({ competitors }) => {
  return (
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
  );
};

export default StatsCards;
