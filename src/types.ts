
export interface MetricasServidor {
  cpu: number; // Porcentaje (0-100)
  memoria: number; // Porcentaje (0-100)
  peticiones: number; // QPS (Queries per second)
  estado: 'online' | 'warning' | 'critical';
}

export interface ServidorEdge {
  id: string;
  nombre: string;
  ubicacion: string;
  metricas: MetricasServidor;
  ultimaActualizacion: string;
}

// Estructura de Diccionario (Hash Map) para el estado global
// Esto obligará a los alumnos a recorrer el objeto usando Object.keys/values/entries
export type MapServidoresEdge = Record<string, ServidorEdge>;