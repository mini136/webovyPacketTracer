# 🎯 Network Simulator - Kompletní Funkce

## ✅ Co je implementováno

### 🖥️ Zařízení (Devices)
- **Router** ⚡ - Layer 3 routing, statické routy, CLI
- **Switch** 🔀 - Layer 2 switching, VLANy, CLI  
- **PC** 💻 - Koncové zařízení s IP konfigurací
- **Server** 🖥️ - Server s IP konfigurací
- **Hub** ⭐ - Základní hub

### 🔧 Konfigurace

#### 📟 CLI Terminal (Cisco IOS Style)
Plně funkční command-line interface s režimy:
- User mode (`>`)
- Privileged mode (`#`)
- Configuration mode (`(config)#`)
- Interface configuration (`(config-if)#`)

**Příkazy:**
```bash
# User mode
enable, exit, ?

# Privileged mode  
configure terminal, show running-config, show ip interface brief,
show ip route, show vlan brief, disable

# Config mode
hostname NAME, interface TYPE NUM, ip route NET MASK NH, vlan ID

# Interface mode
ip address IP MASK, no shutdown, shutdown, description TEXT,
switchport mode access, switchport access vlan N
```

#### 🎨 GUI Konfigurace
- Properties Panel s vizuální konfigurací
- Interface management (add/edit/delete)
- IP addressing (IPv4 + IPv6)
- Gateway nastavení
- VLAN assignment

### 🌐 Síťové funkce

#### 🔍 Network Tools
- **Ping** - RTT, packet loss, TTL, path visualization
- **Traceroute** - hop-by-hop, device identification
- **Vizualizace** - animované pakety, zvýraznění cesty

#### 🧮 Subnetting Calculator
- Výpočet subnet mask, wildcard mask
- Network & broadcast adresa
- Počet použitelných hostů
- IP třída (A/B/C/D/E)
- Detekce privátních/veřejných IP
- CIDR notace

### 📊 CCNA1 Funkce ✅

#### IP Addressing
- ✅ IPv4 configuration
- ✅ IPv6 support
- ✅ Subnet mask calculation
- ✅ Default gateway
- ✅ Subnetting calculator

#### Basic Device Configuration
- ✅ Hostname configuration
- ✅ Interface enable/disable
- ✅ Interface descriptions
- ✅ IP address assignment
- ✅ Port management

#### Network Testing
- ✅ Ping with statistics
- ✅ Traceroute with hops
- ✅ Path visualization
- ✅ RTT measurement

### 🚀 CCNA2 Funkce ✅

#### Static Routing
- ✅ Static route configuration (`ip route`)
- ✅ Routing table (`show ip route`)
- ✅ Multiple routes support
- ✅ Next-hop specification

#### VLAN Configuration
- ✅ VLAN creation (`vlan ID`)
- ✅ VLAN naming
- ✅ Port assignment to VLANs
- ✅ Access port configuration
- ✅ VLAN database view

#### Advanced Interface Management
- ✅ Speed/duplex (structure ready)
- ✅ Administrative status
- ✅ Protocol status
- ✅ Interface statistics view

### 📦 Datové struktury (Připraveno pro rozšíření)

**Router:**
- Routing table entries
- DHCP pools
- NAT configuration
- Enable secret
- IOS version

**Switch:**
- VLAN database
- Trunk ports
- Spanning Tree Protocol
- VTP configuration

**All Devices:**
- MAC addresses
- Serial numbers
- Running/startup config
- Interface speeds & duplex

## 🎓 CCNA Lab Scénáře

### Lab 1: Basic Router Configuration
```
1. Přidej Router do canvasu
2. Klikni na router -> "📟 Otevřít CLI"
3. Nakonfiguruj:
   enable
   configure terminal
   hostname R1
   interface gigabitethernet0/0
   ip address 192.168.1.1 255.255.255.0
   no shutdown
   exit
   exit
   show ip interface brief
```

### Lab 2: VLAN Configuration
```
1. Přidej Switch + 2 PC
2. Propoj kabely
3. CLI na Switch:
   enable
   conf t
   vlan 10
   vlan 20
   interface fastethernet0/1
   switchport mode access
   switchport access vlan 10
   exit
   interface fastethernet0/2
   switchport access vlan 20
   exit
   exit
   show vlan brief
```

### Lab 3: Static Routing
```
1. Topologie: PC1 -- R1 -- R2 -- PC2
2. Nakonfiguruj IP adresy
3. Na R1:
   ip route 192.168.2.0 255.255.255.0 10.0.0.2
4. Na R2:
   ip route 192.168.1.0 255.255.255.0 10.0.0.1
5. Test: Ping z PC1 na PC2
```

### Lab 4: Subnetting Exercise
```
1. Otevři "🧮 Subnetting Calc"
2. Rozdělení 192.168.1.0/24 na 4 subnety:
   - /26 = 62 hostů per subnet
   - Subnet 1: 192.168.1.0/26
   - Subnet 2: 192.168.1.64/26
   - Subnet 3: 192.168.1.128/26
   - Subnet 4: 192.168.1.192/26
3. Nakonfiguruj routery s těmito subnety
```

## 🔄 Připraveno pro budoucí rozšíření

- Dynamic routing (RIP, OSPF, EIGRP)
- Trunk ports & 802.1Q
- Inter-VLAN routing
- DHCP server configuration
- NAT/PAT configuration
- Access Control Lists (ACLs)
- Spanning Tree Protocol
- VTP (VLAN Trunking Protocol)
- Port security
- EtherChannel

## 💡 Použití

1. **Sidebar** - Přidávání zařízení, nástroje
2. **Canvas** - Propojování zařízení
3. **Properties Panel** - GUI konfigurace + CLI tlačítko
4. **Network Tools** - Testing (ping, traceroute)
5. **Subnetting Calc** - Subnet výpočty

## 🎯 Pro CCNA studenty

Tento simulátor pokrývá:
- ✅ Všechny základní CCNA1 úkoly
- ✅ Většinu CCNA2 routing/switching úkolů
- ✅ CLI s Cisco IOS syntaxí
- ✅ Realistické network testing
- ✅ Subnetting praktika

**Ideální pro:**
- Procvičování CLI příkazů
- Pochopení routing konceptů
- VLAN konfigurace
- Subnetting cvičení
- Troubleshooting sítí
