import SaveLoadPanel from './SaveLoadPanel';

export default function TopBar() {
  return (
    <div
      style={{
        height: '42px',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 17px',
        boxShadow: '0 3px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
        <div style={{ fontSize: '20px' }}>🌐</div>
        <div>
          <h1 style={{ 
            fontSize: '13px', 
            fontWeight: '700', 
            color: 'white',
            margin: 0,
          }}>
            Network Simulator Pro
          </h1>
          <p style={{ 
            fontSize: '8px', 
            color: '#94a3b8',
            margin: 0,
          }}>
            Web-based Cisco Packet Tracer
          </p>
        </div>
      </div>

      <SaveLoadPanel />

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          style={{
            padding: '6px 8px',
            background: 'rgba(148, 163, 184, 0.1)',
            border: 'none',
            borderRadius: '4px',
            color: '#cbd5e1',
            fontSize: '9px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
          }}
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}
