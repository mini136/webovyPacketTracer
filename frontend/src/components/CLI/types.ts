import { type DeviceNode } from '../../store/networkStore';

export type CLIMode = 'user' | 'privileged' | 'config' | 'interface';

export interface CLIContext {
  device: DeviceNode;
  mode: CLIMode;
  currentInterface: string | null;
  history: string[];
  updateNode: (id: string, data: Partial<DeviceNode['data']>) => void;
  allNodes: DeviceNode[];
  setMode: (mode: CLIMode) => void;
  setCurrentInterface: (iface: string | null) => void;
  onClose: () => void;
}

export interface CommandResult {
  output: string[];
  newMode?: CLIMode;
  newInterface?: string | null;
  shouldClose?: boolean;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  mode: CLIMode | CLIMode[];
  execute: (args: string[], context: CLIContext) => CommandResult;
}

export interface CommandCategory {
  name: string;
  commands: Command[];
}
