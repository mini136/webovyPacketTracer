/**
 * PacketProcessor.ts
 * 
 * PARALELNÍ ZPRACOVÁNÍ SÍŤOVÝCH PAKETŮ
 * =====================================
 * 
 * Tento modul implementuje PRODUCER-CONSUMER pattern pro zpracování síťových paketů.
 * Každé síťové zařízení (switch, router) má vlastní frontu paketů a pool workerů,
 * kteří pakety zpracovávají paralelně.
 * 
 * KLÍČOVÉ KONCEPTY PARALELISMU:
 * 
 * 1. PRODUCER-CONSUMER PATTERN:
 *    - Producenti (přijímací porty) vkládají pakety do fronty
 *    - Konzumenti (worker threads) zpracovávají pakety z fronty
 *    - Fronta je thread-safe pomocí async queue
 * 
 * 2. RESOURCE CONTENTION (konflikt o zdroje):
 *    - Více paketů může chtít použít stejný výstupní port
 *    - Routing table může být updatován během čtení
 *    - ARP cache sdílená mezi vlákny
 * 
 * 3. SYNCHRONIZACE:
 *    - Mutex/Lock pro kritické sekce (routing table update)
 *    - Atomic operations pro čítače
 *    - Event-driven coordination mezi zařízeními
 */

export interface Packet {
  id: string;
  sourceIP: string;
  destIP: string;
  sourceMAC: string;
  destMAC: string;
  type: 'icmp' | 'tcp' | 'udp' | 'arp' | 'dhcp' | 'dns';
  payload: Record<string, unknown>;
  ttl: number;
  vlanId?: number;
  timestamp: number;
  // Pro traceroute
  hops?: string[];
}

/**
 * Thread-safe fronta paketů
 * Implementuje async queue s podporou paralelního přístupu
 */
class PacketQueue {
  private queue: Packet[] = [];
  private waiting: Array<(packet: Packet) => void> = [];
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  /**
   * PRODUCER: Vloží packet do fronty
   * Pokud je někdo čeká (dequeue), ihned mu jej předá
   */
  async enqueue(packet: Packet): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxSize) {
        reject(new Error('Queue overflow - packet dropped'));
        return;
      }

      // Pokud někdo čeká, předáme mu packet přímo (optimalizace)
      if (this.waiting.length > 0) {
        const resolver = this.waiting.shift()!;
        resolver(packet);
      } else {
        this.queue.push(packet);
      }
      
      resolve();
    });
  }

  /**
   * CONSUMER: Vyjme packet z fronty
   * Pokud není žádný packet, čeká (blocking)
   */
  async dequeue(): Promise<Packet> {
    return new Promise((resolve) => {
      if (this.queue.length > 0) {
        resolve(this.queue.shift()!);
      } else {
        // Žádný packet - čekáme
        this.waiting.push(resolve);
      }
    });
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}

/**
 * Mutex pro synchronizaci přístupu ke sdíleným zdrojům
 */
export class Mutex {
  private locked = false;
  private waiting: Array<() => void> = [];

  /**
   * Získá zámek (lock)
   * Pokud je již zamčeno, čeká ve frontě
   */
  async lock(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        // Zařadí se do fronty čekajících
        this.waiting.push(resolve);
      }
    });
  }

  /**
   * Uvolní zámek (unlock)
   * Probudí dalšího čekajícího
   */
  unlock(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!;
      next();
    } else {
      this.locked = false;
    }
  }

  /**
   * Try-lock pattern
   */
  tryLock(): boolean {
    if (!this.locked) {
      this.locked = true;
      return true;
    }
    return false;
  }
}

/**
 * Worker pro zpracování paketů
 * Každý worker běží nezávisle a konkurentně
 */
class PacketWorker {
  private id: number;
  private running = false;
  private queue: PacketQueue;
  private processCallback: (packet: Packet) => Promise<void>;

