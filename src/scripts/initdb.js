import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { importFromCSV } from '../db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const init = async () => {
  try {
    console.log('Iniciando importación de datos...');
    const result = await importFromCSV();
    if (result) {
      console.log('Base de datos inicializada correctamente');
    } else {
      console.error('Error al inicializar la base de datos');
    }
  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }
};

init();