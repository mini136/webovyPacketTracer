import { useEffect } from 'react';
import { useNetworkStore } from '../store/networkStore';

export default function PacketAnimation() {
  const { activePackets, nodes, edges, updatePacket, removePacket } = useNetworkStore();

  useEffect(() => {
    if (activePackets.length === 0) return;

    const interval = setInterval(() => {
      activePackets.forEach(packet => {
        if (packet.currentIndex < packet.path.length - 1) {
          updatePacket(packet.id, packet.currentIndex + 1);
        } else {
          // Paket dorazil na konec
          setTimeout(() => removePacket(packet.id), 500);
        }
      });
    }, 600); // Každých 600ms posun na další hop

    return () => clearInterval(interval);
  }, [activePackets, updatePacket, removePacket]);

  return (
    <>
      {activePackets.map(packet => {
        if (packet.currentIndex >= packet.path.length) return null;

        const currentNodeId = packet.path[packet.currentIndex];
        const currentNode = nodes.find(n => n.id === currentNodeId);
        
        if (!currentNode) return null;

        // Najdi edge mezi current a next node pro animaci paketu
        if (packet.currentIndex < packet.path.length - 1) {
          const nextNodeId = packet.path[packet.currentIndex + 1];
          edges.find(e => 
            (e.source === currentNodeId && e.target === nextNodeId) ||
            (e.target === currentNodeId && e.source === nextNodeId)
          );
        }

        return (
          <div key={packet.id}>
            {/* Zvýrazni aktivní zařízení */}
            <div
              style={{
                position: 'absolute',
                left: currentNode.position.x - 10,
                top: currentNode.position.y - 10,
                width: '132px',
                height: '132px',
                borderRadius: '12px',
                border: `3px solid ${packet.type === 'ping' ? '#10b981' : '#3b82f6'}`,
                background: `${packet.type === 'ping' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`,
                animation: 'pulse 1s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 999,
              }}
            />
            
            {/* Paket icon */}
            <div
              style={{
                position: 'absolute',
                left: currentNode.position.x + 50,
                top: currentNode.position.y - 30,
                fontSize: '20px',
                animation: 'bounce 0.6s ease-in-out infinite',
                pointerEvents: 'none',
                zIndex: 1000,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              }}
            >
              📦
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}
