# 🌐 Network Simulator - CCNA Funkce

## ✅ Implementované funkce pro CCNA1 & CCNA2

### 🔧 Základní konfigurace zařízení

#### CLI Interface (Cisco IOS simulace)
- **User Mode** (`>`) - Základní příkazy
- **Privileged Mode** (`#`) - Pokročilé zobrazení
- **Configuration Mode** (`(config)#`) - Konfigurace zařízení
- **Interface Configuration** (`(config-if)#`) - Konfigurace portů

#### Dostupné příkazy:

**User Mode:**
```
enable              - Vstup do privileged mode
exit                - Ukončení CLI
?                   - Nápověda
```

**Privileged Mode:**
```
configure terminal          - Vstup do config mode
show running-config         - Zobrazení konfigurace
show ip interface brief     - Přehled interfaců
show ip route              - Routovací tabulka
show vlan brief            - VLAN konfigurace (switch)
disable                    - Návrat do user mode
```

**Configuration Mode:**
```
hostname NAME                    - Nastavení hostname
interface TYPE NUM               - Konfigurace interface
ip route NETWORK MASK NEXTHOP   - Statická route
vlan ID                         - Vytvoření VLAN (switch)
exit                            - Ukončení config mode
```

**Interface Configuration:**
```
ip address IP MASK          - Nastavení IP adresy
no shutdown                 - Aktivace portu
shutdown                    - Deaktivace portu
description TEXT            - Popis interface
switchport mode access      - Access port (switch)
switchport access vlan N    - Přiřazení do VLAN (switch)
```

### 📊 CCNA1 - Základy

#### 1. IP Addressing & Subnetting
✅ **Subnetting Calculator**
- Výpočet subnet mask
- Wildcard mask
- Síťová a broadcast adresa
- Počet použitelných hostů
- Detekce IP třídy (A, B, C)
- Rozpoznání privátních/veřejných IP

#### 2. Základní konfigurace zařízení
✅ **Router Configuration**
- Hostname
- Interface management
- IP addressing
- Enable/disable interfaces
- Interface descriptions

✅ **Switch Configuration**
- Hostname
- VLAN creation
- Port assignment to VLANs
- Interface management

✅ **End Devices (PC, Server)**
- IP configuration
- Gateway nastavení
- IPv4 i IPv6 podpora

#### 3. Network Connectivity Testing
✅ **Ping**
- RTT (Round Trip Time) měření
- Packet loss detection
- TTL tracking
- Path visualization

✅ **Traceroute**
- Hop-by-hop zobrazení
- Device identification
- RTT per hop
- Network path visualization

### 🚀 CCNA2 - Routing & Switching

#### 1. Static Routing
✅ **Implementováno:**
- Příkaz: `ip route NETWORK MASK NEXTHOP`
- Routing table zobrazení (`show ip route`)
- Podpora multiple static routes

#### 2. VLAN Configuration
✅ **Implementováno:**
- VLAN creation (`vlan ID`)
- Port assignment to VLANs
- VLAN database management
- VLAN brief display (`show vlan brief`)

#### 3. Interface Management
✅ **Implementováno:**
- Interface enable/disable
- IP addressing
- Descriptions
- Speed/duplex (připraveno v datové struktuře)

### 🎯 Ukázkové scénáře

#### Scénář 1: Základní routování
```
1. Vytvoř Router-1, Switch-1, PC-1, PC-2
2. Propoj zařízení kabely
3. Otevři CLI na Router-1:
   Router> enable
   Router# configure terminal
   Router(config)# hostname R1
   R1(config)# interface gigabitethernet0/0
   R1(config-if)# ip address 192.168.1.1 255.255.255.0
   R1(config-if)# no shutdown
   R1(config-if)# exit
4. Nakonfiguruj PC-1: 192.168.1.10/24, gateway 192.168.1.1
5. Test: Network Tools -> Ping z PC-1 na 192.168.1.1
```

#### Scénář 2: VLAN konfigurace
```
1. Vytvoř Switch s PC-1, PC-2
2. Otevři CLI na Switch:
   Switch> enable
   Switch# conf t
   Switch(config)# vlan 10
   Switch(config)# vlan 20
   Switch(config)# interface fastethernet0/1
   Switch(config-if)# switchport mode access
   Switch(config-if)# switchport access vlan 10
   Switch(config-if)# exit
   Switch(config)# interface fastethernet0/2
   Switch(config-if)# switchport access vlan 20
3. Příkaz: show vlan brief
```

#### Scénář 3: Subnetting
```
1. Klikni "🧮 Subnetting Calc" v sidebaru
2. Zadej IP: 192.168.10.0
3. CIDR: 26
4. Výpočet ukáže:
   - Subnet Mask: 255.255.255.192
   - Použitelné IP: 62
   - Network: 192.168.10.0
   - Broadcast: 192.168.10.63
   - First: 192.168.10.1
   - Last: 192.168.10.62
```

### 📝 Datové struktury

Všechna zařízení mají nyní rozšířené vlastnosti:

**Interfaces:**
- IP address, subnet mask, IPv6
- Gateway
- Enable/disable status
- VLAN assignment
- Speed, duplex
- Description

**Router specific:**
- Routing table
- DHCP pools (připraveno)
- NAT config (připraveno)
- Enable secret

**Switch specific:**
- VLAN database
- Trunk ports (připraveno)
- Spanning Tree (připraveno)
- VTP mode (připraveno)

### 🎓 Pro CCNA zkoušky

Tento simulátor pokrývá většinu praktických úkolů z CCNA1 a CCNA2:
- ✅ IP addressing & subnetting
- ✅ Basic device configuration
- ✅ Static routing
- ✅ VLAN creation & assignment
- ✅ Interface management
- ✅ Connectivity testing (ping, traceroute)
- ✅ CLI command syntax (Cisco IOS style)
- 🔄 Dynamic routing (připraveno pro rozšíření)
- 🔄 Trunking (připraveno pro rozšíření)
- 🔄 DHCP, NAT (připraveno pro rozšíření)

### 💡 Tipy

1. **Používej CLI** pro realistickou praxi s Cisco příkazy
2. **Ukázková síť** vytvoří automaticky nakonfigurovanou topologii
3. **Subnetting Calculator** pro rychlé výpočty během konfigurace
4. **Network Tools** pro testování konektivity
5. **Properties Panel** pro GUI konfiguraci (alternativa k CLI)
