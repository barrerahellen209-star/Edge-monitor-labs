import { useState, useEffect } from 'react';
import { Server, Plus, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import type { MapServidoresEdge, ServidorEdge } from './types';
import { StorageLaboratorio } from './utils/storage';

const STORAGE_KEY = 'LAB_EDGE_SERVERS_STATE';

const DATASET_INICIAL: MapServidoresEdge = {
  'srv-us-east': {
    id: 'srv-us-east',
    nombre: 'Edge Node Alpha',
    ubicacion: 'N Virginia, USA',
    metricas: { cpu: 42, memoria: 58, peticiones: 1450, estado: 'online' },
    ultimaActualizacion: new Date().toISOString()
  },
  'srv-eu-west': {
    id: 'srv-eu-west',
    nombre: 'Edge Node Beta',
    ubicacion: 'Frankfurt, Germany',
    metricas: { cpu: 88, memoria: 92, peticiones: 4200, estado: 'critical' },
    ultimaActualizacion: new Date().toISOString()
  },
  'srv-m-managua': {
    id: 'srv-managua',
    nombre: 'Edge Node Managua',
    ubicacion: 'Managua, Nicaragua',
    metricas: { cpu: 24, memoria: 32, peticiones: 930, estado: 'online' },
    ultimaActualizacion: new Date().toISOString()
  },
   'srv-msy-masaya': {
    id: 'srv-masaya',
    nombre: 'Edge Node Masaya',
    ubicacion: 'Masaya, Nicaragua',
    metricas: { cpu: 66, memoria: 72, peticiones: 980, estado: 'critical' },
    ultimaActualizacion: new Date().toISOString()
  },

};

export default function App() {
  const [servidores, setServidores] = useState<MapServidoresEdge>(() => {
    const datos = StorageLaboratorio.obtener<MapServidoresEdge>(STORAGE_KEY);
    return datos? datos : DATASET_INICIAL;
  });
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaUbicacion, setNuevaUbicacion] = useState('');

  useEffect(() => {
    StorageLaboratorio.guardar(STORAGE_KEY, servidores);
  }, [servidores]);

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre ||!nuevaUbicacion) return;
    const id = `srv-${Date.now()}`;
    const nuevo: ServidorEdge = {
      id, nombre: nuevoNombre, ubicacion: nuevaUbicacion,
      metricas: { cpu: Math.floor(Math.random()*100), memoria: Math.floor(Math.random()*100), peticiones: Math.floor(Math.random()*5000), estado: 'online' },
      ultimaActualizacion: new Date().toISOString()
    };
    if (nuevo.metricas.cpu > 80 || nuevo.metricas.memoria > 80) nuevo.metricas.estado = 'critical';
    else if (nuevo.metricas.cpu > 60) nuevo.metricas.estado = 'warning';
    setServidores(p => ({...p, [id]: nuevo}));
    setNuevoNombre(''); setNuevaUbicacion('');
  };

  const handleTrafico = () => {
    const upd = Object.entries(servidores).reduce<MapServidoresEdge>((acc, [id, s]) => {
      const cpu = Math.min(100, Math.max(10, s.metricas.cpu + Math.floor(Math.random()*30)-15));
      const mem = Math.min(100, Math.max(10, s.metricas.memoria + Math.floor(Math.random()*20)-10));
      const qps = Math.max(100, s.metricas.peticiones + Math.floor(Math.random()*600)-300);
      let est: 'online'|'warning'|'critical' = 'online';
      if (cpu > 85 || mem > 85) est = 'critical'; else if (cpu > 65) est = 'warning';
      acc[id] = {...s, metricas: {cpu, memoria: mem, peticiones: qps, estado: est}, ultimaActualizacion: new Date().toISOString()};
      return acc;
    }, {});
    setServidores(upd);
  };

  const handleEliminar = (id: string) => {
    const copia = {...servidores}; delete copia[id]; setServidores(copia);
  };

  const lista = Object.values(servidores);
  const total = lista.length;
  const totalQPS = lista.reduce((a,b)=>a+b.metricas.peticiones,0);
  const promCPU = total>0? Math.round(lista.reduce((a,b)=>a+b.metricas.cpu,0)/total):0;
  const criticos = Object.keys(servidores).filter(k=>servidores[k].metricas.estado==='critical').length;

  return (
    <div style={{padding:'2rem', fontFamily:'sans-serif', background:'#f3f4f6', minHeight:'100vh'}}>
      <header style={{display:'flex', justifyContent:'space-between', marginBottom:'2rem'}}>
        <h1 style={{display:'flex', gap:'0.5rem'}}><Server color="#2563eb"/> Panel Edge</h1>
        <button onClick={handleTrafico} style={{padding:'0.5rem 1rem', background:'#0cfcb0', color:'white', border:'none', borderRadius:'6px', cursor:'pointer'}}><RefreshCw size={16}/> Simular Tráfico</button>
      </header>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'2rem'}}>
        <div style={{background:'white', padding:'1rem', borderRadius:'8px'}}>Nodos: <b>{total}</b></div>
        <div style={{background:'white', padding:'1rem', borderRadius:'8px'}}>QPS: <b>{totalQPS}</b></div>
        <div style={{background:'white', padding:'1rem', borderRadius:'8px'}}>CPU: <b>{promCPU}%</b></div>
        <div style={{background: criticos>0?'#faafaf':'white', padding:'1rem', borderRadius:'8px'}}>Críticos: <b>{criticos}</b> {criticos>0&&<ShieldAlert size={18}/>}</div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 3fr', gap:'2rem'}}>
        <aside style={{background:'white', padding:'1rem', borderRadius:'8px', height:'fit-content'}}>
          <h3><Plus size={16}/> Nuevo Nodo</h3>
          <form onSubmit={handleCrear} style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
            <input value={nuevoNombre} onChange={e=>setNuevoNombre(e.target.value)} placeholder="Nombre" style={{padding:'0.5rem'}}/>
            <input value={nuevaUbicacion} onChange={e=>setNuevaUbicacion(e.target.value)} placeholder="Ubicación" style={{padding:'0.5rem'}}/>
            <button type="submit" style={{padding:'0.5rem', background:'#2563eb', color:'white', border:'none', borderRadius:'6px'}}>Registrar</button>
          </form>
        </aside>
        <main style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:'1rem'}}>
          {Object.entries(servidores).map(([id, s])=>(
            <div key={id} style={{background:'white', padding:'1rem', borderRadius:'8px', borderTop:`5px solid ${s.metricas.estado==='critical'?'red': s.metricas.estado==='warning'?'orange':'#e5e7eb'}`}}>
              <button onClick={()=>handleEliminar(id)} style={{float:'right', background:'none', border:'none', cursor:'pointer'}}><Trash2 size={16}/></button>
              <b>{s.nombre}</b><br/><small>{s.ubicacion}</small>
              <div>CPU: {s.metricas.cpu}%</div>
              <div>Mem: {s.metricas.memoria}%</div>
              <div>QPS: {s.metricas.peticiones}</div>
              <small>{id}</small>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}