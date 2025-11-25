import { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface DeviceNodeProps {
  id: string;
  data: {
    label: string;
    type: 'router' | 'switch' | 'pc' | 'server' | 'hub';
    interfaces: Array<{ 
      name: string; 
      ipAddress?: string;
      subnetMask?: string;
      ipv6Address?: string;
      gateway?: string;
      enabled?: boolean;
      vlanId?: number;
      description?: string;
      position?: 'left' | 'right' | 'top' | 'bottom';
      offset?: number;
    }>;
  };
  selected?: boolean;
}

const deviceConfig: Record<string, { 
  icon: string; 
  color: string; 
  bgColor: string; 
}> = {
  router: { 
    icon: '⚡', 
    color: '#2563eb', 
    bgColor: '#dbeafe',
  },
  switch: { 
    icon: '🔀', 
    color: '#059669', 
    bgColor: '#d1fae5',
  },
  pc: { 
    icon: '💻', 
    color: '#7c3aed', 
    bgColor: '#ede9fe',
  },
  server: { 
    icon: '🖥️', 
    color: '#dc2626', 
    bgColor: '#fee2e2',
  },
  hub: { 
    icon: '⭐', 
    color: '#ea580c', 
    bgColor: '#ffedd5',
  },
};

function DeviceNode({ data, selected }: DeviceNodeProps) {
  const { label, type } = data;
  const config = deviceConfig[type] || deviceConfig.router;

  // Pevný počet portů podle typu zařízení
  const portCount = type === 'router' ? 4 : 
                    type === 'switch' ? 8 : 
                    1; // PC/Server

  // Generuj názvy portů
  const getPortName = (index: number) => {
    if (type === 'router') return `Gig0/${index}`;
    if (type === 'switch') return `Fa0/${index + 1}`;
    return `Eth${index}`;
  };

  return (
    <div
      style={{
        padding: '11px',
        borderRadius: '8px',
        background: 'white',
        border: `2px solid ${selected ? '#fbbf24' : config.color}`,
        minWidth: '112px',
        minHeight: '120px',
        textAlign: 'center',
        boxShadow: selected 
          ? '0 14px 18px -4px rgba(0, 0, 0, 0.1), 0 7px 7px -4px rgba(0, 0, 0, 0.04)'
          : '0 3px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Všechny porty - rozmístěné po obvodu */}
      {Array.from({ length: portCount }).map((_, index) => {
        let portPosition: 'left' | 'right' | 'top' | 'bottom';
        let portOffset: number;
        
        // Automatické rozmístění pouze po levé a pravé straně
        const totalPorts = portCount;
        
        if (type === 'router') {
          // Router: 4 porty, každý 15% od rohu
          // Port 0,1 vlevo: 15%, 30%
          // Port 2,3 vpravo: 15%, 30%
          if (index < 2) {
            portPosition = 'left';
            portOffset = 15 + (index * 15);
          } else {
            portPosition = 'right';
            portOffset = 15 + ((index - 2) * 15);
          }
        } else {
          // Switch a ostatní: rovnoměrné rozmístění
          const leftPorts = Math.ceil(totalPorts / 2);
          const rightPorts = totalPorts - leftPorts;
          
          if (index < leftPorts) {
            // Levá strana
            portPosition = 'left';
            portOffset = ((index + 1) / (leftPorts + 1)) * 100;
          } else {
            // Pravá strana
            portPosition = 'right';
            const rightIndex = index - leftPorts;
            portOffset = ((rightIndex + 1) / (rightPorts + 1)) * 100;
          }
        }
        
        const getLabelStyle = () => {
          if (portPosition === 'left') {
            return { left: '-50px', top: `${portOffset}%`, transform: 'translateY(-50%)' };
          } else {
            return { right: '-50px', top: `${portOffset}%`, transform: 'translateY(-50%)' };
          }
        };
        
        const handlePosition = portPosition === 'left' ? Position.Left : 
                              portPosition === 'right' ? Position.Right :
                              portPosition === 'top' ? Position.Top : Position.Bottom;
        
        // Style pro umístění handle na správnou pozici
        const handleStyle = portPosition === 'left' || portPosition === 'right'
          ? { top: `${portOffset}%` }
          : { left: `${portOffset}%` };
        
        const portName = getPortName(index);
        
        return (
          <div key={`port-${index}`} style={{ pointerEvents: 'none' }}>
            {/* Obousměrný handle */}
            <Handle
              type="source"
              position={handlePosition}
              id={`port-${index}`}
              isConnectable={true}
              style={{
                ...handleStyle,
                background: config.color,
                width: '8px',
                height: '8px',
                border: '1.5px solid white',
                cursor: 'crosshair',
                pointerEvents: 'auto',
              }}
            />
            {/* Druhý handle na stejném místě pro target */}
            <Handle
              type="target"
              position={handlePosition}
              id={`port-${index}-in`}
              isConnectable={true}
              style={{
                ...handleStyle,
                background: 'transparent',
                width: '16px',
                height: '16px',
                border: 'none',
                cursor: 'crosshair',
                pointerEvents: 'auto',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div style={{
              position: 'absolute',
              ...getLabelStyle(),
              fontSize: '7px',
              fontWeight: '600',
              color: config.color,
              backgroundColor: 'white',
              padding: '2px 4px',
              borderRadius: '3px',
              border: `1px solid ${config.color}`,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}>
              {portName}
            </div>
          </div>
        );
      })}

      {/* Top port (skrytý pro příjem spojení) */}
      <Handle 
        type="target" 
        position={Position.Top}
        id="port-top"
        style={{
          background: 'transparent',
          border: 'none',
          width: '1px',
          height: '1px',
          opacity: 0,
        }}
      />

      {/* Bottom port (skrytý pro příjem spojení) */}
      <Handle 
        type="target" 
        position={Position.Bottom}
        id="port-bottom"
        style={{
          background: 'transparent',
          border: 'none',
          width: '1px',
          height: '1px',
          opacity: 0,
        }}
      />
      
      <div 
        style={{ 
          fontSize: '34px', 
          marginBottom: '6px',
          background: config.bgColor,
          borderRadius: '6px',
          padding: '8px',
        }}
      >
        {config.icon}
      </div>
      
      <div style={{ 
        fontWeight: '600', 
        fontSize: '10px', 
        color: '#111827',
        marginBottom: '3px',
      }}>
        {label}
      </div>
      
      <div style={{ 
        fontSize: '7px', 
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        fontWeight: '500',
      }}>
        {type} ({portCount} ports)
      </div>
    </div>
  );
}

export default memo(DeviceNode);