  constructor(
    id: number,
    queue: PacketQueue,
    processCallback: (packet: Packet) => Promise<void>
  ) {
    this.id = id;
    this.queue = queue;
    this.processCallback = processCallback;
  }

  /**
   * Spustí worker loop
   * Worker neustále čeká na pakety a zpracovává je
   */
  async start(): Promise<void> {
    this.running = true;
    console.log(`[Worker ${this.id}] Started`);

    while (this.running) {
      try {
        // BLOCKING: Čeká na packet z fronty
        const packet = await this.queue.dequeue();
        
        console.log(`[Worker ${this.id}] Processing packet ${packet.id}`);
        
        // Zpracuje packet (může trvat různě dlouho)
        await this.processCallback(packet);
        
        console.log(`[Worker ${this.id}] Finished packet ${packet.id}`);
      } catch (error) {
        console.error(`[Worker ${this.id}] Error:`, error);
      }
    }

    console.log(`[Worker ${this.id}] Stopped`);
  }

  stop(): void {
    this.running = false;
  }
}

/**
 * Pool workerů pro paralelní zpracování
 */
class WorkerPool {
  private workers: PacketWorker[] = [];
  private queue: PacketQueue;
  private workerCount: number;

  constructor(
    workerCount: number,
    queueSize: number,
    processCallback: (packet: Packet) => Promise<void>
  ) {
    this.workerCount = workerCount;
    this.queue = new PacketQueue(queueSize);

    // Vytvoří workery
    for (let i = 0; i < workerCount; i++) {
      const worker = new PacketWorker(i, this.queue, processCallback);
      this.workers.push(worker);
      
      // Spustí worker v "background" (Promise není await)
      worker.start();
    }
  }

  /**
   * Odešle packet do fronty pro zpracování
   */
  async submitPacket(packet: Packet): Promise<void> {
    await this.queue.enqueue(packet);
  }

  /**
   * Zastaví všechny workery
   */
  shutdown(): void {
    this.workers.forEach(w => w.stop());
  }

  getQueueSize(): number {
    return this.queue.size();
  }
}

/**
 * Packet Processor pro jedno zařízení (switch/router)
 * 
 * PARALELISMUS:
 * - Každé zařízení má vlastní pool workerů (typicky 4-8)
 * - Pakety jsou zpracovávány konkurentně
 * - Routing table a MAC table jsou chráněny mutexem
 */
export class PacketProcessor {
  private deviceId: string;
  private deviceType: 'switch' | 'router';
  private workerPool: WorkerPool;
  private routingTableMutex: Mutex;
  private macTableMutex: Mutex;
  
  // Sdílené zdroje (musí být chráněny)
  private routingTable: Map<string, string> = new Map();
  private macTable: Map<string, string> = new Map();
  
  // Statistiky (atomic counters)
  private packetsProcessed = 0;
  private packetsDropped = 0;

  constructor(deviceId: string, deviceType: 'switch' | 'router', workerCount: number = 4) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.routingTableMutex = new Mutex();
    this.macTableMutex = new Mutex();

    // Vytvoří pool workerů
    this.workerPool = new WorkerPool(
      workerCount,
      1000,
      this.processPacket.bind(this)
    );

