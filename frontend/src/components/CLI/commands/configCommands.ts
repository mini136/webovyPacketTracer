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
        '  ip route NET MASK NH     - Add static IPv4 route (routers)',
        '  ipv6 unicast-routing     - Enable IPv6 routing globally',
        '  ipv6 route NET/PREFIX NH - Add static IPv6 route (routers)',
        '  no ipv6 route NET/PREFIX - Remove IPv6 static route',
        '  vlan ID                  - Create VLAN (switches)',
        '  exit                     - Exit configuration mode',
        ''
      ]
    };
  }
};

export const ipv6UnicastRoutingCommand: Command = {
  name: 'ipv6 unicast-routing',
  aliases: [],
  description: 'Enable IPv6 routing',
  mode: 'config',
  execute: (_args, context) => {
    context.updateNode(context.device.id, { ipv6Enabled: true });
    return { output: [''] };
  }
};

export const ipv6RouteCommand: Command = {
  name: 'ipv6 route',
  aliases: [],
  description: 'Add static IPv6 route',
  mode: 'config',
  execute: (args, context) => {
    if (args.length >= 2) {
      // Format: ipv6 route 2001:db8::/64 2001:db8::1
      // or: ipv6 route 2001:db8::/64 GigabitEthernet0/0
      const [networkWithPrefix, nextHop] = args;
      const [network, prefixLengthStr] = networkWithPrefix.split('/');
      const prefixLength = parseInt(prefixLengthStr) || 64;
      
      const ipv6RoutingTable = context.device.data.ipv6RoutingTable || [];
      ipv6RoutingTable.push({
        network,
        prefixLength,
        nextHop,
        protocol: 'static' as const,
      });
      context.updateNode(context.device.id, { ipv6RoutingTable });
      return { output: [''] };
    }
    return { output: ['% Incomplete command. Usage: ipv6 route <network/prefix> <next-hop>'] };
  }
};

export const noIpv6RouteCommand: Command = {
  name: 'no ipv6 route',
  aliases: [],
  description: 'Remove static IPv6 route',
  mode: 'config',
  execute: (args, context) => {
    if (args.length >= 1) {
      const [networkWithPrefix] = args;
      const [network] = networkWithPrefix.split('/');
      
      const ipv6RoutingTable = (context.device.data.ipv6RoutingTable || []).filter(
        route => route.network !== network
      );
      context.updateNode(context.device.id, { ipv6RoutingTable });
      return { output: [''] };
    }
    return { output: ['% Incomplete command'] };
  }
};

export const configCommands: Command[] = [
  hostnameCommand,
  interfaceCommand,
  ipRouteCommand,
  ipv6UnicastRoutingCommand,
  ipv6RouteCommand,
  noIpv6RouteCommand,
  vlanCommand,
  exitConfigCommand,
  helpConfigCommand
];
