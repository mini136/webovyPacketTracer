export const isValidIPAddress = (ip: string): boolean => {
  const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipRegex);
  if (!match) return false;
  
  return match.slice(1).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
};

export const generateMAC = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const mac = Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
  return mac.match(/.{2}/g)?.join('-').toUpperCase() || '00-00-00-00-00-00';
};

export const getPrompt = (
  deviceLabel: string,
  deviceHostname: string | undefined,
  deviceType: string,
  mode: 'user' | 'privileged' | 'config' | 'interface'
): string => {
  // Windows-style prompt for PCs and servers
  if (deviceType === 'pc' || deviceType === 'server') {
    return `C:\\Users\\Administrator>`;
  }
  
  // Cisco-style prompt for routers and switches
  const hostname = deviceHostname || deviceLabel;
  switch (mode) {
    case 'user': return `${hostname}>`;
    case 'privileged': return `${hostname}#`;
    case 'config': return `${hostname}(config)#`;
    case 'interface': return `${hostname}(config-if)#`;
    default: return '>';
  }
};
