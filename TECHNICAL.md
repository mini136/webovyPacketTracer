# 🛠️ Technické Poznámky

## Architektura

### Frontend Flow
```
User Interaction → Zustand Store → React Components → React Flow Canvas
                                  → API Calls → Backend
                                  → WebSocket → Real-time Updates
```

### Backend Flow
```
HTTP Request → Controller → Service → MongoDB
WebSocket Event → Gateway → Service → Broadcast to Clients
```

## Klíčové Koncepty

### 1. React Flow Nodes
```typescript
// Každé zařízení je Node
{
  id: "router-1",
  type: "device",  // Custom node type
  position: { x: 100, y: 100 },
  data: {
    label: "Router-1",
    type: "router",
    interfaces: [...],
    configuration: {...}
  }
}
```

### 2. Edges = Kabely
```typescript
{
  id: "e1-2",
  source: "router-1",
  target: "switch-1",
  sourceHandle: "eth0",
  targetHandle: "eth1"
}
```

### 3. MongoDB Schéma

#### Topology (Projekt)
```typescript
{
  _id: ObjectId,
  name: "My Network",
  userId: "user123",
  createdAt: Date,
  updatedAt: Date
}
```

#### Device (Zařízení)
```typescript
{
  _id: ObjectId,
  name: "Router-1",
  type: "router",
  positionX: 100,
  positionY: 200,
  interfaces: [
    {
      name: "eth0",
      ipAddress: "192.168.1.1",
      subnetMask: "255.255.255.0",
      status: "up",
      macAddress: "00:1A:2B:3C:4D:5E"
    }
  ],
  configuration: {
    hostname: "Router-1",
    routes: [...]
  },
  topologyId: ObjectId
}
```

#### Connection (Kabel)
```typescript
{
  _id: ObjectId,
  sourceDeviceId: ObjectId,
  sourceInterface: "eth0",
  targetDeviceId: ObjectId,
  targetInterface: "eth1",
  cableType: "straight",
  status: "up",
  topologyId: ObjectId
}
```

## State Management

### Zustand Store
```typescript
// Global state pro celou síť
{
  nodes: DeviceNode[],        // Všechna zařízení
  edges: Edge[],              // Všechna propojení
  selectedNode: DeviceNode,   // Vybrané zařízení
  topologyId: string          // Aktuální projekt
}
```

### Proč Zustand?
- Jednodušší než Redux
- TypeScript friendly
- Malá velikost (1KB)
- Hooks-based API

## WebSocket Events

### Client → Server
```typescript
// Připojení k topologii
emit('joinTopology', topologyId)

// Odeslání paketu
emit('sendPacket', {
  sourceDeviceId: "router-1",
  targetDeviceId: "pc-1",
  protocol: "ICMP",
  payload: {...}
})

// Ping
emit('ping', {
  sourceId: "pc-1",
  targetIp: "192.168.1.1",
  topologyId: "..."
})
```

### Server → Client
```typescript
// Paket byl odeslán
on('packetSent', (packet) => {
  // Zobraz animaci
})

// Paket doručen
on('packetDelivered', (packet) => {
  // Update stavu
})

// Ping výsledek
on('pingResult', (result) => {
  // Zobraz RTT
})
```

## Simulační Engine (TODO)

### Routing Algoritmus
```typescript
// Pseudo-kod
function routePacket(packet, device) {
  // 1. Check routing table
  const route = device.findRoute(packet.destIp);
  
  // 2. Find next hop
  if (route) {
    const nextHop = route.nextHop;
    const interface = device.findInterface(route.interface);
    
    // 3. Decrement TTL
    packet.ttl--;
    if (packet.ttl === 0) {
      return { error: 'TTL exceeded' };
    }
    
    // 4. Forward packet
    return forwardToNextHop(packet, nextHop, interface);
  } else {
    return { error: 'No route to host' };
  }
}
```

### Switching Logic
```typescript
// MAC address table learning
function processFrame(frame, switchPort) {
  // Learn source MAC
  macTable.set(frame.sourceMac, switchPort);
  
  // Lookup destination
  const destPort = macTable.get(frame.destMac);
  
  if (destPort) {
    // Unicast
    forward(frame, destPort);
  } else {
    // Flood to all ports except incoming
    flood(frame, excludePort: switchPort);
  }
}
```

## Performance Tips

### 1. Virtualizace Canvas
Pro velké sítě (100+ zařízení):
```typescript
// Use React Flow's viewport-based rendering
<ReactFlow
  onlyRenderVisibleElements={true}
  nodesDraggable={true}
/>
```

### 2. Debounce Updates
```typescript
// Pri drag & drop
const debouncedUpdate = useDebouncedCallback(
  (nodes) => updateNodePositions(nodes),
  500
);
```

### 3. WebWorker pro Simulace
```typescript
// Těžké výpočty mimo main thread
const worker = new Worker('simulation-worker.js');
worker.postMessage({ type: 'routePacket', packet });
```

## Debugging

### Backend
```bash
# NestJS má skvělé logy
npm run start:dev

# MongoDB queries
mongosh
use network-simulator
db.devices.find()
```

### Frontend
```javascript
// Zustand DevTools
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools((set) => ({...}))
)

// React Flow DevTools
// Automaticky v dev mode
```

## Common Issues

### 1. CORS Error
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true,
});
```

### 2. MongoDB Connection Failed
```typescript
// Zkontroluj connection string
MongooseModule.forRoot('mongodb://localhost:27017/network-simulator')

// Nebo použij environment variable
MongooseModule.forRoot(process.env.MONGODB_URI)
```

### 3. WebSocket Not Connecting
```typescript
// Zkontroluj CORS v gateway
@WebSocketGateway({
  cors: {
    origin: '*',  // Pro development
  },
})
```

## Testování

### Unit Tests (Backend)
```bash
cd backend
npm run test
```

### E2E Tests
```typescript
// TODO: Implementovat Playwright testy
test('should add router to canvas', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Router');
  // Assert router appears on canvas
});
```

## Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Backend
cd backend
npm run build
# Output: dist/
```

### Docker
```bash
docker-compose up --build
```

### Environment Variables
```bash
# Production
MONGODB_URI=mongodb+srv://...
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## Další Čtení

- [React Flow Docs](https://reactflow.dev/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)
- [Cisco IOS Commands](https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/fundamentals/command/cf_command_ref.html)
