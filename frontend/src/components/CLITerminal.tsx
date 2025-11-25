import { useState, useRef, useEffect } from 'react';
import { useNetworkStore, type DeviceNode } from '../store/networkStore';

interface CLITerminalProps {
  device: DeviceNode;
  onClose: () => void;
}

export default function CLITerminal({ device, onClose }: CLITerminalProps) {
  const { updateNode, nodes, edges } = useNetworkStore();
  
  // Windows-style prompt for PCs
  const isWindowsDevice = device.data.type === 'pc' || device.data.type === 'server';
  const initialPrompt = isWindowsDevice 
    ? 'C:\\Users\\Administrator>' 
    : `${device.data.label}>`;
    
  const [history, setHistory] = useState<string[]>([
    `Connecting to ${device.data.label}...`,
    '',
    initialPrompt,
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'user' | 'privileged' | 'config' | 'interface'>('user');
  const [currentInterface, setCurrentInterface] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const getPrompt = () => {
    // Windows-style prompt for PCs and servers
    if (device.data.type === 'pc' || device.data.type === 'server') {
      return `C:\\Users\\Administrator>`;
    }
    
    // Cisco-style prompt for routers and switches
    const hostname = device.data.hostname || device.data.label;
    switch (mode) {
      case 'user': return `${hostname}>`;
      case 'privileged': return `${hostname}#`;
      case 'config': return `${hostname}(config)#`;
      case 'interface': return `${hostname}(config-if)#`;
      default: return '>';
    }
  };

  const generateMAC = (seed: string): string => {
    // Generate a consistent MAC address from a seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash;
    }
    const mac = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
    return mac.match(/.{2}/g)?.join('-').toUpperCase() || '00-00-00-00-00-00';
  };

  const isValidIPAddress = (ip: string): boolean => {
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipRegex);
    if (!match) return false;
    
    return match.slice(1).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  };

  const findDeviceByIP = (targetIP: string): DeviceNode | null => {
    for (const node of nodes) {
      if (node.type === 'device') {
        const deviceNode = node as DeviceNode;
        for (const iface of deviceNode.data.interfaces) {
          if (iface.ipAddress === targetIP) {
            return deviceNode;
          }
        }
      }
    }
    return null;
  };

  const findDeviceByHostname = (hostname: string): DeviceNode | null => {
    const lowerHostname = hostname.toLowerCase();
    
    // Check all routers/servers with DNS records
    for (const node of nodes) {
      if (node.type === 'device') {
        const deviceNode = node as DeviceNode;
        if (deviceNode.data.dnsRecords) {
          for (const record of deviceNode.data.dnsRecords) {
            if (record.hostname.toLowerCase() === lowerHostname) {
              // Found DNS record, now find device with that IP
              return findDeviceByIP(record.ipAddress);
            }
          }
        }
      }
    }
    
    // Check device labels and hostnames
    for (const node of nodes) {
      if (node.type === 'device') {
        const deviceNode = node as DeviceNode;
        if (deviceNode.data.label.toLowerCase() === lowerHostname || 
            deviceNode.data.hostname?.toLowerCase() === lowerHostname) {
          return deviceNode;
        }
      }
    }
    
    return null;
  };

  const isInSameSubnet = (ip1: string, ip2: string, mask: string): boolean => {
    const parseIP = (ip: string) => ip.split('.').map(Number);
    const parseMask = (mask: string) => mask.split('.').map(Number);
    
    const ip1Parts = parseIP(ip1);
    const ip2Parts = parseIP(ip2);
    const maskParts = parseMask(mask);
    
    for (let i = 0; i < 4; i++) {
      if ((ip1Parts[i] & maskParts[i]) !== (ip2Parts[i] & maskParts[i])) {
        return false;
      }
    }
    return true;
  };

  const canReachTarget = (targetIP: string): { reachable: boolean; reason?: string; hops?: string[] } => {
    const sourceIface = device.data.interfaces[0];
    if (!sourceIface?.ipAddress) {
      return { reachable: false, reason: 'No IP address configured' };
    }

    const targetDevice = findDeviceByIP(targetIP);
    if (!targetDevice) {
      return { reachable: false, reason: 'Destination host unreachable' };
    }

    const sourceMask = sourceIface.subnetMask || '255.255.255.0';
    
    // Check if in same subnet
    if (isInSameSubnet(sourceIface.ipAddress, targetIP, sourceMask)) {
      return { 
        reachable: true, 
        hops: [sourceIface.ipAddress, targetIP] 
      };
    }

    // Check if we have a gateway
    if (!sourceIface.gateway) {
      return { reachable: false, reason: 'No gateway configured for remote network' };
    }

    // Simulate routing through gateway
    const gatewayDevice = findDeviceByIP(sourceIface.gateway);
    if (!gatewayDevice) {
      return { reachable: false, reason: 'Gateway unreachable' };
    }

    return { 
      reachable: true, 
      hops: [sourceIface.ipAddress, sourceIface.gateway, targetIP] 
    };
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const parts = cmd.trim().split(/\s+/);
    const newHistory = [...history, `${getPrompt()} ${cmd}`];

    // PC/Server mode - Windows-like commands
    if (device.data.type === 'pc' || device.data.type === 'server') {
      if (trimmed === 'help' || trimmed === '?') {
        newHistory.push('Available commands:',
          '  ipconfig [/all]          - Display IP configuration',
          '  ping <host>              - Test connectivity to a host',
          '  tracert <host>           - Trace route to a host',
          '  arp -a                   - Display ARP cache',
          '  netstat [-r|-a]          - Display network connections and routing table',
          '  nslookup <hostname>      - Query DNS for hostname',
          '  hostname                 - Display computer name',
          '  systeminfo               - Display system information',
          '  route print              - Display routing table',
          '  getmac                   - Display MAC address',
          '  whoami                   - Display current user',
          '  cls                      - Clear screen',
          '  exit                     - Close terminal',
          '');
      } else if (trimmed === 'cls' || trimmed === 'clear') {
        setHistory([getPrompt()]);
        return;
      } else if (trimmed === 'exit') {
        onClose();
        return;
      } else if (trimmed === 'hostname') {
        newHistory.push(device.data.hostname || device.data.label, '');
      } else if (trimmed === 'whoami') {
        newHistory.push(`${device.data.label}\\Administrator`, '');
      } else if (trimmed === 'ipconfig' || trimmed === 'ipconfig /all') {
        const showAll = trimmed === 'ipconfig /all';
        newHistory.push('');
        newHistory.push('Windows IP Configuration', '');
        
        device.data.interfaces.forEach(iface => {
          newHistory.push(`Ethernet adapter ${iface.name}:`);
          newHistory.push('');
          if (showAll) {
            newHistory.push(`   Description . . . . . . . . . . . : ${iface.description || 'Network Adapter'}`);
            newHistory.push(`   Physical Address. . . . . . . . . : ${generateMAC(device.id + iface.name)}`);
          }
          if (iface.ipAddress) {
            newHistory.push(`   IPv4 Address. . . . . . . . . . . : ${iface.ipAddress}`);
            newHistory.push(`   Subnet Mask . . . . . . . . . . . : ${iface.subnetMask || '255.255.255.0'}`);
            if (iface.gateway) {
              newHistory.push(`   Default Gateway . . . . . . . . . : ${iface.gateway}`);
            }
          } else {
            newHistory.push('   Media State . . . . . . . . . . . : Media disconnected');
          }
          if (showAll && iface.ipv6Address) {
            newHistory.push(`   IPv6 Address. . . . . . . . . . . : ${iface.ipv6Address}`);
          }
          newHistory.push('');
        });
      } else if (parts[0].toLowerCase() === 'ping') {
        if (parts.length < 2) {
          newHistory.push('Usage: ping <hostname|IP address>', '');
        } else {
          let target = parts[1];
          let targetIP = target;

          // Check if it's a valid IP address
          if (!isValidIPAddress(target)) {
            // Try to resolve hostname
            const resolvedDevice = findDeviceByHostname(target);
            if (resolvedDevice && resolvedDevice.data.interfaces[0]?.ipAddress) {
              targetIP = resolvedDevice.data.interfaces[0].ipAddress;
              newHistory.push('', `Pinging ${target} [${targetIP}] with 32 bytes of data:`);
            } else {
              newHistory.push('', `Ping request could not find host ${target}. Please check the name and try again.`, '');
              setHistory([...newHistory, getPrompt()]);
              return;
            }
          } else {
            targetIP = target;
            newHistory.push('', `Pinging ${target} with 32 bytes of data:`);
          }

          // Check if target is reachable
          const reachability = canReachTarget(targetIP);
          
          if (reachability.reachable) {
            // Simulate successful ping responses
            const latencies = [12, 14, 13, 11];
            latencies.forEach(latency => {
              newHistory.push(`Reply from ${targetIP}: bytes=32 time=${latency}ms TTL=64`);
            });
            newHistory.push('');
            newHistory.push('Ping statistics for ' + targetIP + ':');
            newHistory.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),');
            newHistory.push('Approximate round trip times in milli-seconds:');
            newHistory.push('    Minimum = 11ms, Maximum = 14ms, Average = 12ms');
            newHistory.push('');
          } else {
            // Simulate failed ping
            for (let i = 0; i < 4; i++) {
              if (reachability.reason === 'Destination host unreachable') {
                newHistory.push(`Reply from ${device.data.interfaces[0]?.ipAddress || '0.0.0.0'}: Destination host unreachable.`);
              } else {
                newHistory.push('Request timed out.');
              }
            }
            newHistory.push('');
            newHistory.push('Ping statistics for ' + targetIP + ':');
            newHistory.push('    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),');
            newHistory.push('');
          }
        }
      } else if (parts[0].toLowerCase() === 'tracert') {
        if (parts.length < 2) {
          newHistory.push('Usage: tracert <hostname|IP address>', '');
        } else {
          let target = parts[1];
          let targetIP = target;

          // Check if it's a valid IP address
          if (!isValidIPAddress(target)) {
            // Try to resolve hostname
            const resolvedDevice = findDeviceByHostname(target);
            if (resolvedDevice && resolvedDevice.data.interfaces[0]?.ipAddress) {
              targetIP = resolvedDevice.data.interfaces[0].ipAddress;
              newHistory.push('', `Tracing route to ${target} [${targetIP}]`);
            } else {
              newHistory.push('', `Unable to resolve target system name ${target}.`, '');
              setHistory([...newHistory, getPrompt()]);
              return;
            }
          } else {
            targetIP = target;
            newHistory.push('', `Tracing route to ${target}`);
          }

          newHistory.push('over a maximum of 30 hops:', '');
          
          // Check if target is reachable
          const reachability = canReachTarget(targetIP);
          
          if (reachability.reachable && reachability.hops) {
            // Show actual path
            reachability.hops.forEach((hop, index) => {
              const latency = index === 0 ? '<1' : (index * 3 + 1).toString();
              newHistory.push(`  ${index + 1}    ${latency} ms    ${latency} ms    ${latency} ms  ${hop}`);
            });
            newHistory.push('');
            newHistory.push('Trace complete.', '');
          } else {
            // Show failure
            const sourceIP = device.data.interfaces[0]?.ipAddress || '0.0.0.0';
            newHistory.push(`  1    <1 ms    <1 ms    <1 ms  ${sourceIP}`);
            newHistory.push('  2     *        *        *     Request timed out.');
            newHistory.push('  3     *        *        *     Request timed out.');
            newHistory.push('');
            newHistory.push(`Trace complete - ${reachability.reason || 'Destination unreachable'}.`, '');
          }
        }
      } else if (trimmed === 'arp -a' || trimmed === 'arp') {
        const sourceIface = device.data.interfaces[0];
        newHistory.push('', 'Interface: ' + (sourceIface?.ipAddress || '0.0.0.0') + ' --- 0x1');
        newHistory.push('  Internet Address      Physical Address      Type');
        
        // Show gateway ARP entry
        const gateway = sourceIface?.gateway;
        if (gateway) {
          newHistory.push(`  ${gateway.padEnd(22)}${generateMAC('gateway')}  dynamic`);
        }
        
        // Show ARP entries for devices in same subnet
        if (sourceIface?.ipAddress && sourceIface?.subnetMask) {
          for (const node of nodes) {
            if (node.type === 'device' && node.id !== device.id) {
              const deviceNode = node as DeviceNode;
              for (const iface of deviceNode.data.interfaces) {
                if (iface.ipAddress && isInSameSubnet(sourceIface.ipAddress, iface.ipAddress, sourceIface.subnetMask)) {
                  newHistory.push(`  ${iface.ipAddress.padEnd(22)}${generateMAC(deviceNode.id + iface.name)}  dynamic`);
                }
              }
            }
          }
        }
        
        // Broadcast address
        if (sourceIface?.ipAddress) {
          const network = sourceIface.ipAddress.split('.').slice(0, 3).join('.');
          newHistory.push(`  ${network}.255${' '.repeat(9)}ff-ff-ff-ff-ff-ff  static`);
        }
        newHistory.push('');
      } else if (trimmed === 'netstat -r' || trimmed === 'route print') {
        newHistory.push('', '===========================================================================');
        newHistory.push('Interface List');
        device.data.interfaces.forEach((iface, idx) => {
          newHistory.push(`  ${idx + 1}...${generateMAC(device.id + iface.name)} ......${iface.name}`);
        });
        newHistory.push('===========================================================================', '');
        newHistory.push('IPv4 Route Table');
        newHistory.push('===========================================================================');
        newHistory.push('Active Routes:');
        newHistory.push('Network Destination        Netmask          Gateway       Interface  Metric');
        
        const iface = device.data.interfaces[0];
        if (iface?.ipAddress) {
          newHistory.push(`          0.0.0.0          0.0.0.0    ${(iface.gateway || '0.0.0.0').padEnd(14)}${iface.ipAddress.padEnd(11)}25`);
          newHistory.push(`       ${iface.ipAddress}  255.255.255.255         On-link     ${iface.ipAddress.padEnd(11)}281`);
          const network = iface.ipAddress.split('.').slice(0, 3).join('.') + '.0';
          newHistory.push(`        ${network}  ${(iface.subnetMask || '255.255.255.0').padEnd(16)}On-link     ${iface.ipAddress.padEnd(11)}281`);
        }
        newHistory.push('===========================================================================', '');
      } else if (trimmed === 'netstat -a' || trimmed === 'netstat') {
        newHistory.push('', 'Active Connections', '');
        newHistory.push('  Proto  Local Address          Foreign Address        State');
        newHistory.push('  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING');
        newHistory.push('  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING');
        newHistory.push('  TCP    127.0.0.1:3000         0.0.0.0:0              LISTENING');
        const localIP = device.data.interfaces[0]?.ipAddress || '0.0.0.0';
        newHistory.push(`  TCP    ${localIP}:52431    192.168.1.1:443        ESTABLISHED`);
        newHistory.push('  UDP    0.0.0.0:53             *:*');
        newHistory.push('  UDP    0.0.0.0:67             *:*');
        newHistory.push('');
      } else if (parts[0].toLowerCase() === 'nslookup') {
        if (parts.length < 2) {
          newHistory.push('Usage: nslookup <hostname>', '');
        } else {
          const hostname = parts[1];
          const sourceIface = device.data.interfaces[0];
          const dnsServer = sourceIface?.gateway || '8.8.8.8';
          
          newHistory.push('', `Server:  ${dnsServer}`);
          newHistory.push(`Address:  ${dnsServer}`, '');
          
          // Try to find hostname in DNS records
          let found = false;
          if (hostname.includes('.local') || !hostname.includes('.')) {
            // Search for local hostname in DNS servers
            for (const node of nodes) {
              if (node.type === 'device') {
                const deviceNode = node as DeviceNode;
                if (deviceNode.data.dnsRecords) {
                  for (const record of deviceNode.data.dnsRecords) {
                    if (record.hostname.toLowerCase() === hostname.toLowerCase()) {
                      newHistory.push(`Name:    ${record.hostname}`);
                      newHistory.push(`Address:  ${record.ipAddress}`);
                      found = true;
                      break;
                    }
                  }
                }
              }
              if (found) break;
            }
            
            if (!found) {
              newHistory.push(`*** ${dnsServer} can't find ${hostname}: Non-existent domain`);
            }
          } else {
            // External domain - simulate resolution
            newHistory.push(`Name:    ${hostname}`);
            newHistory.push(`Addresses:  93.184.216.34`);
            newHistory.push('            2606:2800:220:1:248:1893:25c8:1946');
          }
          newHistory.push('');
        }
      } else if (trimmed === 'getmac' || trimmed === 'getmac /v') {
        newHistory.push('', 'Physical Address    Transport Name');
        newHistory.push('==================  ==========================================================');
        device.data.interfaces.forEach(iface => {
          const mac = generateMAC(device.id + iface.name);
          newHistory.push(`${mac}  \\Device\\Tcpip_{${Math.random().toString(36).substr(2, 9).toUpperCase()}}`);
        });
        newHistory.push('');
      } else if (trimmed === 'systeminfo') {
        newHistory.push('', 'Host Name:                 ' + (device.data.hostname || device.data.label));
        newHistory.push('OS Name:                   Microsoft Windows 10 Pro');
        newHistory.push('OS Version:                10.0.19044 N/A Build 19044');
        newHistory.push('System Type:               x64-based PC');
        newHistory.push('Network Card(s):           ' + device.data.interfaces.length + ' NIC(s) Installed.');
        device.data.interfaces.forEach((iface, idx) => {
          newHistory.push(`                           [0${idx + 1}]: ${iface.name}`);
          if (iface.ipAddress) {
            newHistory.push(`                                 IP Address: ${iface.ipAddress}`);
          }
        });
        newHistory.push('');
      } else if (trimmed) {
        newHistory.push(`'${parts[0]}' is not recognized as an internal or external command,`);
        newHistory.push('operable program or batch file.', '');
      }
      
      setHistory([...newHistory, getPrompt()]);
      return;
    }

    // User mode commands (for routers/switches)
    if (mode === 'user') {
      if (trimmed === 'enable' || trimmed === 'en') {
        setMode('privileged');
        newHistory.push('');
      } else if (trimmed.startsWith('show')) {
        newHistory.push('% Type "enable" to enter privileged mode');
      } else if (trimmed === 'exit') {
        onClose();
        return;
      } else if (trimmed === '?' || trimmed === 'help') {
        newHistory.push('User mode commands:', '  enable - Enter privileged mode', '  exit   - Exit CLI', '');
      } else if (trimmed) {
        newHistory.push(`% Invalid command: ${cmd}`);
      }
    }

    // Privileged mode commands
    else if (mode === 'privileged') {
      if (trimmed === 'configure terminal' || trimmed === 'conf t') {
        setMode('config');
        newHistory.push('Enter configuration commands, one per line. End with CNTL/Z.');
      } else if (trimmed === 'show running-config' || trimmed === 'sh run') {
        newHistory.push('Building configuration...', '', 'Current configuration:', '!');
        if (device.data.hostname) newHistory.push(`hostname ${device.data.hostname}`);
        device.data.interfaces.forEach(iface => {
          newHistory.push(`!`, `interface ${iface.name}`);
          if (iface.ipAddress) newHistory.push(` ip address ${iface.ipAddress} ${iface.subnetMask || '255.255.255.0'}`);
          if (iface.description) newHistory.push(` description ${iface.description}`);
          if (iface.enabled !== false) newHistory.push(` no shutdown`);
        });
        newHistory.push('!', 'end', '');
      } else if (trimmed === 'show ip interface brief' || trimmed === 'sh ip int br') {
        newHistory.push('Interface              IP-Address      OK? Method Status                Protocol');
        device.data.interfaces.forEach(iface => {
          const ip = iface.ipAddress || 'unassigned';
          const status = iface.enabled !== false ? 'up' : 'administratively down';
          const protocol = iface.enabled !== false ? 'up' : 'down';
          newHistory.push(`${iface.name.padEnd(22)} ${ip.padEnd(15)} YES manual ${status.padEnd(21)} ${protocol}`);
        });
        newHistory.push('');
      } else if (trimmed === 'show ip route' || trimmed === 'sh ip route') {
        newHistory.push('Codes: C - connected, S - static, R - RIP, O - OSPF', '');
        if (device.data.routingTable && device.data.routingTable.length > 0) {
          device.data.routingTable.forEach(route => {
            const code = route.protocol === 'static' ? 'S' : 'C';
            newHistory.push(`${code}    ${route.network}/${route.mask} via ${route.nextHop}`);
          });
        } else {
          newHistory.push('% No routing entries');
        }
        newHistory.push('');
      } else if (trimmed === 'show vlan brief' || trimmed === 'sh vlan br') {
        if (device.data.type === 'switch') {
          newHistory.push('VLAN Name                             Status    Ports');
          newHistory.push('---- -------------------------------- --------- -------------------------------');
          if (device.data.vlans && device.data.vlans.length > 0) {
            device.data.vlans.forEach(vlan => {
              newHistory.push(`${vlan.id.toString().padEnd(4)} ${vlan.name.padEnd(32)} active    ${vlan.ports.join(', ')}`);
            });
          } else {
            newHistory.push('1    default                          active    All ports');
          }
          newHistory.push('');
        } else {
          newHistory.push('% Invalid command for this device type');
        }
      } else if (trimmed === 'disable' || trimmed === 'exit') {
        setMode('user');
        newHistory.push('');
      } else if (trimmed === '?' || trimmed === 'help') {
        newHistory.push('Privileged mode commands:',
          '  configure terminal       - Enter configuration mode',
          '  show running-config      - Show running configuration',
          '  show ip interface brief  - Show interface status',
          '  show ip route            - Show routing table',
          '  show vlan brief          - Show VLAN configuration (switches)',
          '  disable                  - Return to user mode',
          '');
      } else if (trimmed) {
        newHistory.push(`% Invalid command: ${cmd}`);
      }
    }

    // Configuration mode commands
    else if (mode === 'config') {
      const parts = cmd.trim().split(/\s+/);
      const command = parts[0].toLowerCase();

      if (trimmed === 'exit' || trimmed === 'end') {
        setMode('privileged');
        newHistory.push('');
      } else if (command === 'hostname') {
        if (parts.length > 1) {
          updateNode(device.id, { hostname: parts[1] });
          newHistory.push('');
        } else {
          newHistory.push('% Incomplete command');
        }
      } else if (command === 'interface' || command === 'int') {
        if (parts.length > 1) {
          const ifaceName = parts.slice(1).join(' ');
          const iface = device.data.interfaces.find(i => 
            i.name.toLowerCase() === ifaceName.toLowerCase() ||
            i.name.toLowerCase().includes(ifaceName.toLowerCase())
          );
          if (iface) {
            setCurrentInterface(iface.name);
            setMode('interface');
            newHistory.push('');
          } else {
            newHistory.push(`% Invalid interface: ${ifaceName}`);
          }
        } else {
          newHistory.push('% Incomplete command');
        }
      } else if (command === 'ip' && parts[1] === 'route') {
        // ip route network mask next-hop
        if (parts.length >= 5) {
          const routingTable = device.data.routingTable || [];
          routingTable.push({
            network: parts[2],
            mask: parts[3],
            nextHop: parts[4],
            protocol: 'static',
          });
          updateNode(device.id, { routingTable });
          newHistory.push('');
        } else {
          newHistory.push('% Incomplete command');
        }
      } else if (command === 'vlan' && device.data.type === 'switch') {
        if (parts.length > 1) {
          const vlanId = parseInt(parts[1]);
          if (!isNaN(vlanId) && vlanId > 0 && vlanId < 4095) {
            const vlans = device.data.vlans || [];
            if (!vlans.find(v => v.id === vlanId)) {
              vlans.push({ id: vlanId, name: `VLAN${vlanId}`, ports: [] });
              updateNode(device.id, { vlans });
            }
            newHistory.push('');
          } else {
            newHistory.push('% Invalid VLAN ID');
          }
        }
      } else if (trimmed === '?' || trimmed === 'help') {
        newHistory.push('Configuration mode commands:',
          '  hostname NAME            - Set device hostname',
          '  interface TYPE NUM       - Enter interface configuration',
          '  ip route NET MASK NH     - Add static route (routers)',
          '  vlan ID                  - Create VLAN (switches)',
          '  exit                     - Exit configuration mode',
          '');
      } else if (trimmed) {
        newHistory.push(`% Invalid command: ${cmd}`);
      }
    }

    // Interface configuration mode
    else if (mode === 'interface' && currentInterface) {
      const parts = cmd.trim().split(/\s+/);
      const command = parts[0].toLowerCase();

      if (trimmed === 'exit') {
        setMode('config');
        setCurrentInterface(null);
        newHistory.push('');
      } else if (command === 'ip' && parts[1] === 'address') {
        if (parts.length >= 4) {
          const interfaces = device.data.interfaces.map(iface =>
            iface.name === currentInterface
              ? { ...iface, ipAddress: parts[2], subnetMask: parts[3] }
              : iface
          );
          updateNode(device.id, { interfaces });
          newHistory.push('');
        } else {
          newHistory.push('% Incomplete command');
        }
      } else if (command === 'no' && parts[1] === 'shutdown') {
        const interfaces = device.data.interfaces.map(iface =>
          iface.name === currentInterface ? { ...iface, enabled: true } : iface
        );
        updateNode(device.id, { interfaces });
        newHistory.push('');
      } else if (command === 'shutdown') {
        const interfaces = device.data.interfaces.map(iface =>
          iface.name === currentInterface ? { ...iface, enabled: false } : iface
        );
        updateNode(device.id, { interfaces });
        newHistory.push('');
      } else if (command === 'description') {
        if (parts.length > 1) {
          const description = parts.slice(1).join(' ');
          const interfaces = device.data.interfaces.map(iface =>
            iface.name === currentInterface ? { ...iface, description } : iface
          );
          updateNode(device.id, { interfaces });
          newHistory.push('');
        }
      } else if (command === 'switchport' && device.data.type === 'switch') {
        if (parts[1] === 'mode' && parts[2] === 'access') {
          newHistory.push('');
        } else if (parts[1] === 'access' && parts[2] === 'vlan') {
          const vlanId = parseInt(parts[3]);
          if (!isNaN(vlanId)) {
            // Assign port to VLAN
            const vlans = device.data.vlans || [];
            const updatedVlans = vlans.map(vlan => {
              if (vlan.id === vlanId && currentInterface && !vlan.ports.includes(currentInterface)) {
                return { ...vlan, ports: [...vlan.ports, currentInterface] };
              }
              return { ...vlan, ports: vlan.ports.filter(p => p !== currentInterface) };
            });
            updateNode(device.id, { vlans: updatedVlans });
            newHistory.push('');
          }
        }
      } else if (trimmed === '?' || trimmed === 'help') {
        newHistory.push('Interface configuration commands:',
          '  ip address IP MASK       - Set IP address',
          '  no shutdown              - Enable interface',
          '  shutdown                 - Disable interface',
          '  description TEXT         - Set interface description',
          '  switchport mode access   - Set as access port (switches)',
          '  switchport access vlan N - Assign to VLAN (switches)',
          '  exit                     - Return to config mode',
          '');
      } else if (trimmed) {
        newHistory.push(`% Invalid command: ${cmd}`);
      }
    }

    setHistory([...newHistory, getPrompt()]);
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
            fontSize: '11px',
            fontWeight: '600',
          }}
        >
          ✕
        </button>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '15px',
          overflowY: 'auto',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          color: '#00ff00',
        }}
      >
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Input line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 15px',
        borderTop: '1px solid #333',
        background: '#0a0a0a',
      }}>
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
            color: '#00ff00',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            outline: 'none',
          }}
          placeholder="Type command... (? for help)"
        />
      </div>
    </div>
  );
}
