import type { Command } from '../types';
import type { DeviceNode } from '../../../store/networkStore';
import { isValidIPAddress, generateMAC } from '../utils';

const findDeviceByIP = (targetIP: string, allNodes: DeviceNode[]): DeviceNode | null => {
  for (const node of allNodes) {
    for (const iface of node.data.interfaces) {
      if (iface.ipAddress === targetIP) {
        return node;
      }
    }
  }
  return null;
};

const findDeviceByHostname = (hostname: string, allNodes: DeviceNode[]): DeviceNode | null => {
  const lowerHostname = hostname.toLowerCase();
  
  for (const node of allNodes) {
    if (node.data.dnsRecords) {
      for (const record of node.data.dnsRecords) {
        if (record.hostname.toLowerCase() === lowerHostname) {
          return findDeviceByIP(record.ipAddress, allNodes);
        }
      }
    }
  }
  return null;
};

export const ipconfigCommand: Command = {
  name: 'ipconfig',
  aliases: [],
  description: 'Display IP configuration',
  mode: ['user', 'privileged', 'config', 'interface'],
  execute: (_args, context) => {
    const output: string[] = ['', 'Windows IP Configuration', ''];
    
    context.device.data.interfaces.forEach(iface => {
      output.push(`Ethernet adapter ${iface.name}:`, '');
      output.push(`   Physical Address. . . . . . . . . : ${generateMAC(context.device.id + iface.name)}`);
      
      if (iface.ipAddress) {
        output.push(`   IPv4 Address. . . . . . . . . . . : ${iface.ipAddress}`);
        output.push(`   Subnet Mask . . . . . . . . . . . : ${iface.subnetMask || '255.255.255.0'}`);
        if (iface.gateway) {
          output.push(`   Default Gateway . . . . . . . . . : ${iface.gateway}`);
        }
      } else {
        output.push(`   Autoconfiguration IPv4 Address. . : 169.254.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`);
        output.push(`   Subnet Mask . . . . . . . . . . . : 255.255.0.0`);
      }
      
      output.push('');
    });
    
    return { output };
  }
};

export const pingCommand: Command = {
  name: 'ping',
  aliases: [],
  description: 'Test network connectivity',
  mode: ['user', 'privileged', 'config', 'interface'],
  execute: (args, context) => {
    if (args.length < 1) {
      return { output: ['Usage: ping <hostname|IP address>', ''] };
    }
    
    const target = args[0];
    let targetIP = target;

    if (!isValidIPAddress(target)) {
      const resolvedDevice = findDeviceByHostname(target, context.allNodes);
      if (resolvedDevice && resolvedDevice.data.interfaces[0]?.ipAddress) {
        targetIP = resolvedDevice.data.interfaces[0].ipAddress;
      } else {
        return {
          output: [
            '',
            `Ping request could not find host ${target}. Please check the name and try again.`,
            ''
          ]
        };
      }
    }

    const output: string[] = ['', `Pinging ${target} [${targetIP}] with 32 bytes of data:`];
    
    const device = findDeviceByIP(targetIP, context.allNodes);
    const reachable = device !== null;
    
    for (let i = 0; i < 4; i++) {
      if (reachable) {
        const time = Math.floor(Math.random() * 10) + 1;
        output.push(`Reply from ${targetIP}: bytes=32 time=${time}ms TTL=64`);
      } else {
        output.push(`Request timed out.`);
      }
    }
    
    output.push('');
    
    if (reachable) {
      output.push(`Ping statistics for ${targetIP}:`);
      output.push(`    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`);
      output.push(`Approximate round trip times in milli-seconds:`);
      output.push(`    Minimum = 1ms, Maximum = 10ms, Average = 5ms`);
    }
    
    output.push('');
    return { output };
  }
};

export const tracertCommand: Command = {
  name: 'tracert',
  aliases: [],
  description: 'Trace route to destination',
  mode: ['user', 'privileged', 'config', 'interface'],
  execute: (args, context) => {
    if (args.length < 1) {
      return { output: ['Usage: tracert <hostname|IP address>', ''] };
    }
    
    const target = args[0];
    let targetIP = target;

    if (!isValidIPAddress(target)) {
      const resolvedDevice = findDeviceByHostname(target, context.allNodes);
      if (resolvedDevice && resolvedDevice.data.interfaces[0]?.ipAddress) {
        targetIP = resolvedDevice.data.interfaces[0].ipAddress;
      } else {
        return {
          output: [
            '',
            `Unable to resolve target system name ${target}.`,
            ''
          ]
        };
      }
    }

    const output: string[] = ['', `Tracing route to ${target} [${targetIP}]`, 'over a maximum of 30 hops:', ''];
    
    const hops = Math.floor(Math.random() * 3) + 2;
    for (let i = 1; i <= hops; i++) {
      const time1 = Math.floor(Math.random() * 10) + 1;
      const time2 = Math.floor(Math.random() * 10) + 1;
      const time3 = Math.floor(Math.random() * 10) + 1;
      const hopIP = i === hops ? targetIP : `192.168.${i}.1`;
      output.push(`  ${i}    ${time1} ms    ${time2} ms    ${time3} ms  ${hopIP}`);
    }
    
    output.push('', 'Trace complete.', '');
    return { output };
  }
};

export const systeminfoCommand: Command = {
  name: 'systeminfo',
  aliases: [],
  description: 'Display system information',
  mode: ['user', 'privileged', 'config', 'interface'],
  execute: (_args, context) => {
    const output: string[] = [
      '',
      'Host Name:                 ' + context.device.data.label,
      'OS Name:                   Microsoft Windows 10 Pro',
      'OS Version:                10.0.19041 N/A Build 19041',
      'System Manufacturer:       Cisco',
      'System Model:              Virtual Machine',
      'System Type:               x64-based PC',
      'Network Card(s):           ' + context.device.data.interfaces.length + ' NIC(s) Installed.',
    ];
    
    context.device.data.interfaces.forEach((iface, idx) => {
      output.push(`                           [0${idx + 1}]: ${iface.name}`);
      if (iface.ipAddress) {
        output.push(`                                 IP Address: ${iface.ipAddress}`);
      }
    });
    
    output.push('');
    return { output };
  }
};

export const windowsCommands: Command[] = [
  ipconfigCommand,
  pingCommand,
  tracertCommand,
  systeminfoCommand
];
