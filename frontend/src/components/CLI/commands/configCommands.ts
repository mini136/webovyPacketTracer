import type { Command } from '../types';

export const hostnameCommand: Command = {
  name: 'hostname',
  aliases: [],
  description: 'Set device hostname',
  mode: 'config',
  execute: (args, context) => {
    if (args.length > 0) {
      context.updateNode(context.device.id, { hostname: args[0] });
      return { output: [''] };
    }
    return { output: ['% Incomplete command'] };
  }
};

export const interfaceCommand: Command = {
  name: 'interface',
  aliases: ['int'],
  description: 'Enter interface configuration',
  mode: 'config',
  execute: (args, context) => {
    if (args.length === 0) {
      return { output: ['% Incomplete command'] };
    }
    
    const ifaceName = args.join(' ');
    
    // Check for sub-interface (e.g., "Gig0/0.10")
    if (ifaceName.includes('.')) {
      const [parentName] = ifaceName.split('.');
      const parentIface = context.device.data.interfaces.find(i => 
        i.name.toLowerCase() === parentName.toLowerCase()
      );
      
      if (parentIface) {
        return {
          output: [''],
          newMode: 'interface' as const,
          newInterface: ifaceName
        };
      }
      return { output: [`% Invalid parent interface: ${parentName}`] };
    }
    
    // Regular interface
    const iface = context.device.data.interfaces.find(i => 
      i.name.toLowerCase() === ifaceName.toLowerCase() ||
      i.name.toLowerCase().includes(ifaceName.toLowerCase())
    );
    
    if (iface) {
      return {
        output: [''],
        newMode: 'interface' as const,
        newInterface: iface.name
      };
    }
    return { output: [`% Invalid interface: ${ifaceName}`] };
  }
};

export const ipRouteCommand: Command = {
  name: 'ip route',
  aliases: [],
  description: 'Add static route',
  mode: 'config',
  execute: (args, context) => {
    if (args.length >= 3) {
      const routingTable = context.device.data.routingTable || [];
      routingTable.push({
        network: args[0],
        mask: args[1],
        nextHop: args[2],
        protocol: 'static' as const,
      });
      context.updateNode(context.device.id, { routingTable });
      return { output: [''] };
    }
    return { output: ['% Incomplete command'] };
  }
};

export const vlanCommand: Command = {
  name: 'vlan',
  aliases: [],
  description: 'Create VLAN',
  mode: 'config',
  execute: (args, context) => {
    if (context.device.data.type !== 'switch') {
      return { output: ['% Invalid command for this device type'] };
    }
    
    if (args.length > 0) {
      const vlanId = parseInt(args[0]);
      if (!isNaN(vlanId) && vlanId > 0 && vlanId < 4095) {
        const vlans = context.device.data.vlans || [];
        if (!vlans.find(v => v.id === vlanId)) {
          vlans.push({ id: vlanId, name: `VLAN${vlanId}`, ports: [] });
          context.updateNode(context.device.id, { vlans });
        }
        return { output: [''] };
      }
      return { output: ['% Invalid VLAN ID'] };
    }
    return { output: ['% Incomplete command'] };
  }
};

export const exitConfigCommand: Command = {
  name: 'exit',
  aliases: [],
  description: 'Exit configuration mode',
  mode: 'config',
  execute: () => {
    return {
      output: [''],
      newMode: 'privileged' as const
    };
  }
};

export const helpConfigCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Show available commands',
  mode: 'config',
  execute: () => {
    return {
      output: [
        'Configuration mode commands:',
        '  hostname NAME            - Set device hostname',
        '  interface TYPE NUM       - Enter interface configuration',
        '  ip route NET MASK NH     - Add static route (routers)',
        '  vlan ID                  - Create VLAN (switches)',
        '  exit                     - Exit configuration mode',
        ''
      ]
    };
  }
};

export const configCommands: Command[] = [
  hostnameCommand,
  interfaceCommand,
  ipRouteCommand,
  vlanCommand,
  exitConfigCommand,
  helpConfigCommand
];