    console.log(`[${deviceId}] PacketProcessor initialized with ${workerCount} workers`);
  }

  /**
   * PRODUCER METODA: Přijme packet na port
   * Vloží do fronty pro asynchronní zpracování
   */
  async receivePacket(packet: Packet): Promise<void> {
    try {
      await this.workerPool.submitPacket(packet);
      console.log(`[${this.deviceId}] Packet ${packet.id} queued (queue size: ${this.workerPool.getQueueSize()})`);
    } catch (error) {
      this.packetsDropped++;
      console.error(`[${this.deviceId}] Packet ${packet.id} dropped:`, error);
    }
  }

  /**
   * CONSUMER METODA: Zpracuje packet (volána workery)
   * 
   * KRITICKÁ SEKCE: Přístup k routing/MAC table musí být synchronizován
   */
  private async processPacket(packet: Packet): Promise<void> {
    // Simulace zpracování (různé délky podle typu)
    const processingTime = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Kontrola TTL (Time To Live)
    if (packet.ttl <= 0) {
      console.log(`[${this.deviceId}] Packet ${packet.id} dropped - TTL expired`);
      this.packetsDropped++;
      return;
    }

    packet.ttl--;

    if (this.deviceType === 'switch') {
      await this.processSwitchPacket(packet);
    } else {
      await this.processRouterPacket(packet);
    }

    this.packetsProcessed++;
  }

  /**
   * Zpracování na switchi
   * MUTEX: MAC table může být updatována současně více workery
   */
  private async processSwitchPacket(packet: Packet): Promise<void> {
    // KRITICKÁ SEKCE: Update MAC table
    await this.macTableMutex.lock();
    try {
      // Learn source MAC
      this.macTable.set(packet.sourceMAC, 'port-X');
      
      // Lookup destination MAC
      const outputPort = this.macTable.get(packet.destMAC);
      
      if (outputPort) {
        console.log(`[${this.deviceId}] Forwarding packet ${packet.id} to ${outputPort}`);
      } else {
        console.log(`[${this.deviceId}] Flooding packet ${packet.id} (unknown MAC)`);
      }
    } finally {
      this.macTableMutex.unlock();
    }
  }

  /**
   * Zpracování na routeru
   * MUTEX: Routing table může být updatována routing protokolem
   */
  private async processRouterPacket(packet: Packet): Promise<void> {
    // KRITICKÁ SEKCE: Read routing table
    await this.routingTableMutex.lock();
    try {
      const nextHop = this.routingTable.get(packet.destIP);
      
      if (nextHop) {
        console.log(`[${this.deviceId}] Routing packet ${packet.id} via ${nextHop}`);
        packet.hops = packet.hops || [];
        packet.hops.push(this.deviceId);
      } else {
        console.log(`[${this.deviceId}] No route to ${packet.destIP} - dropped`);
        this.packetsDropped++;
      }
    } finally {
      this.routingTableMutex.unlock();
    }
  }

  /**
   * Update routing table (může být voláno routing protokolem)
   * MUTEX: Synchronizace s read operacemi
   */
  async updateRoutingTable(network: string, nextHop: string): Promise<void> {
    await this.routingTableMutex.lock();
    try {
      this.routingTable.set(network, nextHop);
      console.log(`[${this.deviceId}] Routing table updated: ${network} -> ${nextHop}`);
    } finally {
      this.routingTableMutex.unlock();
    }
  }

  /**
   * Statistiky zpracování
   */
  getStats() {
    return {
      processed: this.packetsProcessed,
      dropped: this.packetsDropped,
      queueSize: this.workerPool.getQueueSize(),
    };
  }

  /**
   * Ukončení processoru
   */
  shutdown(): void {
    this.workerPool.shutdown();
  }
}

/**
 * PŘÍKLAD POUŽITÍ:
 * 
 * // Vytvoření processoru pro switch s 4 workery
 * const switchProcessor = new PacketProcessor('switch-1', 'switch', 4);
 * 
 * // Simulace příjmu 100 paketů najednou (paralelně)
 * const packets = Array.from({length: 100}, (_, i) => ({
 *   id: `pkt-${i}`,
 *   sourceIP: '192.168.1.10',
 *   destIP: '192.168.1.20',
 *   sourceMAC: 'aa:bb:cc:dd:ee:ff',
 *   destMAC: '11:22:33:44:55:66',
 *   type: 'icmp' as const,
 *   payload: {},
 *   ttl: 64,
 *   timestamp: Date.now(),
 * }));
 * 
 * // PARALELNÍ odeslání všech paketů
 * await Promise.all(packets.map(p => switchProcessor.receivePacket(p)));
 * 
 * // Workery je zpracují paralelně (4 najednou)
 */
