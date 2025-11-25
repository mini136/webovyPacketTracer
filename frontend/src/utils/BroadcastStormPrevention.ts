/**
 * BroadcastStormPrevention.ts
 * 
 * DEADLOCK PREVENTION - Spanning Tree Protocol
 * =============================================
 * 
 * Tento modul implementuje zjednodušenou verzi Spanning Tree Protocol (STP)
 * pro prevenci DEADLOCK situací v síti.
 * 
 * PROBLÉM - BROADCAST STORM (DEADLOCK):
 * 
 * Když jsou switche propojeny do kruhu, broadcast packet se může
 * dostat zpět na původní switch a cirkulovat donekonečna:
 * 
 *    Switch-1 <---> Switch-2
 *       ^               |
 *       |               |
 *       +--- Switch-3 <-+
 * 
 * Packet: Switch-1 → Switch-2 → Switch-3 → Switch-1 → ... (LOOP!)
 * 
 * ŘEŠENÍ - SPANNING TREE:
 * 
 * 1. Detekce smyček v topologii
 * 2. Deaktivace redundantních portů
 * 3. Vytvoření spanning tree (strom bez cyklů)
 * 4. Monitoring a adaptace při změnách
 * 
 * PARALELNÍ ASPEKTY:
 * 
 * - STP běží jako background process
 * - Koordinace mezi switchi pomocí BPDU (Bridge Protocol Data Units)
 * - Distribuovaný algoritmus - každý switch rozhoduje nezávisle
 * - Synchronizace stavů portů
 */

export type PortState = 'blocking' | 'listening' | 'learning' | 'forwarding' | 'disabled';

export interface BPDUPacket {
  rootBridgeId: string;
  cost: number;
  bridgeId: string;
  portId: string;
  timestamp: number;
}

export interface STPPort {
  portId: string;
  state: PortState;
  designatedBridge: string;
  designatedCost: number;
  bpduReceived?: BPDUPacket;
}

/**
 * Spanning Tree Protocol pro jeden switch
 * 
 * DISTRIBUOVANÝ ALGORITMUS:
 * - Každý switch běží vlastní instanci STP
 * - Komunikují přes BPDU pakety
 * - Konvergují k optimálnímu stromu
 */
export class SpanningTreeProtocol {
  private switchId: string;
  private bridgeId: string; // Priority + MAC
  private ports: Map<string, STPPort> = new Map();
  private rootBridgeId: string;
  private rootCost: number = 0;
  private running = false;
  private convergenceInterval?: ReturnType<typeof setInterval>;

  // Seen packets pro loop detection
  private seenBroadcasts: Set<string> = new Set();

  constructor(switchId: string, bridgePriority: number = 32768) {
    this.switchId = switchId;
    // Bridge ID = Priority + MAC address
    this.bridgeId = `${bridgePriority}:${this.generateMAC()}`;
    this.rootBridgeId = this.bridgeId; // Zpočátku jsme root

    console.log(`[STP ${switchId}] Initialized with Bridge ID: ${this.bridgeId}`);
  }

