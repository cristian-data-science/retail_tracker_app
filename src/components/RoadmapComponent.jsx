import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit2, Trash2, Check, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import * as db from '../db/database';

const RoadmapComponent = () => {
  const [phases, setPhases] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});
  const [editingPhase, setEditingPhase] = useState(null);
  const [newTaskCategory, setNewTaskCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPhaseTitle, setEditingPhaseTitle] = useState(null);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhase, setNewPhase] = useState({ title: "", category: "" });
  const [showNewPhaseForm, setShowNewPhaseForm] = useState(false);

  const defaultData = [
    {
      id: 1,
      title: "Fase 1: Funcionalidades Básicas",
      categories: {
        "Autenticación y Seguridad": [
          { id: 1, text: "Registro y login de usuarios", completed: false },
          { id: 2, text: "Recuperación de contraseñas", completed: false }
        ]
      }
    }
  ];

  const isPhaseCompleted = useCallback((phase) => {
    if (!phase?.categories) return false;
    
    try {
      return Object.values(phase.categories).every(tasks => 
        Array.isArray(tasks) && tasks.length > 0 && tasks.every(task => task?.completed)
      );
    } catch (e) {
      return false;
    }
  }, []);

  const initData = useCallback(async () => {
    try {
      const dbData = await db.getAllPhases();
      if (dbData && dbData.length > 0) {
        setPhases(dbData);
        setExpandedPhases(dbData.reduce((acc, phase) => {
          acc[phase.id] = true;
          return acc;
        }, {}));
      } else {
        const defaultData = [
          {
            id: 1,
            title: "Fase 1: Funcionalidades Básicas",
            categories: {
              "Autenticación y Seguridad": [
                { id: 1, text: "Registro y login de usuarios", completed: false },
                { id: 2, text: "Recuperación de contraseñas", completed: false }
              ]
            }
          }
        ];
        setPhases(defaultData);
        localStorage.setItem('roadmapData', JSON.stringify(defaultData));
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
      setPhases([]);
    }
  }, []);

  const processDBData = (dbData) => {
    const phasesMap = {};
    
    dbData.forEach(row => {
      if (!phasesMap[row.id]) {
        phasesMap[row.id] = {
          id: row.id,
          title: row.title,
          categories: {}
        };
      }
      
      if (row.category_name) {
        if (!phasesMap[row.id].categories[row.category_name]) {
          phasesMap[row.id].categories[row.category_name] = [];
        }
        
        if (row.task_id) {
          phasesMap[row.id].categories[row.category_name].push({
            id: row.task_id,
            text: row.task_text,
            completed: Boolean(row.task_completed)
          });
        }
      }
    });

    return Object.values(phasesMap);
  };

  const loadCSVData = async () => {
    try {
      // 1. Primero intentar cargar desde localStorage
      const savedData = localStorage.getItem('roadmapData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData && parsedData.length > 0) {
          setPhases(parsedData);
          setExpandedPhases(parsedData.reduce((acc, phase) => {
            acc[phase.id] = true;
            return acc;
          }, {}));
          return;
        }
      }

      // 2. Si no hay datos en localStorage, cargar desde el archivo CSV
      const response = await fetch('/src/data/roadmap.csv');
      const csvText = await response.text();
      
      // Procesar el CSV
      const rows = csvText
        .split('\n')
        .slice(1) // Remover header
        .filter(row => row.trim() !== ''); // Filtrar líneas vacías
      
      const data = rows.map(row => {
        const [fase, categoria, tarea, estado] = row.split(',').map(item => item?.trim() || '');
        if (!fase || !categoria || !tarea) return null;
        
        return {
          Fase: fase,
          Categoría: categoria.replace(/"/g, ''),
          Tarea: tarea.replace(/"/g, ''),
          Estado: estado?.toLowerCase() === 'true'
        };
      }).filter(Boolean);

      // Agrupar por fases
      const groupedByPhase = data.reduce((acc, item) => {
        const phaseNumber = parseInt(item.Fase);
        if (!acc[phaseNumber]) {
          acc[phaseNumber] = {
            id: phaseNumber,
            title: `Fase ${phaseNumber}: ${getPhaseTitle(phaseNumber)}`,
            categories: {}
          };
        }
        
        if (!acc[phaseNumber].categories[item.Categoría]) {
          acc[phaseNumber].categories[item.Categoría] = [];
        }
        
        acc[phaseNumber].categories[item.Categoría].push({
          id: Math.random(),
          text: item.Tarea,
          completed: item.Estado
        });
        
        return acc;
      }, {});

      const phasesArray = Object.values(groupedByPhase).sort((a, b) => a.id - b.id);
      
      // Guardar en localStorage y actualizar estado
      localStorage.setItem('roadmapData', JSON.stringify(phasesArray));
      setPhases(phasesArray);
      setExpandedPhases(phasesArray.reduce((acc, phase) => {
        acc[phase.id] = true;
        return acc;
      }, {}));
      
    } catch (error) {
      console.error('Error loading CSV:', error);
      setPhases(defaultData);
      setExpandedPhases({ 1: true });
    }
  };

  useEffect(() => {
    loadCSVData();
  }, []);

  const processRoadmapData = (data) => {
    const groupedByPhase = data.reduce((acc, item) => {
      const phaseNumber = parseInt(item.Fase);
      if (!acc[phaseNumber]) {
        acc[phaseNumber] = {
          id: phaseNumber,
          title: `Fase ${phaseNumber}: ${getPhaseTitle(phaseNumber)}`,
          categories: {}
        };
      }
      
      if (!acc[phaseNumber].categories[item.Categoría]) {
        acc[phaseNumber].categories[item.Categoría] = [];
      }
      
      acc[phaseNumber].categories[item.Categoría].push({
        id: Math.random(),
        text: item.Tarea,
        completed: item.Estado.toLowerCase() === 'true'
      });
      
      return acc;
    }, {});

    // Ordenar las fases por número
    return Object.values(groupedByPhase).sort((a, b) => a.id - b.id);
  };

  const getPhaseTitle = (phase) => {
    const titles = {
      1: 'Funcionalidades Básicas',
      2: 'Funcionalidades Intermedias',
      3: 'Funcionalidades Avanzadas',
      4: 'Funcionalidades Experimentales'
    };
    return titles[phase] || 'Sin título';
  };

  const handleAddTask = async (phaseId, category) => {
    if (!newTaskText.trim()) return;
    
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        
        return {
          ...phase,
          categories: {
            ...phase.categories,
            [category]: [
              ...(phase.categories[category] || []),
              {
                id: Math.random(),
                text: newTaskText,
                completed: false
              }
            ]
          }
        };
      });

      localStorage.setItem('roadmapData', JSON.stringify(newPhases));
      return newPhases;
    });

    setNewTaskText("");
    setEditingPhase(null);
    setNewTaskCategory("");
  };

  const handleEditTask = (phaseId, category, taskId, newText) => {
    if (!newText?.trim()) return;
  
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        
        return {
          ...phase,
          categories: {
            ...phase.categories,
            [category]: (phase.categories[category] || []).map(task =>
              task.id === taskId ? { ...task, text: newText } : task
            )
          }
        };
      });
      
      localStorage.setItem('roadmapData', JSON.stringify(newPhases));
      return newPhases;
    });
    
    setEditingTask(null);
    setNewTaskText("");
  };

  const handleDeleteTask = (phaseId, category, taskId) => {
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            categories: {
              ...phase.categories,
              [category]: phase.categories[category].filter(task => task.id !== taskId)
            }
          };
        }
        return phase;
      });
      
      // Solo guardamos en localStorage
      localStorage.setItem('roadmapData', JSON.stringify(newPhases));
      
      return newPhases;
    });
  };

  const saveToCSV = (phases) => {
    try {
      if (!phases || !Array.isArray(phases)) {
        console.error('No hay datos válidos para guardar');
        return;
      }
  
      const csvData = convertToCSV(phases);
      if (csvData.length === 0) {
        console.error('No hay datos para convertir a CSV');
        return;
      }
  
      downloadCSV(csvData);
      
      // Guardar también en localStorage
      localStorage.setItem('roadmapData', JSON.stringify(phases));
      
      console.log('Datos guardados exitosamente');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const toggleTaskStatus = (phaseId, taskId) => {
    setPhases(prevPhases => {
      const newPhases = prevPhases.map(phase => {
        if (phase.id !== phaseId) return phase;
        
        return {
          ...phase,
          categories: Object.fromEntries(
            Object.entries(phase.categories).map(([category, tasks]) => [
              category,
              tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            ])
          )
        };
      });
      
      // Solo guardamos en localStorage
      localStorage.setItem('roadmapData', JSON.stringify(newPhases));
      return newPhases;
    });
  };

  const togglePhase = (phaseId) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const convertToCSV = (phases) => {
    if (!phases || !Array.isArray(phases)) return [];
    
    return phases.flatMap(phase => {
      if (!phase?.categories) return [];
      
      return Object.entries(phase.categories).flatMap(([category, tasks]) => {
        if (!Array.isArray(tasks)) return [];
        
        return tasks.map(task => ({
          Fase: phase.id,
          Categoría: category,
          Tarea: task.text,
          Estado: task.completed.toString()
        }));
      });
    });
  };

  const handleAddPhase = () => {
    if (!newPhase.title || !newPhase.category) return;
    
    const nextPhaseId = Math.max(...phases.map(p => p.id)) + 1;
    const newPhaseObj = {
      id: nextPhaseId,
      title: `Fase ${nextPhaseId}: ${newPhase.title}`,
      categories: {
        [newPhase.category]: []
      }
    };

    setPhases(prev => {
      const newPhases = [...prev, newPhaseObj];
      const csvData = convertToCSV(newPhases);
      saveToCSV(csvData);
      return newPhases;
    });

    setNewPhase({ title: "", category: "" });
    setShowNewPhaseForm(false);
  };

  const handleEditPhaseTitle = (phaseId, newTitle) => {
    setPhases(prev => {
      const newPhases = prev.map(phase => 
        phase.id === phaseId 
          ? { ...phase, title: `Fase ${phase.id}: ${newTitle}` }
          : phase
      );
      const csvData = convertToCSV(newPhases);
      saveToCSV(csvData);
      return newPhases;
    });
    setEditingPhaseTitle(null);
  };

  const renderTaskButtons = (task, phase, category) => {
    if (!isEditing) return null;

    return (
      <div className="flex gap-2">
        {editingTask === task.id ? (
          <>
            <button onClick={() => handleEditTask(phase.id, category, task.id, newTaskText)}>
              <Check className="text-green-500" size={20} />
            </button>
            <button onClick={() => setEditingTask(null)}>
              <X className="text-red-500" size={20} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setEditingTask(task.id);
                setNewTaskText(task.text);
              }}
              className="text-slate-500 hover:text-[#FF6B2B]"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDeleteTask(phase.id, category, task.id)}
              className="text-slate-500 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    );
  };

  // Función auxiliar para descargar el CSV
  const downloadCSV = (data) => {
    try {
      if (!data || data.length === 0) return;
      
      const csvContent = [
        'Fase,Categoría,Tarea,Estado',
        ...data.map(row => 
          `${row.Fase},"${row.Categoría}","${row.Tarea}",${row.Estado}`
        )
      ].join('\n');
    
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'roadmap.csv';
      link.click();
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const handleDownloadCSV = () => {
    const csvRows = ['Fase,Categoría,Tarea,Estado'];
    
    phases.forEach(phase => {
      Object.entries(phase.categories).forEach(([category, tasks]) => {
        tasks.forEach(task => {
          csvRows.push(`${phase.id},"${category}","${task.text}",${task.completed}`);
        });
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'roadmap.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white dark:bg-dark-card rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary dark:text-dark-text-primary">
          Roadmap del Proyecto
        </h2>
        <div className="flex gap-2">
          {isEditing && (
            <>
              <button
                onClick={() => {
                  localStorage.removeItem('roadmapData');
                  loadCSVData(); // Recargar datos
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
              >
                Reiniciar Datos
              </button>
              <button
                onClick={handleDownloadCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
              >
                Descargar CSV
              </button>
              <button
                onClick={() => setShowNewPhaseForm(true)}
                className="px-4 py-2 bg-[#003D5B] text-white rounded-lg flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Nueva Fase
              </button>
            </>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-[#FF6B2B] hover:bg-[#e55b1e]'
            } text-white transition-colors duration-200`}
          >
            {isEditing ? (
              <>
                <Check size={20} />
                Guardar Cambios
              </>
            ) : (
              <>
                <Edit2 size={20} />
                Editar Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {showNewPhaseForm && (
        <div className="mb-6 p-4 border rounded-lg bg-slate-50">
          <h3 className="font-medium mb-3">Nueva Fase</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Título de la fase"
              value={newPhase.title}
              onChange={(e) => setNewPhase(prev => ({ ...prev, title: e.target.value }))}
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Categoría inicial"
              value={newPhase.category}
              onChange={(e) => setNewPhase(prev => ({ ...prev, category: e.target.value }))}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={handleAddPhase}
              className="px-4 py-2 bg-[#FF6B2B] text-white rounded-lg"
            >
              Agregar
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {Array.isArray(phases) && phases.length > 0 ? (
          phases.map(phase => {
            if (!phase?.id || !phase?.categories) return null;
            
            return (
              <div key={phase.id} className={`border border-slate-200 dark:border-dark-border rounded-lg p-4 overflow-hidden ${
                isPhaseCompleted(phase) ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'dark:bg-dark-surface'
              }`}>
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => togglePhase(phase.id)}
                >
                  {editingPhaseTitle === phase.id && isEditing ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={newPhaseTitle}
                        onChange={(e) => setNewPhaseTitle(e.target.value)}
                        className="border rounded px-2 py-1"
                      />
                      <button onClick={() => handleEditPhaseTitle(phase.id, newPhaseTitle)}>
                        <Check className="text-green-500" size={20} />
                      </button>
                      <button onClick={() => setEditingPhaseTitle(null)}>
                        <X className="text-red-500" size={20} />
                      </button>
                    </div>
                  ) : (
                    <h3 className={`text-lg font-semibold flex items-center ${
                      isPhaseCompleted(phase) ? 'text-green-600 dark:text-green-400' : 'text-primary dark:text-dark-text-primary'
                    }`}>
                      <ChevronRight 
                        className={`mr-2 transform transition-transform duration-200 ${
                          expandedPhases[phase.id] ? 'rotate-90' : ''
                        }`} 
                        size={20}
                      />
                      {phase.title}
                      {isEditing && (
                        <button
                          onClick={() => {
                            setEditingPhaseTitle(phase.id);
                            setNewPhaseTitle(phase.title.split(': ')[1]);
                          }}
                          className="ml-2 text-slate-500 hover:text-[#FF6B2B]"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </h3>
                  )}
                  <div className="text-sm text-slate-500">
                    {Object.values(phase.categories).flat().length} tareas
                  </div>
                </div>

                {/* Agregar div con transición suave */}
                <div 
                  className={`transition-all duration-500 ease-in-out ${
                    expandedPhases[phase.id] ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="space-y-4">
                    {Object.entries(phase.categories).map(([category, tasks]) => (
                      <div key={category} className="mb-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium text-[#FF6B2B] mb-2">{category}</h4>
                          {isEditing && (
                            <button
                              onClick={() => {
                                setNewTaskCategory(category);
                                setEditingPhase(phase.id);
                              }}
                              className="text-slate-500 hover:text-[#FF6B2B]"
                            >
                              <PlusCircle size={20} />
                            </button>
                          )}
                        </div>

                        {editingPhase === phase.id && newTaskCategory === category && (
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={newTaskText}
                              onChange={(e) => setNewTaskText(e.target.value)}
                              className="flex-1 border rounded-lg px-3 py-1"
                              placeholder="Nueva tarea..."
                            />
                            <button
                              onClick={() => handleAddTask(phase.id, category)}
                              className="px-3 py-1 bg-[#FF6B2B] text-white rounded-lg"
                            >
                              Agregar
                            </button>
                          </div>
                        )}

                        <div className="space-y-2">
                          {tasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-bg rounded-lg hover:bg-slate-100 dark:hover:bg-dark-surface transition-all">
                              <div className="flex items-center flex-1">
                                <button
                                  onClick={() => toggleTaskStatus(phase.id, task.id)}
                                  className={`p-1 rounded-full mr-3 ${task.completed ? 'text-green-500 dark:text-green-400' : 'text-slate-300 dark:text-slate-600'}`}
                                >
                                  <CheckCircle2 size={20} />
                                </button>
                                
                                {editingTask === task.id && isEditing ? (
                                  <input
                                    type="text"
                                    value={newTaskText || task.text}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    className="flex-1 border rounded px-2 py-1"
                                  />
                                ) : (
                                  <span className={task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-dark-text-primary'}>
                                    {task.text}
                                  </span>
                                )}
                              </div>

                              {isEditing && renderTaskButtons(task, phase, category)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)
        ) : (
          <div className="text-center text-slate-500 dark:text-dark-text-secondary">
            No hay datos disponibles en el roadmap
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapComponent;