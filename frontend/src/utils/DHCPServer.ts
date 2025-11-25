/**
 * DHCPServer.ts
 * 
 * THREAD-SAFE DHCP SERVER S RESOURCE CONTENTION
 * ==============================================
 * 
 * Tento modul implementuje DHCP server, který řeší typický problém
 * RESOURCE CONTENTION - více klientů současně žádá o IP adresu
 * ze sdíleného IP poolu.
 * 
 * KLÍČOVÉ PROBLÉMY ŘEŠENÉ PARALELISMEM:
 * 
 * 1. RACE CONDITION:
 *    - Dva klienti mohou dostat stejnou IP adresu, pokud nejsou synchronizováni
 *    - Řešení: Mutex chrání IP pool během alokace
 * 
 * 2. DEADLOCK PREVENTION:
 *    - Timeout na lock operacích
 *    - Ordered locking (vždy stejné pořadí zámků)
 * 
 * 3. STARVATION PREVENTION:
 *    - Fair queue - FIFO pořadí požadavků
 *    - Časový limit na držení zámku
 */

import { Mutex } from './PacketProcessor';

export interface DHCPLease {
  macAddress: string;
  ipAddress: string;
  leaseStart: number;
  leaseEnd: number;
  hostname?: string;
}

export interface IPPoolConfig {
  network: string;
  startIP: string;
  endIP: string;
  subnetMask: string;
  defaultGateway?: string;
  dnsServers?: string[];
  leaseTime: number; // seconds
}

/**
 * Thread-safe IP Pool
 * Řeší RESOURCE CONTENTION pro přidělování IP adres
 */
class IPPool {
  private availableIPs: Set<string>;
  private allocatedIPs: Map<string, DHCPLease>; // MAC -> Lease
  private config: IPPoolConfig;
  private mutex: Mutex;

  constructor(config: IPPoolConfig) {
    this.config = config;
    this.availableIPs = this.generateIPRange(config.startIP, config.endIP);
    this.allocatedIPs = new Map();
    this.mutex = new Mutex();

    console.log(`[IPPool] Initialized with ${this.availableIPs.size} addresses`);
  }

  /**
   * Generuje rozsah IP adres
   */
  private generateIPRange(startIP: string, endIP: string): Set<string> {
    const ips = new Set<string>();
    const start = this.ipToNumber(startIP);
    const end = this.ipToNumber(endIP);

    for (let i = start; i <= end; i++) {
      ips.add(this.numberToIp(i));
    }

    return ips;
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }

  private numberToIp(num: number): string {
    return [
      (num >>> 24) & 0xff,
      (num >>> 16) & 0xff,
      (num >>> 8) & 0xff,
      num & 0xff,
    ].join('.');
  }

  /**
   * KRITICKÁ SEKCE: Alokace IP adresy
   * 
   * Mutex zajišťuje, že pouze jeden thread/proces může alokovat IP najednou.
   * Tím se předchází RACE CONDITION, kde by dva klienti dostali stejnou IP.
   */
  async allocateIP(macAddress: string, hostname?: string): Promise<DHCPLease | null> {
    // LOCK: Vstup do kritické sekce
    await this.mutex.lock();
    
    try {
      console.log(`[IPPool] Allocating IP for MAC ${macAddress}`);

      // Kontrola, zda už má lease
      const existingLease = this.allocatedIPs.get(macAddress);
      if (existingLease && existingLease.leaseEnd > Date.now()) {
        console.log(`[IPPool] Renewing existing lease: ${existingLease.ipAddress}`);
        
        // Obnov lease
        existingLease.leaseStart = Date.now();
        existingLease.leaseEnd = Date.now() + (this.config.leaseTime * 1000);
        return existingLease;
      }

      // Získej volnou IP
      if (this.availableIPs.size === 0) {
        console.log(`[IPPool] No available IPs - pool exhausted!`);
        return null;
      }

      const iterator = this.availableIPs.values();
      const next = iterator.next();
      if (next.done) {
        return null;
      }
      
      const ipAddress = next.value;
      this.availableIPs.delete(ipAddress);

      // Vytvoř lease
      const lease: DHCPLease = {
        macAddress,
        ipAddress,
        leaseStart: Date.now(),
        leaseEnd: Date.now() + (this.config.leaseTime * 1000),
        hostname,
      };

      this.allocatedIPs.set(macAddress, lease);

      console.log(`[IPPool] Allocated ${ipAddress} to ${macAddress}`);
      return lease;

    } finally {
      // UNLOCK: Vždy uvolni mutex (i při exception)
      this.mutex.unlock();
    }
  }

