import { create } from 'zustand';
import { type Node, type Edge, addEdge, type OnConnect } from 'reactflow';

export interface PacketAnimation {
  id: string;
  path: string[]; // Array of node IDs
  currentIndex: number;
  type: 'ping' | 'traceroute';
}

export interface SubInterface {
  name: string; // e.g., "Gig0/0.10"
  vlanId: number;
  // IPv4
  ipAddress?: string;
  subnetMask?: string;
  // IPv6
  ipv6Address?: string;
  ipv6PrefixLength?: number;
  ipv6Enabled?: boolean;
  description?: string;
}

export interface NetworkInterface {
  name: string;
  // IPv4
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  // IPv6
  ipv6Address?: string;
  ipv6PrefixLength?: number; // e.g., 64 for /64
  ipv6Gateway?: string;
  ipv6LinkLocal?: string; // Auto-generated link-local address (fe80::/10)
  ipv6Enabled?: boolean;
  // General
  enabled?: boolean;
  vlanId?: number;
  trunkMode?: boolean; // true = trunk port (tagged), false/undefined = access port
  allowedVlans?: number[]; // For trunk ports: list of allowed VLANs (e.g., [10, 20, 30])
  nativeVlan?: number; // For trunk ports: native/untagged VLAN (default 1)
  description?: string;
  speed?: '10' | '100' | '1000' | 'auto';
  duplex?: 'half' | 'full' | 'auto';
  subInterfaces?: SubInterface[]; // For routers: sub-interfaces for VLANs
  // Port position: 'left' | 'right' | 'top' | 'bottom'
  position?: 'left' | 'right' | 'top' | 'bottom';
  // Position offset (0-100%)
  offset?: number;
}

export interface RoutingEntry {
  network: string;
  mask: string;
  nextHop: string;
  metric?: number;
  protocol?: 'static' | 'RIP' | 'OSPF' | 'EIGRP';
  adminDistance?: number;
}

export interface IPv6RoutingEntry {
  network: string; // IPv6 address (e.g., "2001:db8::/64")
  prefixLength: number; // e.g., 64
  nextHop: string; // IPv6 address or interface name
  metric?: number;
  protocol?: 'static' | 'RIPng' | 'OSPFv3' | 'EIGRP';
  adminDistance?: number;
  exitInterface?: string; // Optional: outgoing interface name
}

export interface VLANConfig {
  id: number;
  name: string;
  ports: string[];
}

export interface DHCPPool {
  name: string;
  network: string;
  mask: string;
  defaultRouter?: string;
  dnsServer?: string;
  leaseTime?: number; // in seconds
  excludedAddresses?: string[];
}

export interface DNSRecord {
  hostname: string;
  ipAddress: string;
  type: 'A' | 'AAAA' | 'CNAME';
}

export interface NATConfig {
  type: 'static' | 'dynamic' | 'PAT';
  insideLocal?: string;
  insideGlobal?: string;
  pool?: string;
  interface?: string;
  accessList?: string;
}

export interface DeviceNode extends Node {
  data: {
    label: string;
    type: 'router' | 'switch' | 'pc' | 'server' | 'hub';
    interfaces: NetworkInterface[];
    // Router specific
    routingTable?: RoutingEntry[];
    ipv6RoutingTable?: IPv6RoutingEntry[];
    ipv6Enabled?: boolean; // Global IPv6 enable/disable
    enableSecret?: string;
    hostname?: string;
    dhcpPools?: DHCPPool[];
    dnsRecords?: DNSRecord[];
    natConfig?: NATConfig[];
    // Switch specific
    vlans?: VLANConfig[];
    trunkPorts?: string[];
    spanningTreeEnabled?: boolean;
    vtpMode?: 'server' | 'client' | 'transparent';
    vtpDomain?: string;
    // Server specific
    isDhcpServer?: boolean;
    isDnsServer?: boolean;
    // All devices
    macAddress?: string;
    serialNumber?: string;
    iosVersion?: string;
    runningConfig?: string;
    startupConfig?: string;
  };
}

interface NetworkState {
  nodes: DeviceNode[];
  edges: Edge[];
  selectedNode: DeviceNode | null;
  topologyId: string | null;
  activePackets: PacketAnimation[];
  
  setNodes: (nodes: DeviceNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: DeviceNode) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, data: Partial<DeviceNode['data']>) => void;
  onConnect: OnConnect;
  setSelectedNode: (node: DeviceNode | null) => void;
  setTopologyId: (id: string) => void;
  addPacket: (packet: PacketAnimation) => void;
  updatePacket: (id: string, currentIndex: number) => void;
  removePacket: (id: string) => void;
  clearPackets: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  topologyId: null,
  activePackets: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter((n) => n.id !== id),
    edges: state.edges.filter((e) => e.source !== id && e.target !== id),
  })),

  updateNode: (id, data) => set((state) => {
    const updatedNodes = state.nodes.map((node) =>
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    );
    
    // Aktualizuj i selectedNode pokud je to ten samý node
    const updatedSelectedNode = state.selectedNode?.id === id
      ? updatedNodes.find(n => n.id === id) || null
      : state.selectedNode;

    return {
      nodes: updatedNodes,
      selectedNode: updatedSelectedNode,
    };
  }),

  onConnect: (connection) => set((state) => ({
    edges: addEdge(connection, state.edges),
  })),

  setSelectedNode: (node) => set({ selectedNode: node }),
  setTopologyId: (id) => set({ topologyId: id }),
  
  addPacket: (packet) => set((state) => ({
    activePackets: [...state.activePackets, packet]
  })),
  
  updatePacket: (id, currentIndex) => set((state) => ({
    activePackets: state.activePackets.map(p => 
      p.id === id ? { ...p, currentIndex } : p
    )
  })),
  
  removePacket: (id) => set((state) => ({
    activePackets: state.activePackets.filter(p => p.id !== id)
  })),
  
  clearPackets: () => set({ activePackets: [] }),
}));
