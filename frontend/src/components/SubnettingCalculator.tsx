import { useState } from 'react';

export default function SubnettingCalculator({ onClose }: { onClose: () => void }) {
  const [ip, setIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState('24');
  const [result, setResult] = useState<{
    ip: string;
    cidr: number;
    subnetMask: string;
    wildcardMask: string;
    network: string;
    broadcast: string;
    firstUsable: string;
    lastUsable: string;
    totalHosts: number;
    usableHosts: number;
    ipClass: string;
    isPrivate: boolean;
  } | null>(null);

  const calculateSubnet = () => {
    const cidrNum = parseInt(cidr);
    if (cidrNum < 0 || cidrNum > 32) {
      alert('CIDR musí být mezi 0-32');
      return;
    }

    const ipParts = ip.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(p => p < 0 || p > 255)) {
      alert('Neplatná IP adresa');
      return;
    }

    // Calculate subnet mask
    const mask: number[] = [];
    for (let i = 0; i < 4; i++) {
      if (cidrNum >= (i + 1) * 8) {
        mask.push(255);
      } else if (cidrNum > i * 8) {
        mask.push(256 - Math.pow(2, 8 - (cidrNum - i * 8)));
      } else {
        mask.push(0);
      }
    }

    // Calculate wildcard mask
    const wildcard = mask.map(m => 255 - m);

    // Calculate network address
    const network = ipParts.map((p, i) => p & mask[i]);

    // Calculate broadcast address
    const broadcast = network.map((p, i) => p | wildcard[i]);

    // Calculate first and last usable IP
    const firstUsable = [...network];
    firstUsable[3] += 1;
    
    const lastUsable = [...broadcast];
    lastUsable[3] -= 1;

    // Calculate number of hosts
    const totalHosts = Math.pow(2, 32 - cidrNum);
    const usableHosts = totalHosts - 2;

    // Determine class
    const firstOctet = ipParts[0];
    let ipClass = '';
    if (firstOctet >= 1 && firstOctet <= 126) ipClass = 'A';
    else if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'B';
    else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'C';
    else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'D (Multicast)';
    else if (firstOctet >= 240 && firstOctet <= 255) ipClass = 'E (Reserved)';

    // Check if private
    const isPrivate = 
      (firstOctet === 10) ||
      (firstOctet === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
      (firstOctet === 192 && ipParts[1] === 168);

    setResult({
      ip: ip,
      cidr: cidrNum,
      subnetMask: mask.join('.'),
      wildcardMask: wildcard.join('.'),
      network: network.join('.'),
      broadcast: broadcast.join('.'),
      firstUsable: firstUsable.join('.'),
      lastUsable: lastUsable.join('.'),
      totalHosts,
      usableHosts,
      ipClass,
      isPrivate,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
      borderRadius: '12px',
      padding: '20px',
      width: '500px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      zIndex: 3000,
      color: 'white',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          🧮 Subnetting Calculator
        </h2>
        <button
          onClick={onClose}
          style={{
            background: '#dc2626',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
          }}
        >
          ✕ Zavřít
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#cbd5e1',
        }}>
          IP Adresa
        </label>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="192.168.1.0"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '12px',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#cbd5e1',
        }}>
          CIDR / Prefix Length
        </label>
        <input
          type="number"
          value={cidr}
          onChange={(e) => setCidr(e.target.value)}
          min="0"
          max="32"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '12px',
          }}
        />
      </div>

      <button
        onClick={calculateSubnet}
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '20px',
        }}
      >
        🔍 Vypočítat
      </button>

      {result && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          padding: '15px',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '15px',
            color: '#34d399',
          }}>
            📊 Výsledky
          </h3>

          <div style={{ display: 'grid', gap: '10px' }}>
            <ResultRow label="IP Adresa" value={`${result.ip}/${result.cidr}`} />
            <ResultRow label="Subnet Maska" value={result.subnetMask} />
            <ResultRow label="Wildcard Maska" value={result.wildcardMask} />
            <ResultRow label="Síťová Adresa" value={result.network} highlight />
            <ResultRow label="Broadcast Adresa" value={result.broadcast} highlight />
            <ResultRow label="První použitelná" value={result.firstUsable} />
            <ResultRow label="Poslední použitelná" value={result.lastUsable} />
            <ResultRow label="Počet hostů" value={result.usableHosts.toLocaleString()} />
            <ResultRow label="IP třída" value={result.ipClass} />
            <ResultRow 
              label="Typ" 
              value={result.isPrivate ? '🔒 Privátní' : '🌐 Veřejná'} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 10px',
      background: highlight ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderRadius: '4px',
      fontSize: '11px',
    }}>
      <span style={{ color: '#94a3b8', fontWeight: '500' }}>{label}:</span>
      <span style={{
        color: highlight ? '#60a5fa' : 'white',
        fontWeight: '600',
        fontFamily: 'Consolas, Monaco, monospace',
      }}>
        {value}
      </span>
    </div>
  );
}