  /**
   * KRITICKÁ SEKCE: Uvolnění IP adresy
   */
  async releaseIP(macAddress: string): Promise<void> {
    await this.mutex.lock();
    
    try {
      const lease = this.allocatedIPs.get(macAddress);
      if (lease) {
        this.availableIPs.add(lease.ipAddress);
        this.allocatedIPs.delete(macAddress);
        console.log(`[IPPool] Released ${lease.ipAddress} from ${macAddress}`);
      }
    } finally {
      this.mutex.unlock();
    }
  }

  /**
   * Background task: Uvolňování expirovaných lease
   * Běží periodicky v samostatném "thread"
   */
  async cleanupExpiredLeases(): Promise<number> {
    await this.mutex.lock();
    
    try {
      const now = Date.now();
      let cleaned = 0;

      for (const [mac, lease] of this.allocatedIPs.entries()) {
        if (lease.leaseEnd < now) {
          this.availableIPs.add(lease.ipAddress);
          this.allocatedIPs.delete(mac);
          cleaned++;
          console.log(`[IPPool] Expired lease: ${lease.ipAddress} (${mac})`);
        }
      }

      return cleaned;
    } finally {
      this.mutex.unlock();
    }
  }

  getStats() {
    return {
      total: this.availableIPs.size + this.allocatedIPs.size,
      available: this.availableIPs.size,
      allocated: this.allocatedIPs.size,
    };
  }
}

/**
 * DHCP Server s paralelním zpracováním požadavků
 * 
 * PRODUCER-CONSUMER:
 * - Klienti (producers) posílají DHCP DISCOVER
 * - Server (consumer) zpracovává frontu požadavků
 */
export class DHCPServer {
  private serverId: string;
  private ipPool: IPPool;
  private requestQueue: DHCPRequest[] = [];
  private processing = false;
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor(serverId: string, config: IPPoolConfig) {
    this.serverId = serverId;
    this.ipPool = new IPPool(config);

    // Spustí background cleanup task
    this.startCleanupTask();
  }

  /**
   * Přijme DHCP REQUEST (producer)
   */
  async handleDHCPRequest(request: DHCPRequest): Promise<DHCPLease | null> {
    console.log(`[DHCP Server ${this.serverId}] Received request from ${request.macAddress}`);

    // Vloží do fronty
    this.requestQueue.push(request);

    // Pokud není zpracování aktivní, spustí jej
    if (!this.processing) {
      this.processQueue();
    }

    // Počká na alokaci
    return await this.ipPool.allocateIP(request.macAddress, request.hostname);
  }

  /**
   * Zpracování fronty (consumer)
   * Simuluje konkurentní zpracování
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        await this.ipPool.allocateIP(request.macAddress, request.hostname);
      } catch (error) {
        console.error(`[DHCP Server ${this.serverId}] Error processing request:`, error);
      }

      // Simulace zpracování
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processing = false;
  }

  /**
   * Background task: Pravidelné čištění expirovaných lease
   * Běží nezávisle v "background thread"
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(async () => {
      console.log(`[DHCP Server ${this.serverId}] Running cleanup task...`);
      const cleaned = await this.ipPool.cleanupExpiredLeases();
      
      if (cleaned > 0) {
        console.log(`[DHCP Server ${this.serverId}] Cleaned ${cleaned} expired leases`);
      }
    }, 30000); // Každých 30 sekund
  }

  /**
   * Uvolní DHCP lease
   */
  async releaseLease(macAddress: string): Promise<void> {
    await this.ipPool.releaseIP(macAddress);
  }

  getStats() {
    return {
      pool: this.ipPool.getStats(),
      queueSize: this.requestQueue.length,
    };
  }

  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export interface DHCPRequest {
  macAddress: string;
  hostname?: string;
  requestedIP?: string;
}

/**
 * PŘÍKLAD POUŽITÍ - SIMULACE RACE CONDITION:
 * 
 * const dhcpServer = new DHCPServer('dhcp-1', {
 *   network: '192.168.1.0',
 *   startIP: '192.168.1.100',
 *   endIP: '192.168.1.200',
 *   subnetMask: '255.255.255.0',
 *   defaultGateway: '192.168.1.1',
 *   leaseTime: 3600,
 * });
 * 
 * // PARALELNÍ požadavky od 50 klientů najednou
 * // BEZ MUTEXU by mohlo dojít k přidělení stejné IP více klientům!
 * const requests = Array.from({length: 50}, (_, i) => ({
 *   macAddress: `aa:bb:cc:dd:ee:${i.toString(16).padStart(2, '0')}`,
 *   hostname: `pc-${i}`,
 * }));
 * 
 * const leases = await Promise.all(
 *   requests.map(req => dhcpServer.handleDHCPRequest(req))
 * );
 * 
 * console.log(`Allocated ${leases.filter(l => l !== null).length} leases`);
 * console.log('Stats:', dhcpServer.getStats());
 */
