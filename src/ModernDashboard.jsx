import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart2, 
  ShoppingBag, 
  Settings, 
  Search, 
  Bell, 
  User,
  TrendingUp,
  Database, 
  Flame, 
  AlertTriangle, 
  TrendingDown, 
  Award, 
  Box,
  List 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,  
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import Login from './components/Login';
import RoadmapComponent from './components/RoadmapComponent';
import CompetitorsTest from './components/CompetitorsTest';
import CompetitorsProd from './components/CompetitorsProd';

const ModernDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [shouldLoadRoadmap, setShouldLoadRoadmap] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  
  // Datos de ejemplo para el gráfico de precios de chaquetas outdoor
  const chartData = [
    { name: 'Ene', value: 189.99 },
    { name: 'Feb', value: 199.99 },
    { name: 'Mar', value: 179.99 },
    { name: 'Abr', value: 169.99 },
    { name: 'May', value: 159.99 },
    { name: 'Jun', value: 189.99 },
  ];

  // Datos adicionales para nuevos gráficos
  const radarData = [
    { category: 'Precio', A: 120, B: 110, fullMark: 150 },
    { category: 'Calidad', A: 98, B: 130, fullMark: 150 },
    { category: 'Stock', A: 86, B: 130, fullMark: 150 },
    { category: 'Variedad', A: 99, B: 100, fullMark: 150 },
    { category: 'Descuentos', A: 85, B: 90, fullMark: 150 },
  ];

  const timelineData = [
    { date: '1 Oct', price: 150, discount: 0 },
    { date: '5 Oct', price: 145, discount: 3 },
    { date: '10 Oct', price: 140, discount: 7 },
    { date: '15 Oct', price: 155, discount: 0 },
    { date: '20 Oct', price: 148, discount: 5 },
  ];

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark);
  }, [isDark]);

  const handleLogin = useCallback(() => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('roadmapData', JSON.stringify([]));
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('roadmapData');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  }, []);

  const renderContent = useCallback(() => {
    switch(currentPage) {
      case 'competitors-test':
        return <CompetitorsTest />;
      case 'competitors-prod':
        return <CompetitorsProd />;
      case 'analytics':
        return <div className="p-8">Página de Análisis - En desarrollo</div>;
      case 'settings':
        return <div className="p-8">Página de Configuración - En desarrollo</div>;
      case 'masters':
        return <div className="p-8">Maestros de Datos - En desarrollo</div>;
      case 'roadmap':
        return <RoadmapComponent key="roadmap-component" />;
      default:
        return renderDashboardContent();
    }
  }, [currentPage]);

  const renderDashboardContent = useCallback(() => (
    <main className="p-6 bg-slate-50/50">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#003D5B] mb-2">Dashboard Outdoor Retail</h2>
        <p className="text-slate-600 text-lg">Monitoreo de competidores en el mercado outdoor</p>
      </div>

      {/* Grid principal reorganizado */}
      <div className="grid grid-cols-12 gap-6">
        {/* Primera columna: KPIs y Radar Chart */}
        <div className="col-span-12 lg:col-span-8 grid gap-6">
          {/* KPIs en grid de 2x2 */}
          <div className="grid grid-cols-2 gap-6">
            {/* Las 4 cards originales */}
            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-[#003D5B]">Competidores Outdoor</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="text-[#FF6B2B]" size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#003D5B]">8</div>
                <p className="text-sm text-slate-600 mt-1">Dexter, Doite, The North Face, etc.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-[#003D5B]">SKUs Monitoreados</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="text-[#FF6B2B]" size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#003D5B]">1,245</div>
                <p className="text-sm text-slate-600 mt-1">+45 nuevos productos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-[#003D5B]">Precio Promedio Chaquetas</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="text-[#FF6B2B]" size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#003D5B]">$179.99</div>
                <p className="text-sm text-red-600 mt-1">-5.2% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold text-[#003D5B]">Alertas de Precio</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ShoppingBag className="text-[#FF6B2B]" size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#003D5B]">5</div>
                <p className="text-sm text-red-600 mt-1">2 bajadas de precio significativas</p>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#003D5B]">
                  Análisis Competitivo - The North Face vs Patagonia
                </CardTitle>
                <Award className="text-[#FF6B2B]" size={24} />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="category" stroke="#64748b" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar name="The North Face" dataKey="A" stroke="#003D5B" fill="#003D5B" fillOpacity={0.3} />
                    <Radar name="Patagonia" dataKey="B" stroke="#FF6B2B" fill="#FF6B2B" fillOpacity={0.3} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de Precios - Ocupa todo el ancho */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#003D5B]">
                  Timeline de Precios - Better Sweater
                </CardTitle>
                <TrendingDown className="text-[#FF6B2B]" size={24} />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="price" stroke="#003D5B" fill="#003D5B" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="discount" stroke="#FF6B2B" fill="#FF6B2B" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segunda columna: Productos Hot y Distribución */}
        <div className="col-span-12 lg:col-span-4 grid gap-6">
          {/* Lista de Productos Hot */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#003D5B]">Productos Hot</CardTitle>
                <Flame className="text-[#FF6B2B]" size={24} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { name: 'Better Sweater', brand: 'Patagonia', change: '+15%' },
                  { name: 'Thermoball', brand: 'The North Face', change: '+12%' },
                  { name: 'Down Jacket', brand: 'Doite', change: '+8%' },
                  { name: 'Trail Runners', brand: 'Columbia', change: '+5%' },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-[#003D5B]">{product.name}</p>
                      <p className="text-sm text-slate-600">{product.brand}</p>
                    </div>
                    <span className="text-emerald-500 font-semibold">{product.change}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Categorías */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-[#003D5B]">
                Distribución por Categorías
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {['Chaquetas y Parkas', 'Mochilas y Equipamiento', 'Calzado Outdoor', 'Carpas y Camping'].map((category) => (
                  <div key={category} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#003D5B]">{category}</span>
                        <span className="text-sm text-[#FF6B2B] font-semibold">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-[#FF6B2B] h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.floor(Math.random() * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nueva Card de Alertas */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#003D5B]">
                  Alertas Recientes
                </CardTitle>
                <AlertTriangle className="text-[#FF6B2B]" size={24} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  { text: 'Baja de precio en North Face', time: '2h', tipo: 'precio' },
                  { text: 'Nuevo producto Patagonia', time: '5h', tipo: 'nuevo' },
                  { text: 'Stock bajo en Columbia', time: '1d', tipo: 'stock' }
                ].map((alerta, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-sm text-[#003D5B]">{alerta.text}</span>
                    <span className="text-xs text-[#FF6B2B]">{alerta.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  ), []);

  return (
    <div className={`${!isAuthenticated ? 'min-h-screen w-full' : 'flex h-screen'} bg-slate-100 dark:bg-dark-bg transition-colors duration-200`}>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {/* Sidebar con modo oscuro */}
          <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-primary/95 dark:bg-dark-card/95 backdrop-blur-sm h-full transition-all duration-300 shadow-xl z-10`}>
            <div className="flex justify-center items-center h-[4.5rem] px-4">
              <img 
                src="/logo.png" 
                alt="RetailTracker Logo" 
                className={`${isSidebarCollapsed ? 'w-16 h-16' : 'w-36 h-36'} object-contain transition-all duration-300 -mt-2`}
              />
            </div>
            
            {/* Línea divisora del sidebar ajustada */}
            <div className="w-full h-[1px] bg-[#FF6B2B]/20" />

            <nav className="mt-6 px-2">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'dashboard' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <BarChart2 className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Dashboard</span>
              </button>

              <button 
                onClick={() => setCurrentPage('competitors-test')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'competitors-test' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <ShoppingBag className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Competidores Test</span>
              </button>
              
              <button 
                onClick={() => setCurrentPage('competitors-prod')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'competitors-prod' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <ShoppingBag className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Competidores Prod</span>
              </button>
              
              <button 
                onClick={() => setCurrentPage('analytics')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'analytics' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <TrendingUp className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Análisis</span>
              </button>

              <button 
                onClick={() => setCurrentPage('masters')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'masters' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <Database className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Maestros de Datos</span>
              </button>

              <button 
                onClick={() => setCurrentPage('settings')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'settings' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <Settings className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Configuración</span>
              </button>

              {/* Roadmap movido al final */}
              <button 
                onClick={() => setCurrentPage('roadmap')}
                className={`flex items-center px-4 py-3 w-full text-left rounded-lg border border-white/10 mb-2 transition-all ${
                  currentPage === 'roadmap' 
                    ? 'text-[#FF6B2B] bg-[#002D43] border-[#FF6B2B]' 
                    : 'text-white hover:bg-[#002D43] hover:border-[#FF6B2B]/50'
                }`}>
                <List className="mr-3" size={20} />
                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Roadmap</span>
              </button>
            </nav>
          </div>

          {/* Main Content con modo oscuro */}
          <div className="flex-1 overflow-auto">
            {/* Header con modo oscuro */}
            <header className="bg-white/70 dark:bg-dark-card/70 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center h-[4.5rem] px-8">
                <div className="flex items-center flex-1">
                  <div className="relative w-64">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B2B] focus:border-transparent transition-all duration-200"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200"
                  >
                    {isDark ? '🌞' : '🌙'}
                  </button>
                  <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors duration-200">
                    <Bell size={20} className="text-slate-600" />
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-[#FF6B2B] text-white rounded-xl hover:bg-[#e55b1e] transition-colors duration-200 flex items-center gap-2"
                  >
                    <User size={20} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
              {/* Línea divisora del header alineada */}
              <div className="w-full h-[1px] bg-slate-200" />
            </header>

            {/* Contenido con padding ajustado */}
            <div className="pt-6">
              {renderContent()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernDashboard;