# 🔮 Roadmap a Další Funkce

## Fáze 1: ✅ Základ (HOTOVO)
- [x] Základní projekt struktura
- [x] React + TypeScript frontend
- [x] NestJS backend
- [x] MongoDB integrace
- [x] React Flow canvas editor
- [x] Drag & drop zařízení
- [x] Propojování zařízení
- [x] REST API pro CRUD operace
- [x] WebSocket gateway

## Fáze 2: 🎯 Síťová Simulace (PRIORITY)

### 2.1 Konfigurace Zařízení
```typescript
// TODO: Implementovat
- [ ] IP konfigurace rozhraní
- [ ] Subnet mask kalkulátor
- [ ] MAC address generování
- [ ] Interface up/down toggle
```

### 2.2 Routing Engine
```typescript
// Základní routing algoritmy
- [ ] Static routing tabulky
- [ ] RIP (Routing Information Protocol)
- [ ] OSPF (Open Shortest Path First) - základní
- [ ] Route lookup algoritmus
```

### 2.3 Switching Logic
```typescript
// Layer 2 switching
- [ ] MAC address tabulka
- [ ] Frame forwarding
- [ ] Broadcast domény
- [ ] VLAN základy
```

### 2.4 Packet Simulation
```typescript
// Vizualizace a logika paketů
- [ ] Packet generator
- [ ] Animace paketů mezi zařízeními
- [ ] TTL a hop count
- [ ] Packet header visualization
```

## Fáze 3: 🔧 Nástroje a Příkazy

### 3.1 Network Commands
```bash
# Implementovat tyto příkazy
- [ ] ping <IP> - ICMP echo request/reply
- [ ] traceroute <IP> - Path discovery
- [ ] arp -a - ARP tabulka
- [ ] ipconfig/ifconfig - Interface info
- [ ] route print - Routing tabulka
```

### 3.2 CLI Interface
```typescript
// Cisco-like CLI pro konfiguraci
- [ ] Command parser
- [ ] Privilege levels (user/privileged/config)
- [ ] show running-config
- [ ] show ip route
- [ ] configure terminal
```

### 3.3 Diagnostic Tools
```typescript
- [ ] Bandwidth monitor
- [ ] Latency simulator
- [ ] Packet loss simulator
- [ ] Traffic analyzer
```

## Fáze 4: 💾 Persistence & Collaboration

### 4.1 Project Management
```typescript
- [ ] Save/Load topologie do MongoDB
- [ ] Export do JSON/XML
- [ ] Import z Cisco Packet Tracer
- [ ] Template library (common topologies)
```

### 4.2 User Management
```typescript
- [ ] Registrace/Login (JWT)
- [ ] User workspace
- [ ] Sdílené projekty
- [ ] Public gallery
```

### 4.3 Real-time Collaboration
```typescript
- [ ] Multi-user editing (Socket.io)
- [ ] Cursor tracking
- [ ] Chat
- [ ] Change history
```

## Fáze 5: 🎨 UI/UX Vylepšení

### 5.1 Advanced Canvas
```typescript
- [ ] Grid snapping
- [ ] Alignment tools
- [ ] Zoom controls
- [ ] Pan/navigate
- [ ] Undo/Redo
- [ ] Copy/Paste devices
```

### 5.2 Visual Features
```typescript
- [ ] Custom device icons (SVG)
- [ ] Cable animations
- [ ] Status indicators (LED)
- [ ] Packet trails
- [ ] Heat map (traffic)
```

### 5.3 Responsive Design
```typescript
- [ ] Mobile viewport
- [ ] Touch gestures
- [ ] Dark mode
- [ ] Accessibility (a11y)
```

## Fáze 6: 🧪 Protokoly & Advanced

### 6.1 Layer 2/3 Protocols
```typescript
- [ ] ARP (Address Resolution Protocol)
- [ ] ICMP (Ping, TTL exceeded)
- [ ] IP forwarding
- [ ] NAT (Network Address Translation)
- [ ] DHCP client/server
```

### 6.2 Transport Layer
```typescript
- [ ] TCP handshake simulation
- [ ] UDP
- [ ] Port forwarding
```

### 6.3 Application Layer
```typescript
- [ ] HTTP requests
- [ ] DNS resolver
- [ ] FTP basic
- [ ] Telnet/SSH simulation
```

### 6.4 Security
```typescript
- [ ] ACL (Access Control Lists)
- [ ] Firewall rules
- [ ] Port security
- [ ] Basic IDS/IPS
```

## Fáze 7: 📚 Education Features

### 7.1 Learning Mode
```typescript
- [ ] Interactive tutorials
- [ ] Step-by-step labs
- [ ] Quiz/Challenges
- [ ] Achievement system
```

### 7.2 Documentation
```typescript
- [ ] In-app help
- [ ] Protocol explanations
- [ ] Video tutorials
- [ ] Community wiki
```

## 🚀 Rychlé Wins (Low-hanging fruit)

### Co implementovat TEĎ:
1. **IP Configuration Panel** (1-2 dny)
   - Form pro nastavení IP/mask na interface
   - Validace IP adres
   - Visual feedback

2. **Ping Simulation** (2-3 dny)
   - Základní ICMP echo
   - Animace paketu
   - Console output

3. **Save/Load Topology** (1 den)
   - Export do JSON
   - Import z JSON
   - LocalStorage fallback

4. **Device Templates** (1 den)
   - Předkonfigurované routery
   - Switch templates
   - PC/Server presets

## 📊 Technické Dluhopisy

### Performance
```typescript
- [ ] Canvas virtualization (pro velké sítě)
- [ ] WebWorker pro simulace
- [ ] Debounce/throttle updates
- [ ] Lazy loading devices
```

### Testing
```typescript
- [ ] Unit testy (Jest)
- [ ] E2E testy (Playwright)
- [ ] Integration testy
- [ ] Load testing
```

### DevOps
```typescript
- [ ] CI/CD pipeline
- [ ] Docker production images
- [ ] Kubernetes deployment
- [ ] Monitoring (Prometheus)
```

## 💡 Nápady na Budoucnost

- AI asistent pro network design
- AR/VR mode pro 3D topologie
- Blockchain pro certified configurations
- Integration s real network hardware
- Mobile app (React Native)
- VS Code extension
- Plugin system pro custom devices

---

**Poznámky:**
- Prioritizuj fáze 2-3 pro core functionality
- Fáze 4-5 pro production readiness
- Fáze 6-7 pro advanced features
