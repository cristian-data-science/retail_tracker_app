import rawCsvData from '../data/roadmap.csv?raw';

// Función simple para procesar el CSV
const processCSVData = () => {
  try {
    // Dividir por líneas y filtrar líneas vacías
    const lines = rawCsvData.split('\n').filter(line => line.trim());
    
    // Separar headers y datos
    const [headerLine, ...dataLines] = lines;
    
    // Procesar línea por línea
    const phases = {};
    
    dataLines.forEach(line => {
      // Manejar el caso especial de campos con comas dentro de comillas
      let fields = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());

      // Extraer datos
      const [fase, categoria, tarea, estado] = fields;
      const phaseId = parseInt(fase);

      // Inicializar fase si no existe
      if (!phases[phaseId]) {
        phases[phaseId] = {
          id: phaseId,
          title: `Fase ${phaseId}: ${getPhaseTitle(phaseId)}`,
          categories: {}
        };
      }

      // Inicializar categoría si no existe
      if (!phases[phaseId].categories[categoria]) {
        phases[phaseId].categories[categoria] = [];
      }

      // Agregar tarea
      phases[phaseId].categories[categoria].push({
        id: Date.now() + Math.random(),
        text: tarea.replace(/^"|"$/g, ''), // Remover comillas
        completed: estado.toLowerCase() === 'true'
      });
    });

    return Object.values(phases);
  } catch (error) {
    console.error('Error procesando CSV:', error, rawCsvData);
    return [];
  }
};

export const getAllPhases = async () => {
  try {
    // Primero intentar obtener del localStorage
    const storedData = localStorage.getItem('roadmapData');
    if (storedData) {
      return JSON.parse(storedData);
    }

    // Si no hay datos en localStorage, procesar el CSV
    console.log('Procesando CSV por primera vez...');
    const phases = processCSVData();
    if (phases.length > 0) {
      localStorage.setItem('roadmapData', JSON.stringify(phases));
    }
    return phases;
  } catch (error) {
    console.error('Error en getAllPhases:', error);
    return [];
  }
};

const getPhaseTitle = (phase) => {
  const titles = {
    1: 'Funcionalidades Básicas',
    2: 'Funcionalidades Intermedias',
    3: 'Funcionalidades Avanzadas',
    4: 'Funcionalidades Expertas'
  };
  return titles[phase] || 'Sin título';
};

// Funciones de modificación
export const updateTask = (taskId, text, completed) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    const updatedData = data.map(phase => ({
      ...phase,
      categories: Object.fromEntries(
        Object.entries(phase.categories).map(([category, tasks]) => [
          category,
          tasks.map(task =>
            task.id === taskId ? { ...task, text, completed } : task
          )
        ])
      )
    }));
    localStorage.setItem('roadmapData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

export const addTask = (categoryId, text) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    const newTask = {
      id: Date.now(), // Usar timestamp como ID único
      text,
      completed: false
    };
    
    const updatedData = data.map(phase => ({
      ...phase,
      categories: Object.fromEntries(
        Object.entries(phase.categories).map(([catName, tasks]) => [
          catName,
          categoryId === catName ? [...tasks, newTask] : tasks
        ])
      )
    }));

    localStorage.setItem('roadmapData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error adding task:', error);
    return false;
  }
};

export const deleteTask = (taskId) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

export const addPhase = (id, title) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    const newPhase = {
      id,
      title,
      categories: {}
    };
    const updatedData = [...data, newPhase];
    localStorage.setItem('roadmapData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error adding phase:', error);
    return false;
  }
};

export const addCategory = (phaseId, name) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    const updatedData = data.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          categories: {
            ...phase.categories,
            [name]: []
          }
        };
      }
      return phase;
    });
    localStorage.setItem('roadmapData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error adding category:', error);
    return false;
  }
};

export const updatePhaseTitle = (phaseId, title) => {
  try {
    const data = JSON.parse(localStorage.getItem('roadmapData') || '[]');
    const updatedData = data.map(phase => 
      phase.id === phaseId ? { ...phase, title } : phase
    );
    localStorage.setItem('roadmapData', JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error updating phase title:', error);
    return false;
  }
};