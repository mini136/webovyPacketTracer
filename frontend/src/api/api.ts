import axios from 'axios';

const API_URL = 'http://localhost:3000';

function readAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

type TopologyData = {
  name: string;
  userId: string;
  description?: string;
  devices?: unknown[];
  connections?: unknown[];
};

type DeviceData = {
  topologyId: string;
  name: string;
  type: string;
  positionX: number;
  positionY: number;
  interfaces: unknown[];
};

type ConnectionData = {
  topologyId: string;
  sourceDeviceId: string;
  sourcePort: string;
  targetDeviceId: string;
  targetPort: string;
  sourceInterface?: string;
  targetInterface?: string;
  cableType?: string;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = readAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Topology API
export const topologyApi = {
  getAll: (userId: string) => api.get(`/topologies?userId=${userId}`),
  getOne: (id: string) => api.get(`/topologies/${id}`),
  create: (data: TopologyData) => api.post('/topologies', data),
  update: (id: string, data: Partial<TopologyData>) => api.put(`/topologies/${id}`, data),
  delete: (id: string) => api.delete(`/topologies/${id}`),
};

// Device API
export const deviceApi = {
  getByTopology: (topologyId: string) => api.get(`/devices?topologyId=${topologyId}`),
  getOne: (id: string) => api.get(`/devices/${id}`),
  create: (data: DeviceData) => api.post('/devices', data),
  update: (id: string, data: Partial<DeviceData>) => api.put(`/devices/${id}`, data),
  delete: (id: string) => api.delete(`/devices/${id}`),
};

// Connection API
export const connectionApi = {
  getByTopology: (topologyId: string) => api.get(`/connections?topologyId=${topologyId}`),
  create: (data: ConnectionData) => api.post('/connections', data),
  delete: (id: string) => api.delete(`/connections/${id}`),
};

// Labs API (MSSQL-backed)
type CreateLabData = {
  name: string;
  description?: string;
  isPublic?: boolean;
};

export const labsApi = {
  list: () => api.get('/labs'),
  create: (data: CreateLabData) => api.post('/labs', data),
  update: (id: string, data: Partial<CreateLabData>) => api.put(`/labs/${id}`, data),
  delete: (id: string) => api.delete(`/labs/${id}`),
  attachTopology: (id: string) => api.post(`/labs/${id}/attach-topology`),
};
