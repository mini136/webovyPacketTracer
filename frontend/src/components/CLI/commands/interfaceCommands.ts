import type { Command } from '../types';

export const ipAddressCommand: Command = {
  name: 'ip address',
  aliases: [],
  description: 'Set IP address',
  mode: 'interface',
  execute: (args, context) => {
    if (args.length < 2) {
      return { output: ['% Incomplete command'] };
    }
    
    const [ipAddress, subnetMask] = args;
    
    // Check if this is a sub-interface
    if (context.currentInterface?.includes('.')) {
      const [parentName] = context.currentInterface.split('.');
      const interfaces = context.device.data.interfaces.map(iface => {
        if (iface.name === parentName) {
          const subInterfaces = iface.subInterfaces || [];
          const subIdx = subInterfaces.findIndex(si => si.name === context.currentInterface);
          
          if (subIdx >= 0) {
            subInterfaces[subIdx] = {
              ...subInterfaces[subIdx],
              ipAddress,
              subnetMask,
            };
          } else {
            // Create new sub-interface
            subInterfaces.push({
              name: context.currentInterface!,
              vlanId: parseInt(context.currentInterface!.split('.')[1]) || 1,
              ipAddress,
              subnetMask,
            });
          }
          
          return { ...iface, subInterfaces, trunkMode: true };
        }
        return iface;
      });
      context.updateNode(context.device.id, { interfaces });
      return { output: [''] };
    }
    
    // Regular interface
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface
        ? { ...iface, ipAddress, subnetMask }
        : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const noShutdownCommand: Command = {
  name: 'no shutdown',
  aliases: [],
  description: 'Enable interface',
  mode: 'interface',
  execute: (_args, context) => {
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface ? { ...iface, enabled: true } : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const shutdownCommand: Command = {
  name: 'shutdown',
  aliases: [],
  description: 'Disable interface',
  mode: 'interface',
  execute: (_args, context) => {
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface ? { ...iface, enabled: false } : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const descriptionCommand: Command = {
  name: 'description',
  aliases: [],
  description: 'Set interface description',
  mode: 'interface',
  execute: (args, context) => {
    if (args.length === 0) {
      return { output: ['% Incomplete command'] };
    }
    
    const description = args.join(' ');
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface ? { ...iface, description } : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const encapsulationCommand: Command = {
  name: 'encapsulation',
  aliases: [],
  description: 'Set encapsulation type',
  mode: 'interface',
  execute: (args, context) => {
    if (context.device.data.type !== 'router') {
      return { output: ['% Invalid command for this device type'] };
    }
    
    if (args.length < 2 || (args[0].toLowerCase() !== 'dot1q' && args[0].toLowerCase() !== 'dot1Q')) {
      return { output: ['% Invalid encapsulation type. Use: encapsulation dot1Q <vlan-id>'] };
    }
    
    const vlanId = parseInt(args[1]);
    if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
      return { output: ['% Invalid VLAN ID'] };
    }
    
    const [parentName] = context.currentInterface!.split('.');
    const interfaces = context.device.data.interfaces.map(iface => {
      if (iface.name === parentName) {
        const subInterfaces = iface.subInterfaces || [];
        const existingSubIdx = subInterfaces.findIndex(si => si.name === context.currentInterface);
        
        if (existingSubIdx >= 0) {
          subInterfaces[existingSubIdx] = {
            ...subInterfaces[existingSubIdx],
            vlanId,
          };
        } else {
          subInterfaces.push({
            name: context.currentInterface!,
            vlanId,
          });
        }
        
        return { ...iface, subInterfaces, trunkMode: true };
      }
      return iface;
    });
    
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const switchportCommand: Command = {
  name: 'switchport',
  aliases: [],
  description: 'Set switchport configuration',
  mode: 'interface',
  execute: (args, context) => {
    if (context.device.data.type !== 'switch') {
      return { output: ['% Invalid command for this device type'] };
    }
    
    if (args.length === 0) {
      return { output: ['% Incomplete command'] };
    }
    
    // switchport mode access
    if (args[0] === 'mode' && args[1] === 'access') {
      const interfaces = context.device.data.interfaces.map(iface =>
        iface.name === context.currentInterface 
          ? { ...iface, trunkMode: false, allowedVlans: undefined, nativeVlan: undefined } 
          : iface
      );
      context.updateNode(context.device.id, { interfaces });
      return { output: [''] };
    }
    
    // switchport mode trunk
    if (args[0] === 'mode' && args[1] === 'trunk') {
      const interfaces = context.device.data.interfaces.map(iface =>
        iface.name === context.currentInterface 
          ? { ...iface, trunkMode: true, allowedVlans: [1], nativeVlan: 1 } 
          : iface
      );
      context.updateNode(context.device.id, { interfaces });
      return { output: [''] };
    }
    
    // switchport trunk allowed vlan 10,20,30
    if (args[0] === 'trunk' && args[1] === 'allowed' && args[2] === 'vlan') {
      if (args.length >= 4) {
        const vlanList = args[3].split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
        const interfaces = context.device.data.interfaces.map(iface =>
          iface.name === context.currentInterface && iface.trunkMode
            ? { ...iface, allowedVlans: vlanList }
            : iface
        );
        context.updateNode(context.device.id, { interfaces });
        return { output: [''] };
      }
      return { output: ['% Usage: switchport trunk allowed vlan <vlan-list>'] };
    }
    
    // switchport trunk native vlan 10
    if (args[0] === 'trunk' && args[1] === 'native' && args[2] === 'vlan') {
      const vlanId = parseInt(args[3]);
      if (!isNaN(vlanId)) {
        const interfaces = context.device.data.interfaces.map(iface =>
          iface.name === context.currentInterface && iface.trunkMode
            ? { ...iface, nativeVlan: vlanId }
            : iface
        );
        context.updateNode(context.device.id, { interfaces });
        return { output: [''] };
      }
      return { output: ['% Invalid VLAN ID'] };
    }
    
    // switchport access vlan 10
    if (args[0] === 'access' && args[1] === 'vlan') {
      const vlanId = parseInt(args[2]);
      if (!isNaN(vlanId)) {
        const vlans = context.device.data.vlans || [];
        const updatedVlans = vlans.map(vlan => {
          if (vlan.id === vlanId && context.currentInterface && !vlan.ports.includes(context.currentInterface)) {
            return { ...vlan, ports: [...vlan.ports, context.currentInterface] };
          }
          return { ...vlan, ports: vlan.ports.filter(p => p !== context.currentInterface) };
        });
        
        const interfaces = context.device.data.interfaces.map(iface =>
          iface.name === context.currentInterface 
            ? { ...iface, vlanId } 
            : iface
        );
        
        context.updateNode(context.device.id, { vlans: updatedVlans, interfaces });
        return { output: [''] };
      }
      return { output: ['% Invalid VLAN ID'] };
    }
    
    return { output: ['% Invalid switchport command'] };
  }
};

export const exitInterfaceCommand: Command = {
  name: 'exit',
  aliases: [],
  description: 'Return to config mode',
  mode: 'interface',
  execute: () => {
    return {
      output: [''],
      newMode: 'config' as const,
      newInterface: null
    };
  }
};

export const helpInterfaceCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Show available commands',
  mode: 'interface',
  execute: (_args, context) => {
    const baseCommands = [
      '  ip address IP MASK       - Set IPv4 address',
      '  ipv6 address ADDR/PREFIX - Set IPv6 address',
      '  ipv6 enable              - Enable IPv6 on interface',
      '  no ipv6 address          - Remove IPv6 address',
      '  no shutdown              - Enable interface',
      '  shutdown                 - Disable interface',
      '  description TEXT         - Set interface description',
    ];
    
    const switchCommands = context.device.data.type === 'switch' ? [
      '  switchport mode access   - Set as access port',
      '  switchport mode trunk    - Set as trunk port (802.1Q)',
      '  switchport access vlan N - Assign to VLAN (access mode)',
      '  switchport trunk allowed vlan <list> - Set allowed VLANs (trunk)',
      '  switchport trunk native vlan N - Set native VLAN (trunk)',
    ] : [];
    
    const routerCommands = context.device.data.type === 'router' && context.currentInterface?.includes('.') ? [
      '  encapsulation dot1Q N    - Set VLAN encapsulation (sub-interface)',
    ] : [];
    
    return {
      output: [
        'Interface configuration commands:',
        ...baseCommands,
        ...switchCommands,
        ...routerCommands,
        '  exit                     - Return to config mode',
        ''
      ]
    };
  }
};

export const ipv6AddressCommand: Command = {
  name: 'ipv6 address',
  aliases: [],
  description: 'Set IPv6 address',
  mode: 'interface',
  execute: (args, context) => {
    if (args.length < 1) {
      return { output: ['% Incomplete command'] };
    }
    
    // Parse IPv6 address/prefix (e.g., "2001:db8::1/64")
    const addressWithPrefix = args[0];
    const [ipv6Address, prefixStr] = addressWithPrefix.split('/');
    const ipv6PrefixLength = prefixStr ? parseInt(prefixStr) : 64;
    
    // Check if this is a sub-interface
    if (context.currentInterface?.includes('.')) {
      const [parentName] = context.currentInterface.split('.');
      const interfaces = context.device.data.interfaces.map(iface => {
        if (iface.name === parentName) {
          const subInterfaces = iface.subInterfaces || [];
          const subIdx = subInterfaces.findIndex(si => si.name === context.currentInterface);
          
          if (subIdx >= 0) {
            subInterfaces[subIdx] = {
              ...subInterfaces[subIdx],
              ipv6Address,
              ipv6PrefixLength,
              ipv6Enabled: true,
            };
          } else {
            // Create new sub-interface with IPv6
            subInterfaces.push({
              name: context.currentInterface!,
              vlanId: parseInt(context.currentInterface!.split('.')[1]) || 1,
              ipv6Address,
              ipv6PrefixLength,
              ipv6Enabled: true,
            });
          }
          
          return { ...iface, subInterfaces };
        }
        return iface;
      });
      context.updateNode(context.device.id, { interfaces });
      return { output: [''] };
    }
    
    // Regular interface
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface
        ? { ...iface, ipv6Address, ipv6PrefixLength, ipv6Enabled: true }
        : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const ipv6EnableCommand: Command = {
  name: 'ipv6 enable',
  aliases: [],
  description: 'Enable IPv6 on interface',
  mode: 'interface',
  execute: (_args, context) => {
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface ? { ...iface, ipv6Enabled: true } : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const noIpv6AddressCommand: Command = {
  name: 'no ipv6 address',
  aliases: [],
  description: 'Remove IPv6 address',
  mode: 'interface',
  execute: (_args, context) => {
    const interfaces = context.device.data.interfaces.map(iface =>
      iface.name === context.currentInterface
        ? { ...iface, ipv6Address: undefined, ipv6PrefixLength: undefined, ipv6Enabled: false }
        : iface
    );
    context.updateNode(context.device.id, { interfaces });
    return { output: [''] };
  }
};

export const interfaceCommands: Command[] = [
  ipAddressCommand,
  ipv6AddressCommand,
  ipv6EnableCommand,
  noIpv6AddressCommand,
  noShutdownCommand,
  shutdownCommand,
  descriptionCommand,
  encapsulationCommand,
  switchportCommand,
  exitInterfaceCommand,
  helpInterfaceCommand
];
