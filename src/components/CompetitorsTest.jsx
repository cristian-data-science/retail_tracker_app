import React, { useState } from 'react';
import { Plus, AlertTriangle, BarChart2, RefreshCcw, HelpCircle, Settings, Trash2, Eye } from 'lucide-react';
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

// Datos de ejemplo actualizados con los links correctos del CSV
const mockCompetitors = [
  {
    id: 1,
    name: "The North Face",
    logo: "https://www.thenorthface.cl/static/version1730925188/frontend/Omnipro/north-face/default/images/logo.svg",
    products: 1234,
    lastScraped: "2024-11-11 15:30",
    status: "active"
  },
  {
    id: 2,
    name: "Nike",
    logo: "https://nikeclprod.vtexassets.com/assets/vtex/assets-builder/nikeclprod.store/3.0.37/icons/Assets_for_off%20platform/swoosh___33f7ffaf2fc124733c2c4a60a12a1160.svg",
    products: 890,
    lastScraped: "2024-11-11 14:15",
    status: "active"
  },
  {
    id: 3,
    name: "Columbia",
    logo: "https://columbiacl.vtexassets.com/assets/vtex.file-manager-graphql/images/494ec4d3-3884-412d-9ed9-14c2bbeae46a___3ae66a1e5baa6d68635a199a3c191469.jpg",
    products: 756,
    lastScraped: "2024-11-11 13:45",
    status: "active"
  },
  {
    id: 4,
    name: "Lippi",
    logo: "https://www.lippioutdoor.com/cdn/shop/files/logo-main.png?v=1727181873&width=600",
    products: 543,
    lastScraped: "2024-11-11 12:30",
    status: "active"
  },
  {
    id: 5,
    name: "Doite",
    logo: "https://doite.cl/media/logo/stores/1/doite-logo-1488558841_1.jpg",
    products: 432,
    lastScraped: "2024-11-11 11:15",
    status: "active"
  },
  {
    id: 6,
    name: "Marmot",
    logo: "https://www.marmot.cl/static/version1730925188/frontend/Omnipro/marmot/default/images/logo.svg",
    products: 378,
    lastScraped: "2024-11-11 10:00",
    status: "active"
  }
];

const CompetitorsTest = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#003D5B] mb-2">Competidores_test</h1>
          <p className="text-slate-600">Gestión y monitoreo de competidores - Ambiente de pruebas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6B2B] text-white rounded-xl hover:bg-[#e55b1e] transition-colors duration-200"
        >
          <Plus size={20} />
          Agregar Nuevo Competidor
        </button>
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
            <div className="text-3xl font-bold text-[#003D5B]">8</div>
            <p className="text-sm text-slate-600 mt-1">+2 este mes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Productos Rastreados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#003D5B]">3,456</div>
            <p className="text-sm text-slate-600 mt-1">+123 última semana</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Último Escrapeo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#003D5B]">11 Nov, 15:30</div>
            <p className="text-sm text-emerald-600 mt-1 text-left">Completado con éxito</p>
          </CardContent>
        </Card>
      </div>

      {/* Competitors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockCompetitors.map((competitor) => (
          <Card key={competitor.id} className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center space-y-0 gap-4">
              <img 
                src={competitor.logo} 
                alt={competitor.name}
                className="h-12 w-24 object-contain"
              />
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-[#003D5B]">
                  {competitor.name}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {competitor.products} productos
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Último escrapeo</span>
                  <span className="text-sm font-medium">{competitor.lastScraped}</span>
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
                  <button className="flex-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <Eye size={16} className="inline mr-1" />
                    Ver
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    <Settings size={16} className="inline mr-1" />
                    Editar
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                    <Trash2 size={16} className="inline mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Productos por Competidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockCompetitors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="products" fill="#003D5B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Actividad de Escrapeo */}
        <Card className="hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#003D5B]">
              Actividad de Escrapeo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockCompetitors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="products" stroke="#FF6B2B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompetitorsTest;