import { useState } from 'react';
import { useNetworkStore } from '../store/networkStore';
import type { DeviceNode } from '../store/networkStore';
import SubnettingCalculator from './SubnettingCalculator';

const deviceTypes = [
  { type: 'router', label: 'Router', icon: '⚡', color: '#2563eb', desc: 'Layer 3 routing' },
  { type: 'switch', label: 'Switch', icon: '�', color: '#059669', desc: 'Layer 2 switching' },
  { type: 'pc', label: 'PC', icon: '💻', color: '#7c3aed', desc: 'End device' },
  { type: 'server', label: 'Server', icon: '🖥️', color: '#dc2626', desc: 'Network server' },
  { type: 'hub', label: 'Hub', icon: '⭐', color: '#ea580c', desc: 'Basic hub' },
] as const;

interface SidebarProps {
  onOpenNetworkTools: () => void;
}

export default function Sidebar({ onOpenNetworkTools }: SidebarProps) {
  const { addNode, nodes, setNodes, setEdges } = useNetworkStore();
  const [showSubnettingCalc, setShowSubnettingCalc] = useState(false);

  const handleAddDevice = (type: 'router' | 'switch' | 'pc' | 'server' | 'hub', label: string) => {
    // Začni s jedním portem, další se přidají manuálně
    let interfaces: Array<{ name: string }> = [];
    
    if (type === 'router') {
      interfaces = [
        { name: 'Gig0/0' },
      ];
    } else if (type === 'switch') {
      interfaces = [
        { name: 'Fa0/1' },
      ];
    } else if (type === 'pc') {
      interfaces = [
        { name: 'Eth0' },
      ];
    } else if (type === 'server') {
      interfaces = [
        { name: 'Eth0' },
      ];
    } else if (type === 'hub') {
      interfaces = [
        { name: 'Port1' },
      ];
    }

    const newNode: DeviceNode = {
      id: `${type}-${Date.now()}`,
      type: 'device',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `${label}-${nodes.filter(n => n.data.type === type).length + 1}`,
        type: type,
        interfaces: interfaces,
      },
    };
    addNode(newNode);
  };

  const handleClearAll = () => {
    if (confirm('Smazat všechna zařízení?')) {
      setNodes([]);
    }
  };

  const handleCreateSampleNetwork = () => {
    // Vytvoř pokročilou síť: PC1 -> Switch1 -> Router1 -> Router2 -> Switch2 -> PC2
    // Demonstrací routing table mezi dvěma sítěmi
    const sampleNodes: DeviceNode[] = [
      // Router 1 - Gateway pro VLANy 10 a 20 (router-on-a-stick)
      {
        id: 'router-sample-1',
        type: 'device',
        position: { x: 250, y: 100 },
        data: {
          label: 'Router-1',
          type: 'router' as const,
          interfaces: [
            { 
              name: 'Gig0/0', 
              trunkMode: true,
              description: '802.1Q trunk to Switch-1',
              subInterfaces: [
                { name: 'Gig0/0.10', vlanId: 10, ipAddress: '192.168.10.1', subnetMask: '255.255.255.0', description: 'VLAN 10 - PC1' },
                { name: 'Gig0/0.20', vlanId: 20, ipAddress: '192.168.20.1', subnetMask: '255.255.255.0', description: 'VLAN 20 - PC2' },
              ]
            },
            { name: 'Gig0/1', ipAddress: '10.0.0.1', subnetMask: '255.255.255.252', description: 'Link to Router-2' },
            { name: 'Gig0/2' },
            { name: 'Gig0/3' },
          ],
          routingTable: [
            {
              network: '192.168.30.0',
              mask: '255.255.255.0',
              nextHop: '10.0.0.2',
              metric: 1,
              protocol: 'static' as const,
            },
            {
              network: '192.168.40.0',
              mask: '255.255.255.0',
              nextHop: '10.0.0.2',
              metric: 1,
              protocol: 'static' as const,
            }
          ],
          dhcpPools: [
            {
              name: 'VLAN10',
              network: '192.168.10.0',
              mask: '255.255.255.0',
              defaultRouter: '192.168.10.1',
              dnsServer: '192.168.10.1',
              leaseTime: 86400,
            },
            {
              name: 'VLAN20',
              network: '192.168.20.0',
              mask: '255.255.255.0',
              defaultRouter: '192.168.20.1',
              dnsServer: '192.168.10.1',
              leaseTime: 86400,
            }
          ],
          isDhcpServer: true,
          dnsRecords: [
            { hostname: 'router1.local', ipAddress: '192.168.10.1', type: 'A' as const },
            { hostname: 'pc1.local', ipAddress: '192.168.10.10', type: 'A' as const },
            { hostname: 'pc2.local', ipAddress: '192.168.20.10', type: 'A' as const },
            { hostname: 'pc3.local', ipAddress: '192.168.30.10', type: 'A' as const },
            { hostname: 'pc4.local', ipAddress: '192.168.40.10', type: 'A' as const },
          ],
          isDnsServer: true,
        },
      },
      // Router 2 - Gateway pro VLANy 30 a 40 (router-on-a-stick)
      {
        id: 'router-sample-2',
        type: 'device',
        position: { x: 500, y: 100 },
        data: {
          label: 'Router-2',
          type: 'router' as const,
          interfaces: [
            { name: 'Gig0/0', ipAddress: '10.0.0.2', subnetMask: '255.255.255.252', description: 'Link to Router-1' },
            { 
              name: 'Gig0/1', 
              trunkMode: true,
              description: '802.1Q trunk to Switch-2',
              subInterfaces: [
                { name: 'Gig0/1.30', vlanId: 30, ipAddress: '192.168.30.1', subnetMask: '255.255.255.0', description: 'VLAN 30 - PC3' },
                { name: 'Gig0/1.40', vlanId: 40, ipAddress: '192.168.40.1', subnetMask: '255.255.255.0', description: 'VLAN 40 - PC4' },
              ]
            },
            { name: 'Gig0/2' },
            { name: 'Gig0/3' },
          ],
          routingTable: [
            {
              network: '192.168.10.0',
              mask: '255.255.255.0',
              nextHop: '10.0.0.1',
              metric: 1,
              protocol: 'static' as const,
            },
            {
              network: '192.168.20.0',
              mask: '255.255.255.0',
              nextHop: '10.0.0.1',
              metric: 1,
              protocol: 'static' as const,
            }
          ],
          dhcpPools: [
            {
              name: 'VLAN30',
              network: '192.168.30.0',
              mask: '255.255.255.0',
              defaultRouter: '192.168.30.1',
              dnsServer: '192.168.10.1',
              leaseTime: 86400,
            },
            {
              name: 'VLAN40',
              network: '192.168.40.0',
              mask: '255.255.255.0',
              defaultRouter: '192.168.40.1',
              dnsServer: '192.168.10.1',
              leaseTime: 86400,
            }
          ],
          isDhcpServer: true,
          dnsRecords: [
            { hostname: 'router2.local', ipAddress: '192.168.30.1', type: 'A' as const },
          ],
          isDnsServer: true,
        },
      },
      // Switch 1 - Trunk port k routeru, access porty pro PC
      {
        id: 'switch-sample-1',
        type: 'device',
        position: { x: 150, y: 250 },
        data: {
          label: 'Switch-1',
          type: 'switch' as const,
          interfaces: [
            { name: 'Fa0/1', vlanId: 1, trunkMode: true, description: '802.1Q trunk to Router-1' },
            { name: 'Fa0/2', vlanId: 10, description: 'Access port - PC1' },
            { name: 'Fa0/3', vlanId: 20, description: 'Access port - PC2' },
            { name: 'Fa0/4', vlanId: 1 },
            { name: 'Fa0/5', vlanId: 1 },
            { name: 'Fa0/6', vlanId: 1 },
            { name: 'Fa0/7', vlanId: 1 },
            { name: 'Fa0/8', vlanId: 1 },
          ],
          vlans: [
            { id: 1, name: 'default', ports: ['Fa0/4', 'Fa0/5', 'Fa0/6', 'Fa0/7', 'Fa0/8'] },
            { id: 10, name: 'VLAN_PC1', ports: ['Fa0/2'] },
            { id: 20, name: 'VLAN_PC2', ports: ['Fa0/3'] },
          ],
        },
      },
      // Switch 2 - Trunk port k routeru, access porty pro PC
      {
        id: 'switch-sample-2',
        type: 'device',
        position: { x: 600, y: 250 },
        data: {
          label: 'Switch-2',
          type: 'switch' as const,
          interfaces: [
            { name: 'Fa0/1', vlanId: 1, trunkMode: true, description: '802.1Q trunk to Router-2' },
            { name: 'Fa0/2', vlanId: 30, description: 'Access port - PC3' },
            { name: 'Fa0/3', vlanId: 40, description: 'Access port - PC4' },
            { name: 'Fa0/4', vlanId: 1 },
            { name: 'Fa0/5', vlanId: 1 },
            { name: 'Fa0/6', vlanId: 1 },
            { name: 'Fa0/7', vlanId: 1 },
            { name: 'Fa0/8', vlanId: 1 },
          ],
          vlans: [
            { id: 1, name: 'default', ports: ['Fa0/4', 'Fa0/5', 'Fa0/6', 'Fa0/7', 'Fa0/8'] },
            { id: 30, name: 'VLAN_PC3', ports: ['Fa0/2'] },
            { id: 40, name: 'VLAN_PC4', ports: ['Fa0/3'] },
          ],
        },
      },
      // PC1 - VLAN 10, síť 192.168.10.0/24
      {
        id: 'pc-sample-1',
        type: 'device',
        position: { x: 50, y: 400 },
        data: {
          label: 'PC-1',
          type: 'pc' as const,
          interfaces: [
            { name: 'Eth0', ipAddress: '192.168.10.10', subnetMask: '255.255.255.0', gateway: '192.168.10.1' }
          ],
        },
      },
      // PC2 - VLAN 20, síť 192.168.20.0/24
      {
        id: 'pc-sample-2',
        type: 'device',
        position: { x: 250, y: 400 },
        data: {
          label: 'PC-2',
          type: 'pc' as const,
          interfaces: [
            { name: 'Eth0', ipAddress: '192.168.20.10', subnetMask: '255.255.255.0', gateway: '192.168.20.1' }
          ],
        },
      },
      // PC3 - VLAN 30, síť 192.168.30.0/24
      {
        id: 'pc-sample-3',
        type: 'device',
        position: { x: 500, y: 400 },
        data: {
          label: 'PC-3',
          type: 'pc' as const,
          interfaces: [
            { name: 'Eth0', ipAddress: '192.168.30.10', subnetMask: '255.255.255.0', gateway: '192.168.30.1' }
          ],
        },
      },
      // PC4 - VLAN 40, síť 192.168.40.0/24
      {
        id: 'pc-sample-4',
        type: 'device',
        position: { x: 700, y: 400 },
        data: {
          label: 'PC-4',
          type: 'pc' as const,
          interfaces: [
            { name: 'Eth0', ipAddress: '192.168.40.10', subnetMask: '255.255.255.0', gateway: '192.168.40.1' }
          ],
        },
      },
    ];

    const sampleEdges: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
      type: string;
      animated: boolean;
      style: { stroke: string; strokeWidth: number };
    }> = [
      // Router1 Gig0/0 <-> Switch1 Fa0/1 (802.1Q trunk - VLANy 10, 20)
      {
        id: 'e-r1-sw1-trunk',
        source: 'router-sample-1',
        target: 'switch-sample-1',
        sourceHandle: 'port-0',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 3 },
      },
      // Router1 Gig0/1 <-> Router2 Gig0/0 (inter-router link)
      {
        id: 'e-r1-r2',
        source: 'router-sample-1',
        target: 'router-sample-2',
        sourceHandle: 'port-1',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#ea580c', strokeWidth: 2 },
      },
      // Router2 Gig0/1 <-> Switch2 Fa0/1 (802.1Q trunk - VLANy 30, 40)
      {
        id: 'e-r2-sw2-trunk',
        source: 'router-sample-2',
        target: 'switch-sample-2',
        sourceHandle: 'port-1',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 3 },
      },
      // Switch1 Fa0/2 <-> PC1 (VLAN 10 access port)
      {
        id: 'e-sw1-pc1',
        source: 'switch-sample-1',
        target: 'pc-sample-1',
        sourceHandle: 'port-1',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      },
      // Switch1 Fa0/3 <-> PC2 (VLAN 20 access port)
      {
        id: 'e-sw1-pc2',
        source: 'switch-sample-1',
        target: 'pc-sample-2',
        sourceHandle: 'port-2',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      // Switch2 Fa0/2 <-> PC3 (VLAN 30 access port)
      {
        id: 'e-sw2-pc3',
        source: 'switch-sample-2',
        target: 'pc-sample-3',
        sourceHandle: 'port-1',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
      },
      // Switch2 Fa0/3 <-> PC4 (VLAN 40 access port)
      {
        id: 'e-sw2-pc4',
        source: 'switch-sample-2',
        target: 'pc-sample-4',
        sourceHandle: 'port-2',
        targetHandle: 'port-0-in',
        type: 'default',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
      },
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
    alert('✅ Ukázková síť vytvořena!\n\n📍 Síť 1 (192.168.1.0/24):\n  Router-1: 192.168.1.1\n  PC-1: 192.168.1.10\n  PC-2: 192.168.1.11\n\n📍 Síť 2 (192.168.2.0/24):\n  Router-2: 192.168.2.1\n  PC-3: 192.168.2.10\n  PC-4: 192.168.2.11\n\n🔗 Router Link: 10.0.0.1 ↔ 10.0.0.2\n\n🗺️ Routing tables nakonfigurovány!\nTester ping mezi PC-1 a PC-3');
  };

  return (
    <div
      style={{
        width: '12.6vw',
        minWidth: '196px',
        maxWidth: '245px',
        background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
        color: 'white',
        padding: '17px',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '1.5px 0 7px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ marginBottom: '17px' }}>
        <h1 style={{ 
          fontSize: '17px', 
          fontWeight: '700', 
          marginBottom: '6px',
          background: 'linear-gradient(to right, #60a5fa, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Network Simulator
        </h1>
        <p style={{ fontSize: '8px', color: '#94a3b8' }}>
          Cisco Packet Tracer clone
        </p>
      </div>

      <div style={{ 
        marginBottom: '14px', 
        padding: '8px', 
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '6px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      }}>
        <div style={{ fontSize: '8px', color: '#93c5fd', marginBottom: '3px' }}>
          ZAŘÍZENÍ V SÍTI
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#60a5fa' }}>
          {nodes.length}
        </div>
      </div>
      
      <h2 style={{ 
        fontSize: '10px', 
        fontWeight: '600', 
        marginBottom: '11px',
        color: '#cbd5e1',
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
      }}>
        📦 Devices
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '17px' }}>
        {deviceTypes.map(({ type, label, icon, color, desc }) => (
          <button
            key={type}
            onClick={() => handleAddDevice(type, label)}
            style={{
              padding: '10px',
              background: 'rgba(51, 65, 85, 0.5)',
              border: `1.5px solid rgba(148, 163, 184, 0.2)`,
              borderRadius: '7px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(51, 65, 85, 0.8)`;
              e.currentTarget.style.borderColor = color;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ 
              fontSize: '20px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}20`,
              borderRadius: '6px',
            }}>
              {icon}
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontWeight: '600', marginBottom: '1px' }}>{label}</div>
              <div style={{ fontSize: '8px', color: '#94a3b8' }}>{desc}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ 
        paddingTop: '14px', 
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}>
        <h3 style={{ 
          fontSize: '10px', 
          marginBottom: '6px',
          color: '#cbd5e1',
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          fontWeight: '600',
        }}>
          🛠️ Tools
        </h3>
        
        <button
          onClick={handleCreateSampleNetwork}
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 3px 4px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.2s',
            marginBottom: '7px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 4px rgba(124, 58, 237, 0.3)';
          }}
        >
          ⚡ Ukázková Síť
        </button>
        
        <button
          onClick={onOpenNetworkTools}
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 3px 4px rgba(14, 165, 233, 0.3)',
            transition: 'all 0.2s',
            marginBottom: '7px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(14, 165, 233, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 4px rgba(14, 165, 233, 0.3)';
          }}
        >
          🔧 Network Tools
        </button>
        
        <button
          onClick={() => setShowSubnettingCalc(true)}
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 3px 4px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.2s',
            marginBottom: '7px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 4px rgba(139, 92, 246, 0.3)';
          }}
        >
          🧮 Subnetting Calc
        </button>
        
        <button
          style={{
            width: '100%',
            padding: '8px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 3px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1.5px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 3px 4px rgba(0,0,0,0.1)';
          }}
        >
          💾 Uložit Topologii
        </button>

        <button
          onClick={handleClearAll}
          style={{
            width: '100%',
            padding: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#fca5a5',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
        >
          🗑️ Vymazat Vše
        </button>
      </div>

      {showSubnettingCalc && <SubnettingCalculator onClose={() => setShowSubnettingCalc(false)} />}
    </div>
  );
}
