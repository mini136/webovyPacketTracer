/**
 * Network utility functions for realistic network simulation
 */

/**
 * Generate a random MAC address
 * Format: XX:XX:XX:XX:XX:XX
 */
export function generateMACAddress(prefix?: string): string {
  if (prefix) {
    // Use Cisco OUI prefix (00:1E:14)
    const suffix = Array.from({ length: 3 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':');
    return `${prefix}:${suffix}`;
  }
  
  // Generate random MAC
  return Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join(':');
}

/**
 * Generate Cisco-style MAC address
 */
export function generateCiscoMAC(deviceType: 'router' | 'switch' | 'pc' | 'server' | 'hub'): string {
  const prefixes = {
    router: '00:1E:14', // Cisco router OUI
    switch: '00:1A:A2', // Cisco switch OUI
    pc: '00:50:56',     // VMware/Generic PC
    server: '00:0C:29', // Server OUI
    hub: '00:1B:21'     // Generic hub
  };
  
  return generateMACAddress(prefixes[deviceType]);
}

/**
 * Generate IPv6 link-local address from MAC
 * Format: fe80::xxxx:xxff:fexx:xxxx
 */
export function generateLinkLocalIPv6(macAddress: string): string {
  const mac = macAddress.replace(/:/g, '');
  const part1 = mac.substring(0, 2);
  const part2 = mac.substring(2, 4);
  const part3 = mac.substring(4, 6);
  const part4 = mac.substring(6, 8);
  const part5 = mac.substring(8, 10);
  const part6 = mac.substring(10, 12);
  
  // Modified EUI-64 format
  const eui64Part1 = (parseInt(part1, 16) ^ 0x02).toString(16).padStart(2, '0');
  
  return `fe80::${eui64Part1}${part2}:${part3}ff:fe${part4}:${part5}${part6}`;
}

/**
 * Check if IPv4 address is in same subnet
 */
export function isInSameSubnet(ip1: string, ip2: string, mask: string): boolean {
  const ip1Parts = ip1.split('.').map(Number);
  const ip2Parts = ip2.split('.').map(Number);
  const maskParts = mask.split('.').map(Number);
  
  for (let i = 0; i < 4; i++) {
    if ((ip1Parts[i] & maskParts[i]) !== (ip2Parts[i] & maskParts[i])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if IPv6 address is in same prefix
 */
export function isInSameIPv6Prefix(ip1: string, ip2: string, prefixLength: number): boolean {
  // Simplified version - expand addresses first
  const expand = (addr: string) => {
    const parts = addr.split(':');
    const expanded: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '') {
        const missing = 8 - parts.filter(p => p !== '').length;
        for (let j = 0; j <= missing; j++) {
          expanded.push('0000');
        }
      } else {
        expanded.push(parts[i].padStart(4, '0'));
      }
    }
    
    return expanded.slice(0, 8).join(':');
  };
  
  const exp1 = expand(ip1);
  const exp2 = expand(ip2);
  
  // Compare only prefix bits
  const bitsToCompare = Math.floor(prefixLength / 16);
  const parts1 = exp1.split(':');
  const parts2 = exp2.split(':');
  
  for (let i = 0; i < bitsToCompare; i++) {
    if (parts1[i] !== parts2[i]) return false;
  }
  
  return true;
}

/**
 * Calculate bandwidth delay (in ms) for a packet of given size
 */
export function calculateTransmissionDelay(
  packetSize: number, // bytes
  bandwidth: number    // Mbps
): number {
  // Convert bandwidth to bytes per second
  const bytesPerSecond = (bandwidth * 1000000) / 8;
  // Calculate delay in seconds
  const delaySeconds = packetSize / bytesPerSecond;
  // Convert to milliseconds
  return delaySeconds * 1000;
}

/**
 * Calculate total link delay (transmission + propagation + latency)
 */
export function calculateLinkDelay(
  packetSize: number,   // bytes
  bandwidth: number,    // Mbps
  latency: number = 0,  // ms (propagation delay)
  jitter: number = 0    // ms (random variation)
): number {
  const transmissionDelay = calculateTransmissionDelay(packetSize, bandwidth);
  const randomJitter = jitter > 0 ? (Math.random() - 0.5) * jitter : 0;
  
  return transmissionDelay + latency + randomJitter;
}

/**
 * Simulate packet loss (returns true if packet should be dropped)
 */
export function shouldDropPacket(packetLoss: number): boolean {
  return Math.random() * 100 < packetLoss;
}

/**
 * Generate serial number (Cisco-style)
 */
export function generateSerialNumber(deviceType: string): string {
  const prefix = deviceType.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${prefix}${random}`;
}

/**
 * Initialize ARP table with gateway entry
 */
export function initializeARPTable(
  gatewayIP?: string,
  gatewayMAC?: string,
  interfaceName: string = 'Eth0'
): any[] {
  if (!gatewayIP || !gatewayMAC) return [];
  
  return [{
    ipAddress: gatewayIP,
    macAddress: gatewayMAC,
    interface: interfaceName,
    age: 0,
    type: 'static' as const
  }];
}

/**
 * Initialize NDP table with gateway entry (IPv6)
 */
export function initializeNDPTable(
  gatewayIPv6?: string,
  gatewayMAC?: string,
  interfaceName: string = 'Eth0'
): any[] {
  if (!gatewayIPv6 || !gatewayMAC) return [];
  
  return [{
    ipv6Address: gatewayIPv6,
    macAddress: gatewayMAC,
    interface: interfaceName,
    age: 0,
    type: 'static' as const,
    state: 'REACH' as const
  }];
}

/**
 * Age ARP/NDP entries (call periodically)
 */
export function ageTableEntries<T extends { age: number; type: string }>(
  entries: T[],
  maxAge: number = 300 // 5 minutes
): T[] {
  return entries
    .map(entry => ({
      ...entry,
      age: entry.age + 1
    }))
    .filter(entry => entry.type === 'static' || entry.age < maxAge);
}

/**
 * Format uptime (seconds to human readable)
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
