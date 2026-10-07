// src/utils/storage.ts
export const StorageLaboratorio = {
  /**
   * Guarda cualquier estructura de datos serializándola de manera segura.
   */
  guardar: <T>(clave: string, valor: T): boolean => {
    try {
      const stringJSON = JSON.stringify(valor);
      localStorage.setItem(clave, stringJSON);
      return true;
    } catch (error) {
      if (error instanceof DOMException && (
        error.code === 22 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error("ERROR DE INGENIERÍA: Límite de cuota excedido en localStorage.");
        alert("¡Error de Sistema! El almacenamiento local está completamente lleno.");
      } else {
        console.error("Error inesperado en almacenamiento:", error);
      }
      return false;
    }
  },

  /**
   * Obtiene y deserializa datos de manera segura controlando mutaciones corruptas.
   */
  obtener: <T>(clave: string): T | null => {
    const datosRaw = localStorage.getItem(clave);
    if (!datosRaw) return null;
    try {
      return JSON.parse(datosRaw) as T;
    } catch (error) {
      console.error(`Error al deserializar la clave "${clave}". Datos corruptos.`, error);
      return null;
    }
  }
};