  private generateMAC(): string {
    return Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
    ).join(':');
  }

  /**
   * Registrace portu do STP
   */
  addPort(portId: string): void {
    this.ports.set(portId, {
      portId,
      state: 'listening',
      designatedBridge: this.bridgeId,
      designatedCost: 0,
    });

    console.log(`[STP ${this.switchId}] Port ${portId} added in LISTENING state`);
  }

  /**
   * Spuštění STP procesu
   * Běží jako background task
   */
  start(): void {
    if (this.running) return;

    this.running = true;
    console.log(`[STP ${this.switchId}] Starting convergence process...`);

    // Periodické posílání BPDU a přepočet topologie
    this.convergenceInterval = setInterval(() => {
      this.sendBPDUs();
      this.recalculatePortStates();
    }, 2000); // Každé 2 sekundy

    // Okamžitá konvergence
    this.sendBPDUs();
    this.recalculatePortStates();
  }

  /**
   * Zastavení STP
   */
  stop(): void {
    this.running = false;
    if (this.convergenceInterval) {
      clearInterval(this.convergenceInterval);
    }
    console.log(`[STP ${this.switchId}] Stopped`);
  }

  /**
   * Posílání BPDU paketů na všechny porty
   * 
   * BPDU = Bridge Protocol Data Unit
   * Informuje sousedy o topologii
   */
  private sendBPDUs(): void {
    for (const port of this.ports.values()) {
      if (port.state !== 'disabled') {
        const bpdu: BPDUPacket = {
          rootBridgeId: this.rootBridgeId,
          cost: this.rootCost,
          bridgeId: this.bridgeId,
          portId: port.portId,
          timestamp: Date.now(),
        };

        console.log(`[STP ${this.switchId}] Sending BPDU on ${port.portId}:`, bpdu);
        // V reálném systému by se BPDU poslalo přes síť
        // Zde jen simulujeme
      }
    }
  }

  /**
   * Přijmutí BPDU od souseda
   * 
   * KRITICKÁ ČÁST: Update topologie na základě BPDU
   */
  receiveBPDU(portId: string, bpdu: BPDUPacket): void {
    const port = this.ports.get(portId);
    if (!port) return;

    console.log(`[STP ${this.switchId}] Received BPDU on ${portId} from ${bpdu.bridgeId}`);

    port.bpduReceived = bpdu;

    // Porovnáme BPDU s naší znalostí topologie
    const betterRoot = this.compareBridgeIds(bpdu.rootBridgeId, this.rootBridgeId) < 0;

    if (betterRoot) {
      // Objevili jsme lepší root bridge!
      console.log(`[STP ${this.switchId}] New root bridge: ${bpdu.rootBridgeId}`);
      this.rootBridgeId = bpdu.rootBridgeId;
      this.rootCost = bpdu.cost + 1; // +1 pro náš port
      this.recalculatePortStates();
    }
  }

  /**
   * Přepočet stavů portů na základě topologie
   * 
   * ALGORITMUS:
   * 1. Najdi root port (nejkratší cesta k root bridge)
   * 2. Ostatní porty nastavit na designated nebo blocking
   */
  private recalculatePortStates(): void {
    console.log(`[STP ${this.switchId}] Recalculating port states...`);

    // Pokud jsme root bridge, všechny porty jsou designated
    if (this.rootBridgeId === this.bridgeId) {
      for (const port of this.ports.values()) {
        port.state = 'forwarding';
        port.designatedBridge = this.bridgeId;
        port.designatedCost = 0;
      }
      return;
    }

    // Najdi root port (nejlepší cesta k root)
    let rootPort: STPPort | undefined;
    let bestCost = Infinity;

    for (const port of this.ports.values()) {
      if (port.bpduReceived) {
        const totalCost = port.bpduReceived.cost + 1;
        if (totalCost < bestCost) {
          bestCost = totalCost;
          rootPort = port;
        }
      }
    }

    // Nastav root port
    if (rootPort) {
      rootPort.state = 'forwarding';
      console.log(`[STP ${this.switchId}] Root port: ${rootPort.portId}`);
    }

    // Ostatní porty
    for (const port of this.ports.values()) {
      if (port === rootPort) continue;

      // Designated port nebo blocking?
      if (this.shouldBeDesignated(port)) {
        port.state = 'forwarding';
        console.log(`[STP ${this.switchId}] Port ${port.portId}: FORWARDING (designated)`);
      } else {
        port.state = 'blocking';
        console.log(`[STP ${this.switchId}] Port ${port.portId}: BLOCKING (loop prevention)`);
      }
    }
  }

  /**
   * Určí, zda má být port designated
   */
  private shouldBeDesignated(port: STPPort): boolean {
    // Zjednodušená logika
    // V reálném STP by se porovnávaly náklady a Bridge ID
    return !port.bpduReceived || 
           this.compareBridgeIds(this.bridgeId, port.bpduReceived.bridgeId) < 0;
  }

  /**
   * Porovnání Bridge ID (priority + MAC)
   */
  private compareBridgeIds(id1: string, id2: string): number {
    const [p1] = id1.split(':');
    const [p2] = id2.split(':');
    
    const priority1 = parseInt(p1);
    const priority2 = parseInt(p2);

    if (priority1 !== priority2) {
      return priority1 - priority2;
    }

    return id1.localeCompare(id2);
  }

  /**
   * Kontrola, zda může packet projít portem
   * 
   * PREVENCE LOOPU:
   * - Blocking porty nepropustí pakety
   * - Detekce již viděných broadcast paketů
   */
  canForwardPacket(portId: string, packetId: string, isBroadcast: boolean): boolean {
    const port = this.ports.get(portId);
    if (!port) return false;

    // Blokující port nepropustí nic
    if (port.state === 'blocking' || port.state === 'disabled') {
      console.log(`[STP ${this.switchId}] Packet ${packetId} blocked on ${portId} (port state: ${port.state})`);
      return false;
    }

    // Broadcast loop detection
    if (isBroadcast) {
      if (this.seenBroadcasts.has(packetId)) {
        console.log(`[STP ${this.switchId}] Broadcast loop detected! Packet ${packetId} already seen`);
        return false; // DEADLOCK PREVENTION!
      }
      
      this.seenBroadcasts.add(packetId);
      
      // Cleanup po 10 sekundách
      setTimeout(() => this.seenBroadcasts.delete(packetId), 10000);
    }

    return true;
  }

  /**
   * Získání statistik
   */
  getStats() {
    const states = {
      blocking: 0,
      listening: 0,
      learning: 0,
      forwarding: 0,
      disabled: 0,
    };

    for (const port of this.ports.values()) {
      states[port.state]++;
    }

    return {
      switchId: this.switchId,
      bridgeId: this.bridgeId,
      rootBridgeId: this.rootBridgeId,
      rootCost: this.rootCost,
      isRoot: this.rootBridgeId === this.bridgeId,
      portStates: states,
      seenBroadcasts: this.seenBroadcasts.size,
    };
  }
}

