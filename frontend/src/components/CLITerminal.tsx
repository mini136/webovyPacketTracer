import { useState, useRef, useEffect, useMemo } from 'react';
import { useNetworkStore, type DeviceNode } from '../store/networkStore';
import { CommandRegistry } from './CLI/commands/CommandRegistry';
import { getPrompt } from './CLI/utils';
import type { CLIContext, CLIMode } from './CLI/types';

interface CLITerminalProps {
  device: DeviceNode;
  onClose: () => void;
}

export default function CLITerminal({ device, onClose }: CLITerminalProps) {
  const { updateNode, nodes } = useNetworkStore();
  
  // Windows-style prompt for PCs
  const isWindowsDevice = device.data.type === 'pc' || device.data.type === 'server';
  
  // Initialize command registry
  const commandRegistry = useMemo(() => new CommandRegistry(isWindowsDevice), [isWindowsDevice]);
  const initialPrompt = getPrompt(device.data.label, device.data.hostname, device.data.type, 'user');
    
  const [history, setHistory] = useState<string[]>([
    `Connecting to ${device.data.label}...`,
    '',
    initialPrompt,
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<CLIMode>('user');
  const [currentInterface, setCurrentInterface] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getCurrentPrompt = () => {
    return getPrompt(device.data.label, device.data.hostname, device.data.type, mode);
  };

  const executeCommand = (cmd: string) => {
    const newHistory = [...history];

    // Add command to history with prompt
    newHistory.push(getCurrentPrompt() + cmd);

    // Create context for command execution
    const context: CLIContext = {
      device,
      mode,
      currentInterface,
      history: newHistory,
      updateNode,
      allNodes: nodes.filter(n => n.type === 'device') as DeviceNode[],
      setMode,
      setCurrentInterface,
      onClose,
    };

    // Execute command using registry
    const result = commandRegistry.execute(cmd.trim(), context);

    // Add output to history
    newHistory.push(...result.output);

    // Handle mode changes
    if (result.newMode !== undefined) {
      setMode(result.newMode);
    }

    // Handle interface changes
    if (result.newInterface !== undefined) {
      setCurrentInterface(result.newInterface);
    }

    // Handle close request
    if (result.shouldClose) {
      onClose();
      return;
    }

    setHistory([...newHistory, getCurrentPrompt()]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
      setInput('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '700px',
      height: '500px',
      background: '#0a0a0a',
      border: '2px solid #333',
      borderRadius: '8px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 2000,
    }}>
      {/* Title bar */}
      <div style={{
        background: 'linear-gradient(to bottom, #2d2d2d, #1a1a1a)',
        padding: '10px 15px',
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333',
      }}>
        <span style={{ color: '#00ff00', fontWeight: '600', fontSize: '12px' }}>
          📟 CLI - {device.data.hostname || device.data.label}
        </span>
        <button
          onClick={onClose}
          style={{
            background: '#dc2626',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '10px',
            fontWeight: '600',
          }}
        >
          ✖ Close
        </button>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          fontFamily: '"Consolas", "Monaco", monospace',
          fontSize: '11px',
          lineHeight: '1.5',
          color: '#00ff00',
        }}
      >
        {history.map((line, idx) => (
          <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>{getCurrentPrompt()}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#00ff00',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: '0 5px',
            }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        padding: '6px 15px',
        background: '#1a1a1a',
        borderTop: '1px solid #333',
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        fontSize: '9px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>Mode: {mode.toUpperCase()}</span>
        {currentInterface && <span>Interface: {currentInterface}</span>}
        <span>Type ? for help</span>
      </div>
    </div>
  );
}
