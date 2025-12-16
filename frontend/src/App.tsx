import { useState } from 'react';
import Sidebar from './components/Sidebar';
import NetworkCanvas from './components/NetworkCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import TopBar from './components/TopBar';
import NetworkTools from './components/NetworkTools';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { useAuthStore } from './store/authStore';

function App() {
  const [isNetworkToolsOpen, setIsNetworkToolsOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  if (showAdminPanel && user?.role === 'admin') {
    return <AdminPanel />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden',
    }}>
      <TopBar onOpenAdmin={() => setShowAdminPanel(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar onOpenNetworkTools={() => setIsNetworkToolsOpen(true)} />
        <div style={{ 
          flex: 1, 
          height: '100%',
          position: 'relative',
        }}>
          <NetworkCanvas />
          <NetworkTools isOpen={isNetworkToolsOpen} onClose={() => setIsNetworkToolsOpen(false)} />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
