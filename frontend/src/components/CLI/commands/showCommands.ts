import type { Command } from '../types';

export const showRunningConfigCommand: Command = {
  name: 'show running-config',
  aliases: ['sh run'],
  description: 'Show running configuration',
  mode: 'privileged',
  execute: (_args, context) => {
    const output: string[] = ['Building configuration...', '', 'Current configuration:', '!'];
    const device = context.device.data;
    
    if (device.hostname) output.push(`hostname ${device.hostname}`);
    
    device.interfaces.forEach(iface => {
      output.push(`!`, `interface ${iface.name}`);
      if (iface.ipAddress) output.push(` ip address ${iface.ipAddress} ${iface.subnetMask || '255.255.255.0'}`);
      if (iface.description) output.push(` description ${iface.description}`);
      
      // Switch-specific config
      if (device.type === 'switch') {
        if (iface.trunkMode) {
          output.push(` switchport mode trunk`);
          if (iface.allowedVlans && iface.allowedVlans.length > 0) {
            output.push(` switchport trunk allowed vlan ${iface.allowedVlans.join(',')}`);
          }
          if (iface.nativeVlan && iface.nativeVlan !== 1) {
            output.push(` switchport trunk native vlan ${iface.nativeVlan}`);
          }
        } else {
          output.push(` switchport mode access`);
          if (iface.vlanId && iface.vlanId !== 1) {
            output.push(` switchport access vlan ${iface.vlanId}`);
          }
        }
      }
      
      if (iface.enabled !== false) output.push(` no shutdown`);
      
      // Sub-interfaces
      if (iface.subInterfaces && iface.subInterfaces.length > 0) {
        iface.subInterfaces.forEach(subIface => {
          output.push(`!`, `interface ${subIface.name}`);
          output.push(` encapsulation dot1Q ${subIface.vlanId}`);
          if (subIface.ipAddress) {
            output.push(` ip address ${subIface.ipAddress} ${subIface.subnetMask || '255.255.255.0'}`);
          }
          if (subIface.description) {
            output.push(` description ${subIface.description}`);
          }
        });
      }
    });
    
    // VLANs for switches
    if (device.type === 'switch' && device.vlans && device.vlans.length > 0) {
      device.vlans.forEach(vlan => {
        if (vlan.id !== 1) {
          output.push(`!`, `vlan ${vlan.id}`, ` name ${vlan.name}`);
        }
      });
    }
    
    output.push('!', 'end', '');
    return { output };
  }
};

export const showIpInterfaceBriefCommand: Command = {
  name: 'show ip interface brief',
  aliases: ['sh ip int br'],
  description: 'Show interface status',
  mode: 'privileged',
  execute: (_args, context) => {
    const output: string[] = ['Interface              IP-Address      OK? Method Status                Protocol'];
    
    context.device.data.interfaces.forEach(iface => {
      const ip = iface.ipAddress || 'unassigned';
      const status = iface.enabled !== false ? 'up' : 'administratively down';
      const protocol = iface.enabled !== false ? 'up' : 'down';
      output.push(`${iface.name.padEnd(22)} ${ip.padEnd(15)} YES manual ${status.padEnd(21)} ${protocol}`);
      
      // Show sub-interfaces
      if (iface.subInterfaces && iface.subInterfaces.length > 0) {
        iface.subInterfaces.forEach(subIface => {
          const subIp = subIface.ipAddress || 'unassigned';
          output.push(`${subIface.name.padEnd(22)} ${subIp.padEnd(15)} YES manual ${status.padEnd(21)} ${protocol}`);
        });
      }
    });
    
    output.push('');
    return { output };
  }
};

export const showIpRouteCommand: Command = {
  name: 'show ip route',
  aliases: ['sh ip route'],
  description: 'Show routing table',
  mode: 'privileged',
  execute: (_args, context) => {
    const output: string[] = ['Codes: C - connected, S - static, R - RIP, O - OSPF', ''];
    
    if (context.device.data.routingTable && context.device.data.routingTable.length > 0) {
      context.device.data.routingTable.forEach(route => {
        const code = route.protocol === 'static' ? 'S' : 'C';
        output.push(`${code}    ${route.network}/${route.mask} via ${route.nextHop}`);
      });
    } else {
      output.push('% No routing entries');
    }
    
    output.push('');
    return { output };
  }
};

export const showVlanBriefCommand: Command = {
  name: 'show vlan brief',
  aliases: ['sh vlan br'],
  description: 'Show VLAN configuration',
  mode: 'privileged',
  execute: (_args, context) => {
    if (context.device.data.type !== 'switch') {
      return { output: ['% Invalid command for this device type'] };
    }
    
    const output: string[] = [
      'VLAN Name                             Status    Ports',
      '---- -------------------------------- --------- -------------------------------'
    ];
    
    if (context.device.data.vlans && context.device.data.vlans.length > 0) {
      context.device.data.vlans.forEach(vlan => {
        output.push(`${vlan.id.toString().padEnd(4)} ${vlan.name.padEnd(32)} active    ${vlan.ports.join(', ')}`);
      });
    } else {
      output.push('1    default                          active    All ports');
    }
    
    output.push('');
    return { output };
  }
};

export const showInterfacesTrunkCommand: Command = {
  name: 'show interfaces trunk',
  aliases: ['sh int trunk'],
  description: 'Show trunk port information',
  mode: 'privileged',
  execute: (_args, context) => {
    if (context.device.data.type !== 'switch') {
      return { output: ['% Invalid command for this device type'] };
    }
    
    const output: string[] = ['Port        Mode         Encapsulation  Status        Native vlan'];
    
    context.device.data.interfaces.filter(iface => iface.trunkMode).forEach(iface => {
      const mode = 'trunk';
      const encap = '802.1q';
      const status = 'trunking';
      const native = iface.nativeVlan || 1;
      output.push(`${iface.name.padEnd(11)} ${mode.padEnd(12)} ${encap.padEnd(14)} ${status.padEnd(13)} ${native}`);
    });
    
    output.push('');
    output.push('Port        Vlans allowed on trunk');
    
    context.device.data.interfaces.filter(iface => iface.trunkMode).forEach(iface => {
      const vlans = iface.allowedVlans?.join(',') || '1';
      output.push(`${iface.name.padEnd(11)} ${vlans}`);
    });
    
    output.push('');
    return { output };
  }
};

export const showCommands: Command[] = [
  showRunningConfigCommand,
  showIpInterfaceBriefCommand,
  showIpRouteCommand,
  showVlanBriefCommand,
  showInterfacesTrunkCommand
];