/**
 * PŘÍKLAD POUŽITÍ - PREVENCE BROADCAST STORM:
 * 
 * // Vytvoříme topologii se smyčkou:
 * //    SW1 <---> SW2
 * //     ^         |
 * //     |         |
 * //     +-- SW3 <-+
 * 
 * const sw1 = new SpanningTreeProtocol('SW1', 4096);  // Nižší priorita = root
 * const sw2 = new SpanningTreeProtocol('SW2', 32768);
 * const sw3 = new SpanningTreeProtocol('SW3', 32768);
 * 
 * // Registrace portů
 * sw1.addPort('Fa0/1'); // SW1 -> SW2
 * sw1.addPort('Fa0/2'); // SW1 -> SW3
 * 
 * sw2.addPort('Fa0/1'); // SW2 -> SW1
 * sw2.addPort('Fa0/2'); // SW2 -> SW3
 * 
 * sw3.addPort('Fa0/1'); // SW3 -> SW1
 * sw3.addPort('Fa0/2'); // SW3 -> SW2
 * 
 * // Spustíme STP - konverguje k stromu
 * sw1.start();
 * sw2.start();
 * sw3.start();
 * 
 * // Po konvergenci (pár sekund) jeden z portů bude BLOCKING
 * // Například SW3 Fa0/2 bude zablokován -> žádný loop!
 * 
 * setTimeout(() => {
 *   console.log('SW1:', sw1.getStats());
 *   console.log('SW2:', sw2.getStats());
 *   console.log('SW3:', sw3.getStats());
 *   
 *   // Test forward packet
 *   const canForward = sw3.canForwardPacket('Fa0/2', 'broadcast-1', true);
 *   console.log('Can forward on blocked port?', canForward); // false!
 * }, 5000);
 */
