import { useNetworkStore } from "../store/networkStore";
import { useState } from "react";
import CLITerminal from "./CLITerminal";

export default function PropertiesPanel() {
  const { selectedNode, updateNode, removeNode } = useNetworkStore();
  const [editingInterface, setEditingInterface] = useState<number | null>(null);
  const [showCLI, setShowCLI] = useState(false);
  const [ipv4, setIpv4] = useState("");
  const [subnet, setSubnet] = useState("");
  const [gateway, setGateway] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [ipv6Prefix, setIpv6Prefix] = useState("64");
  const [ipv6Gateway, setIpv6Gateway] = useState("");
  const [ipv6Enabled, setIpv6Enabled] = useState(false);

  // Routing Table state
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [routeNetwork, setRouteNetwork] = useState("");
  const [routeMask, setRouteMask] = useState("");
  const [routeNextHop, setRouteNextHop] = useState("");
  const [routeMetric, setRouteMetric] = useState("1");

  // IPv6 Routing Table state
  const [showAddIpv6Route, setShowAddIpv6Route] = useState(false);
  const [ipv6RouteNetwork, setIpv6RouteNetwork] = useState("");
  const [ipv6RoutePrefixLength, setIpv6RoutePrefixLength] = useState("64");
  const [ipv6RouteNextHop, setIpv6RouteNextHop] = useState("");
  const [ipv6RouteMetric, setIpv6RouteMetric] = useState("1");

  // DHCP state
  const [showAddDhcp, setShowAddDhcp] = useState(false);
  const [dhcpName, setDhcpName] = useState("");
  const [dhcpNetwork, setDhcpNetwork] = useState("");
  const [dhcpMask, setDhcpMask] = useState("");
  const [dhcpRouter, setDhcpRouter] = useState("");
  const [dhcpDns, setDhcpDns] = useState("");

  // DHCPv6 state
  const [showAddDhcpv6, setShowAddDhcpv6] = useState(false);
  const [dhcpv6Name, setDhcpv6Name] = useState("");
  const [dhcpv6Prefix, setDhcpv6Prefix] = useState("");
  const [dhcpv6PrefixLength, setDhcpv6PrefixLength] = useState("64");
  const [dhcpv6DnsServer, setDhcpv6DnsServer] = useState("");

  // DNS state
  const [showAddDns, setShowAddDns] = useState(false);
  const [dnsHostname, setDnsHostname] = useState("");
  const [dnsIpAddress, setDnsIpAddress] = useState("");
  const [dnsType, setDnsType] = useState<"A" | "AAAA" | "CNAME">("A");

  // VLAN state (for switches)
  const [showAddVlan, setShowAddVlan] = useState(false);
  const [vlanId, setVlanId] = useState("");
  const [vlanName, setVlanName] = useState("");
  const [editingPort, setEditingPort] = useState<string | null>(null);
  const [portVlan, setPortVlan] = useState("1");

  // Sub-interface state (for routers)
  const [showAddSubInterface, setShowAddSubInterface] = useState<number | null>(
    null
  );
  const [subInterfaceName, setSubInterfaceName] = useState("");
  const [subInterfaceVlan, setSubInterfaceVlan] = useState("");

  // IPv6 validation function
  const validateIPv6 = (address: string): boolean => {
    if (!address) return true; // Empty is OK

    // IPv6 regex - podporuje plnou i zkrácenou notaci
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
    return ipv6Regex.test(address);
  };

  // IPv4 validation function
  const validateIPv4 = (address: string): boolean => {
    if (!address) return true; // Empty is OK
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(address);
  };

  // Validate IPv6 prefix length
  const validatePrefixLength = (prefix: string): boolean => {
    const num = parseInt(prefix);
    return !isNaN(num) && num >= 1 && num <= 128;
  };
  const [subInterfaceIp, setSubInterfaceIp] = useState("");
  const [subInterfaceMask, setSubInterfaceMask] = useState("");
  const [subInterfaceDesc, setSubInterfaceDesc] = useState("");

  // Trunk port configuration state
  const [configuringTrunk, setConfiguringTrunk] = useState<number | null>(null);
  const [trunkAllowedVlans, setTrunkAllowedVlans] = useState<number[]>([]);
  const [trunkNativeVlan, setTrunkNativeVlan] = useState("1");

  if (!selectedNode) {
    return (
      <div
        style={{
          width: "20vw",
          minWidth: "300px",
          maxWidth: "400px",
          background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
          padding: "17px",
          height: "100vh",
          borderLeft: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", marginTop: "70px" }}>
          <div style={{ fontSize: "45px", marginBottom: "11px", opacity: 0.3 }}>
            🔍
          </div>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "6px",
              color: "#334155",
            }}
          >
            Vlastnosti Zařízení
          </h3>
          <p style={{ color: "#64748b", fontSize: "10px", lineHeight: "1.5" }}>
            Vyber zařízení na canvasu pro zobrazení a úpravu vlastností
          </p>
        </div>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(selectedNode.id, { label: e.target.value });
  };

  const handleDelete = () => {
    if (confirm(`Opravdu smazat ${selectedNode.data.label}?`)) {
      removeNode(selectedNode.id);
    }
  };

  const handleAddInterface = () => {
    const deviceType = selectedNode.data.type;
    let interfaceName = "Eth0";

    if (deviceType === "router") {
      const count = selectedNode.data.interfaces.length;
      interfaceName = `Gig0/${count}`;
    } else if (deviceType === "switch") {
      const count = selectedNode.data.interfaces.length;
      interfaceName = `Fa0/${count + 1}`;
    } else if (deviceType === "pc" || deviceType === "server") {
      interfaceName = `Eth${selectedNode.data.interfaces.length}`;
    }

    const newInterfaces = [
      ...selectedNode.data.interfaces,
      {
        name: interfaceName,
        ipAddress: "",
        subnetMask: "",
        ipv6Address: "",
        gateway: "",
      },
    ];

    updateNode(selectedNode.id, { interfaces: newInterfaces });
  };

  const handleSaveInterface = (index: number) => {
    // Validace IPv4
    if (ipv4 && !validateIPv4(ipv4)) {
      alert("❌ Neplatná IPv4 adresa! Použij formát: 192.168.1.1");
      return;
    }
    if (subnet && !validateIPv4(subnet)) {
      alert("❌ Neplatná subnet maska! Použij formát: 255.255.255.0");
      return;
    }
    if (gateway && !validateIPv4(gateway)) {
      alert("❌ Neplatná gateway adresa! Použij formát: 192.168.1.1");
      return;
    }

    // Validace IPv6
    if (ipv6Enabled) {
      if (ipv6 && !validateIPv6(ipv6)) {
        alert(
          "❌ Neplatná IPv6 adresa! Použij formát: 2001:db8::1 nebo 2001:0db8:0000:0000:0000:0000:0000:0001"
        );
        return;
      }
      if (!validatePrefixLength(ipv6Prefix)) {
        alert(
          "❌ Neplatný prefix length! Musí být číslo mezi 1-128 (standardně 64)"
        );
        return;
      }
      if (ipv6Gateway && !validateIPv6(ipv6Gateway)) {
        alert("❌ Neplatná IPv6 gateway! Použij formát: 2001:db8::1");
        return;
      }
    }

    const newInterfaces = [...selectedNode.data.interfaces];
    newInterfaces[index] = {
      ...newInterfaces[index],
      ipAddress: ipv4,
      subnetMask: subnet,
      gateway: gateway,
      ipv6Address: ipv6,
      ipv6PrefixLength: parseInt(ipv6Prefix) || 64,
      ipv6Gateway: ipv6Gateway,
      ipv6Enabled: ipv6Enabled,
    };

    updateNode(selectedNode.id, { interfaces: newInterfaces });
    setEditingInterface(null);
    setIpv4("");
    setSubnet("");
    setGateway("");
    setIpv6("");
    setIpv6Prefix("64");
    setIpv6Gateway("");
    setIpv6Enabled(false);
  };

  const handleEditInterface = (index: number) => {
    const iface = selectedNode.data.interfaces[index];
    setEditingInterface(index);
    setIpv4(iface.ipAddress || "");
    setSubnet(iface.subnetMask || "");
    setGateway(iface.gateway || "");
    setIpv6(iface.ipv6Address || "");
    setIpv6Prefix((iface.ipv6PrefixLength || 64).toString());
    setIpv6Gateway(iface.ipv6Gateway || "");
    setIpv6Enabled(iface.ipv6Enabled || false);
  };

  const handleDeleteInterface = (index: number) => {
    const newInterfaces = selectedNode.data.interfaces.filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, { interfaces: newInterfaces });
  };

  const handleAddRoute = () => {
    if (!routeNetwork || !routeMask || !routeNextHop) {
      alert("Vyplň všechna povinná pole!");
      return;
    }

    const newRoutes = [
      ...(selectedNode.data.routingTable || []),
      {
        network: routeNetwork,
        mask: routeMask,
        nextHop: routeNextHop,
        metric: parseInt(routeMetric) || 1,
        protocol: "static" as const,
      },
    ];

    updateNode(selectedNode.id, { routingTable: newRoutes });
    setRouteNetwork("");
    setRouteMask("");
    setRouteNextHop("");
    setRouteMetric("1");
    setShowAddRoute(false);
  };

  const handleDeleteRoute = (index: number) => {
    const newRoutes = (selectedNode.data.routingTable || []).filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, { routingTable: newRoutes });
  };

  // IPv6 Routing handlers
  const handleAddIpv6Route = () => {
    if (!ipv6RouteNetwork || !ipv6RouteNextHop) {
      alert("Vyplň síť a next hop!");
      return;
    }

    // Validace
    if (!validateIPv6(ipv6RouteNetwork)) {
      alert("❌ Neplatná IPv6 síť! Použij formát: 2001:db8:1234::");
      return;
    }

    if (!validatePrefixLength(ipv6RoutePrefixLength)) {
      alert("❌ Neplatný prefix length! Musí být číslo mezi 1-128");
      return;
    }

    if (!validateIPv6(ipv6RouteNextHop)) {
      alert("❌ Neplatná IPv6 next hop adresa!");
      return;
    }

    const newRoutes = [
      ...(selectedNode.data.ipv6RoutingTable || []),
      {
        network: ipv6RouteNetwork,
        prefixLength: parseInt(ipv6RoutePrefixLength),
        nextHop: ipv6RouteNextHop,
        metric: parseInt(ipv6RouteMetric) || 1,
        protocol: "static" as const,
        adminDistance: 1,
      },
    ];

    updateNode(selectedNode.id, { ipv6RoutingTable: newRoutes });
    setIpv6RouteNetwork("");
    setIpv6RoutePrefixLength("64");
    setIpv6RouteNextHop("");
    setIpv6RouteMetric("1");
    setShowAddIpv6Route(false);
  };

  const handleDeleteIpv6Route = (index: number) => {
    const newRoutes = (selectedNode.data.ipv6RoutingTable || []).filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, { ipv6RoutingTable: newRoutes });
  };

  const handleAddDhcpPool = () => {
    if (!dhcpName || !dhcpNetwork || !dhcpMask) {
      alert("Vyplň povinná pole (Name, Network, Mask)!");
      return;
    }

    const newPools = [
      ...(selectedNode.data.dhcpPools || []),
      {
        name: dhcpName,
        network: dhcpNetwork,
        mask: dhcpMask,
        defaultRouter: dhcpRouter,
        dnsServer: dhcpDns,
        leaseTime: 86400, // 24 hours
      },
    ];

    updateNode(selectedNode.id, { dhcpPools: newPools, isDhcpServer: true });
    setDhcpName("");
    setDhcpNetwork("");
    setDhcpMask("");
    setDhcpRouter("");
    setDhcpDns("");
    setShowAddDhcp(false);
  };

  const handleDeleteDhcpPool = (index: number) => {
    const newPools = (selectedNode.data.dhcpPools || []).filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, {
      dhcpPools: newPools,
      isDhcpServer: newPools.length > 0,
    });
  };

  // DHCPv6 handlers
  const handleAddDhcpv6Pool = () => {
    if (!dhcpv6Name || !dhcpv6Prefix) {
      alert("Vyplň povinná pole (Name, IPv6 Prefix)!");
      return;
    }

    // Validace IPv6 prefixu
    if (!validateIPv6(dhcpv6Prefix)) {
      alert("❌ Neplatný IPv6 prefix! Použij formát: 2001:db8:1234::");
      return;
    }

    if (!validatePrefixLength(dhcpv6PrefixLength)) {
      alert("❌ Neplatný prefix length! Musí být číslo mezi 1-128");
      return;
    }

    if (dhcpv6DnsServer && !validateIPv6(dhcpv6DnsServer)) {
      alert("❌ Neplatná IPv6 DNS adresa!");
      return;
    }

    const newPools = [
      ...(selectedNode.data.dhcpv6Pools || []),
      {
        name: dhcpv6Name,
        prefix: dhcpv6Prefix,
        prefixLength: parseInt(dhcpv6PrefixLength),
        dnsServer: dhcpv6DnsServer,
        leaseTime: 86400, // 24 hours
      },
    ];

    updateNode(selectedNode.id, {
      dhcpv6Pools: newPools,
      isDhcpv6Server: true,
    });
    setDhcpv6Name("");
    setDhcpv6Prefix("");
    setDhcpv6PrefixLength("64");
    setDhcpv6DnsServer("");
    setShowAddDhcpv6(false);
  };

  const handleDeleteDhcpv6Pool = (index: number) => {
    const newPools = (selectedNode.data.dhcpv6Pools || []).filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, {
      dhcpv6Pools: newPools,
      isDhcpv6Server: newPools.length > 0,
    });
  };

  const handleAddDnsRecord = () => {
    if (!dnsHostname || !dnsIpAddress) {
      alert("Vyplň hostname a IP adresu!");
      return;
    }

    const newRecords = [
      ...(selectedNode.data.dnsRecords || []),
      {
        hostname: dnsHostname,
        ipAddress: dnsIpAddress,
        type: dnsType,
      },
    ];

    updateNode(selectedNode.id, { dnsRecords: newRecords, isDnsServer: true });
    setDnsHostname("");
    setDnsIpAddress("");
    setDnsType("A");
    setShowAddDns(false);
  };

  const handleDeleteDnsRecord = (index: number) => {
    const newRecords = (selectedNode.data.dnsRecords || []).filter(
      (_, i) => i !== index
    );
    updateNode(selectedNode.id, {
      dnsRecords: newRecords,
      isDnsServer: newRecords.length > 0,
    });
  };

  const handleAddVlan = () => {
    const id = parseInt(vlanId);
    if (!id || id < 1 || id > 4094) {
      alert("VLAN ID musí být mezi 1 a 4094");
      return;
    }

    const vlans = selectedNode.data.vlans || [];
    if (vlans.find((v) => v.id === id)) {
      alert(`VLAN ${id} již existuje`);
      return;
    }

    const newVlans = [
      ...vlans,
      { id, name: vlanName || `VLAN${id}`, ports: [] },
    ];
    updateNode(selectedNode.id, { vlans: newVlans });
    setVlanId("");
    setVlanName("");
    setShowAddVlan(false);
  };

  const handleDeleteVlan = (vlanIdToDelete: number) => {
    if (vlanIdToDelete === 1) {
      alert("Nelze smazat výchozí VLAN 1");
      return;
    }
    const newVlans = (selectedNode.data.vlans || []).filter(
      (v) => v.id !== vlanIdToDelete
    );
    updateNode(selectedNode.id, { vlans: newVlans });
  };

  const handleEditPort = (portName: string) => {
    setEditingPort(portName);
    const iface = selectedNode.data.interfaces.find((i) => i.name === portName);
    setPortVlan((iface?.vlanId || 1).toString());
  };

  const handleSavePortConfig = () => {
    if (!editingPort) return;

    const vlanIdNum = parseInt(portVlan);
    const vlans = selectedNode.data.vlans || [];

    // Remove port from all VLANs first
    const updatedVlans = vlans.map((vlan) => ({
      ...vlan,
      ports: vlan.ports.filter((p) => p !== editingPort),
    }));

    // Add port to selected VLAN
    const targetVlan = updatedVlans.find((v) => v.id === vlanIdNum);
    if (targetVlan) {
      targetVlan.ports.push(editingPort);
    }

    // Update interface with VLAN info
    const interfaces = selectedNode.data.interfaces.map((iface) => {
      if (iface.name === editingPort) {
        return { ...iface, vlanId: vlanIdNum };
      }
      return iface;
    });

    updateNode(selectedNode.id, { vlans: updatedVlans, interfaces });
    setEditingPort(null);
  };

  // Sub-interface handlers for routers
  const handleAddSubInterface = (interfaceIndex: number) => {
    if (!subInterfaceName || !subInterfaceVlan) {
      alert("Vyplň jméno sub-interface a VLAN ID!");
      return;
    }

    const vlanId = parseInt(subInterfaceVlan);
    if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
      alert("VLAN ID musí být mezi 1 a 4094");
      return;
    }

    const newInterfaces = [...selectedNode.data.interfaces];
    const parentInterface = newInterfaces[interfaceIndex];

    const newSubInterface = {
      name: subInterfaceName,
      vlanId: vlanId,
      ipAddress: subInterfaceIp,
      subnetMask: subInterfaceMask,
      description: subInterfaceDesc,
    };

    if (!parentInterface.subInterfaces) {
      parentInterface.subInterfaces = [];
    }

    // Check if sub-interface already exists
    if (
      parentInterface.subInterfaces.find(
        (si) => si.name === subInterfaceName || si.vlanId === vlanId
      )
    ) {
      alert("Sub-interface s tímto jménem nebo VLAN ID již existuje!");
      return;
    }

    parentInterface.subInterfaces.push(newSubInterface);
    parentInterface.trunkMode = true; // Automatically enable trunk mode

    updateNode(selectedNode.id, { interfaces: newInterfaces });

    // Reset form
    setSubInterfaceName("");
    setSubInterfaceVlan("");
    setSubInterfaceIp("");
    setSubInterfaceMask("");
    setSubInterfaceDesc("");
    setShowAddSubInterface(null);
  };

  const handleDeleteSubInterface = (
    interfaceIndex: number,
    subInterfaceIndex: number
  ) => {
    const newInterfaces = [...selectedNode.data.interfaces];
    const parentInterface = newInterfaces[interfaceIndex];

    if (parentInterface.subInterfaces) {
      parentInterface.subInterfaces = parentInterface.subInterfaces.filter(
        (_, idx) => idx !== subInterfaceIndex
      );

      // Disable trunk mode if no sub-interfaces remain
      if (parentInterface.subInterfaces.length === 0) {
        parentInterface.trunkMode = false;
      }
    }

    updateNode(selectedNode.id, { interfaces: newInterfaces });
  };

  // Trunk port configuration handlers
  const handleToggleTrunkMode = (interfaceIndex: number) => {
    const newInterfaces = [...selectedNode.data.interfaces];
    const iface = newInterfaces[interfaceIndex];

    iface.trunkMode = !iface.trunkMode;

    if (iface.trunkMode) {
      // Initialize trunk settings
      if (!iface.allowedVlans || iface.allowedVlans.length === 0) {
        iface.allowedVlans = [1]; // Default to VLAN 1
      }
      if (!iface.nativeVlan) {
        iface.nativeVlan = 1;
      }
    } else {
      // Clear trunk settings when switching to access mode
      iface.allowedVlans = undefined;
      iface.nativeVlan = undefined;
    }

    updateNode(selectedNode.id, { interfaces: newInterfaces });
  };

  const handleSaveTrunkConfig = (interfaceIndex: number) => {
    const newInterfaces = [...selectedNode.data.interfaces];
    const iface = newInterfaces[interfaceIndex];

    iface.allowedVlans = trunkAllowedVlans;
    iface.nativeVlan = parseInt(trunkNativeVlan) || 1;

    updateNode(selectedNode.id, { interfaces: newInterfaces });
    setConfiguringTrunk(null);
  };

  const handleToggleVlanInTrunk = (vlanId: number) => {
    if (trunkAllowedVlans.includes(vlanId)) {
      setTrunkAllowedVlans(trunkAllowedVlans.filter((v) => v !== vlanId));
    } else {
      setTrunkAllowedVlans(
        [...trunkAllowedVlans, vlanId].sort((a, b) => a - b)
      );
    }
  };

  const handleConfigureTrunk = (interfaceIndex: number) => {
    const iface = selectedNode.data.interfaces[interfaceIndex];
    setConfiguringTrunk(interfaceIndex);
    setTrunkAllowedVlans(iface.allowedVlans || [1]);
    setTrunkNativeVlan((iface.nativeVlan || 1).toString());
  };

  const deviceTypeLabels: Record<string, string> = {
    router: "⚡ Router",
    switch: "🔀 Switch",
    pc: "💻 PC",
    server: "🖥️ Server",
    hub: "⭐ Hub",
  };

  return (
    <div
      style={{
        width: "20vw",
        minWidth: "300px",
        maxWidth: "400px",
        background: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
        padding: "17px",
        height: "100vh",
        borderLeft: "1px solid #e2e8f0",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "17px" }}>
        <div
          style={{
            fontSize: "8px",
            color: "#64748b",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          Vybrané Zařízení
        </div>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>
          {deviceTypeLabels[selectedNode.data.type] || selectedNode.data.type}
        </h3>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "11px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "9px",
            fontWeight: "600",
            marginBottom: "6px",
            color: "#334155",
          }}
        >
          Název Zařízení
        </label>
        <input
          type="text"
          value={selectedNode.data.label}
          onChange={handleNameChange}
          style={{
            width: "100%",
            padding: "7px 8px",
            borderRadius: "6px",
            border: "1.5px solid #e2e8f0",
            fontSize: "10px",
            fontWeight: "500",
            transition: "all 0.2s",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
          }}
        />
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "11px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "9px",
            fontWeight: "600",
            marginBottom: "6px",
            color: "#334155",
          }}
        >
          Typ Zařízení
        </label>
        <div
          style={{
            padding: "7px 8px",
            borderRadius: "6px",
            background: "#f1f5f9",
            fontSize: "10px",
            fontWeight: "500",
            color: "#64748b",
          }}
        >
          {selectedNode.data.type.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "11px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🔌</span>
            <span>Rozhraní</span>
          </div>
          <button
            onClick={handleAddInterface}
            style={{
              padding: "3px 6px",
              background: "#3b82f6",
              border: "none",
              borderRadius: "4px",
              color: "white",
              fontSize: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + Přidat
          </button>
        </div>
        {selectedNode.data.interfaces.length === 0 ? (
          <div
            style={{
              padding: "11px",
              background: "#f8fafc",
              borderRadius: "6px",
              textAlign: "center",
              color: "#64748b",
              fontSize: "9px",
            }}
          >
            Žádná rozhraní nakonfigurována
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {selectedNode.data.interfaces.map((iface, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px",
                  background: editingInterface === idx ? "#eff6ff" : "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "9px",
                  border:
                    editingInterface === idx
                      ? "1.5px solid #3b82f6"
                      : "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: editingInterface === idx ? "6px" : "3px",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#0f172a" }}>
                    {iface.name}
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {editingInterface !== idx && (
                      <>
                        <button
                          onClick={() => handleEditInterface(idx)}
                          style={{
                            padding: "2px 5px",
                            background: "#3b82f6",
                            border: "none",
                            borderRadius: "3px",
                            color: "white",
                            fontSize: "7px",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteInterface(idx)}
                          style={{
                            padding: "2px 5px",
                            background: "#ef4444",
                            border: "none",
                            borderRadius: "3px",
                            color: "white",
                            fontSize: "7px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingInterface === idx ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: "7px",
                          color: "#64748b",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        IPv4 Adresa
                      </label>
                      <input
                        type="text"
                        value={ipv4}
                        onChange={(e) => setIpv4(e.target.value)}
                        placeholder="192.168.1.1"
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                          fontSize: "8px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "7px",
                          color: "#64748b",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        Subnet Maska
                      </label>
                      <input
                        type="text"
                        value={subnet}
                        onChange={(e) => setSubnet(e.target.value)}
                        placeholder="255.255.255.0"
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                          fontSize: "8px",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: "7px",
                          color: "#64748b",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        IPv4 Default Gateway
                      </label>
                      <input
                        type="text"
                        value={gateway}
                        onChange={(e) => setGateway(e.target.value)}
                        placeholder="192.168.1.254"
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                          fontSize: "8px",
                        }}
                      />
                    </div>

                    {/* IPv6 Configuration */}
                    <div
                      style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "6px",
                        }}
                      >
                        <input
                          type="checkbox"
                          id={`ipv6-enabled-${idx}`}
                          checked={ipv6Enabled}
                          onChange={(e) => setIpv6Enabled(e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        <label
                          htmlFor={`ipv6-enabled-${idx}`}
                          style={{
                            fontSize: "7px",
                            color: "#64748b",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Povolit IPv6
                        </label>
                      </div>

                      {ipv6Enabled && (
                        <>
                          <div style={{ marginBottom: "5px" }}>
                            <label
                              style={{
                                fontSize: "7px",
                                color: "#64748b",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              IPv6 Adresa
                            </label>
                            <input
                              type="text"
                              value={ipv6}
                              onChange={(e) => setIpv6(e.target.value)}
                              placeholder="2001:db8::1"
                              style={{
                                width: "100%",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                fontSize: "8px",
                              }}
                            />
                          </div>
                          <div style={{ marginBottom: "5px" }}>
                            <label
                              style={{
                                fontSize: "7px",
                                color: "#64748b",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              Prefix Length
                            </label>
                            <input
                              type="text"
                              value={ipv6Prefix}
                              onChange={(e) => setIpv6Prefix(e.target.value)}
                              placeholder="64"
                              style={{
                                width: "100%",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                fontSize: "8px",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "7px",
                                color: "#64748b",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              IPv6 Default Gateway
                            </label>
                            <input
                              type="text"
                              value={ipv6Gateway}
                              onChange={(e) => setIpv6Gateway(e.target.value)}
                              placeholder="2001:db8::ffff"
                              style={{
                                width: "100%",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                border: "1px solid #cbd5e1",
                                fontSize: "8px",
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: "7px",
                          color: "#64748b",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        Pozice Portu
                      </label>
                      <select
                        value={iface.position || "left"}
                        onChange={(e) => {
                          const newInterfaces = [
                            ...selectedNode.data.interfaces,
                          ];
                          newInterfaces[idx] = {
                            ...newInterfaces[idx],
                            position: e.target.value as
                              | "left"
                              | "right"
                              | "top"
                              | "bottom",
                          };
                          updateNode(selectedNode.id, {
                            interfaces: newInterfaces,
                          });
                        }}
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                          fontSize: "8px",
                        }}
                      >
                        <option value="left">⬅️ Vlevo</option>
                        <option value="right">➡️ Vpravo</option>
                        <option value="top">⬆️ Nahoře</option>
                        <option value="bottom">⬇️ Dole</option>
                      </select>
                    </div>
                    <div
                      style={{ display: "flex", gap: "4px", marginTop: "3px" }}
                    >
                      <button
                        onClick={() => handleSaveInterface(idx)}
                        style={{
                          flex: 1,
                          padding: "4px",
                          background: "#10b981",
                          border: "none",
                          borderRadius: "4px",
                          color: "white",
                          fontSize: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        💾 Uložit
                      </button>
                      <button
                        onClick={() => setEditingInterface(null)}
                        style={{
                          flex: 1,
                          padding: "4px",
                          background: "#6b7280",
                          border: "none",
                          borderRadius: "4px",
                          color: "white",
                          fontSize: "8px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ✖️ Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {iface.ipAddress && (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "8px",
                          marginBottom: "2px",
                        }}
                      >
                        IPv4: {iface.ipAddress}/{iface.subnetMask}
                      </div>
                    )}
                    {iface.ipv6Address && (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "8px",
                          marginBottom: "2px",
                        }}
                      >
                        IPv6: {iface.ipv6Address}
                      </div>
                    )}
                    {iface.gateway && (
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "8px",
                          marginBottom: "2px",
                        }}
                      >
                        Gateway: {iface.gateway}
                      </div>
                    )}
                    {iface.trunkMode && (
                      <div
                        style={{
                          color: "#8b5cf6",
                          fontSize: "8px",
                          fontWeight: "600",
                          marginBottom: "2px",
                        }}
                      >
                        🔀 802.1Q Trunk
                      </div>
                    )}
                    {selectedNode.data.type === "switch" &&
                      iface.vlanId &&
                      !iface.trunkMode && (
                        <div
                          style={{
                            color: "#0ea5e9",
                            fontSize: "8px",
                            fontWeight: "600",
                          }}
                        >
                          VLAN {iface.vlanId} (Access)
                        </div>
                      )}
                    {iface.description && (
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "7px",
                          fontStyle: "italic",
                          marginTop: "2px",
                        }}
                      >
                        {iface.description}
                      </div>
                    )}
                    {!iface.ipAddress &&
                      !iface.ipv6Address &&
                      !iface.trunkMode &&
                      selectedNode.data.type !== "switch" && (
                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: "8px",
                            fontStyle: "italic",
                          }}
                        >
                          Nekonfigurováno
                        </div>
                      )}

                    {/* Sub-interfaces (pro routery s trunk porty) */}
                    {selectedNode.data.type === "router" &&
                      iface.subInterfaces &&
                      iface.subInterfaces.length > 0 && (
                        <div
                          style={{
                            marginTop: "6px",
                            paddingLeft: "8px",
                            borderLeft: "2px solid #8b5cf6",
                            background: "#f8f9ff",
                            padding: "4px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "7px",
                              fontWeight: "600",
                              color: "#8b5cf6",
                              marginBottom: "3px",
                            }}
                          >
                            Sub-interfaces:
                          </div>
                          {iface.subInterfaces.map((subIface, subIdx) => (
                            <div
                              key={subIdx}
                              style={{
                                fontSize: "7px",
                                color: "#475569",
                                marginBottom: "4px",
                                paddingLeft: "4px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontWeight: "600",
                                    color: "#0ea5e9",
                                  }}
                                >
                                  {subIface.name}
                                </span>{" "}
                                <span style={{ color: "#94a3b8" }}>
                                  (VLAN {subIface.vlanId})
                                </span>
                                {subIface.ipAddress && (
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: "7px",
                                    }}
                                  >
                                    → {subIface.ipAddress}/{subIface.subnetMask}
                                  </div>
                                )}
                                {subIface.description && (
                                  <div
                                    style={{
                                      color: "#94a3b8",
                                      fontSize: "6px",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {subIface.description}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleDeleteSubInterface(idx, subIdx)
                                }
                                style={{
                                  padding: "1px 3px",
                                  background: "#ef4444",
                                  border: "none",
                                  borderRadius: "2px",
                                  color: "white",
                                  fontSize: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* Router: Add Sub-Interface Button */}
                    {selectedNode.data.type === "router" && (
                      <div style={{ marginTop: "6px" }}>
                        {showAddSubInterface === idx ? (
                          <div
                            style={{
                              background: "#f0f9ff",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #0ea5e9",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "8px",
                                fontWeight: "600",
                                color: "#0ea5e9",
                                marginBottom: "6px",
                              }}
                            >
                              ➕ Přidat Sub-Interface
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <input
                                type="text"
                                placeholder={`${iface.name}.10`}
                                value={subInterfaceName}
                                onChange={(e) =>
                                  setSubInterfaceName(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="VLAN ID (10)"
                                value={subInterfaceVlan}
                                onChange={(e) =>
                                  setSubInterfaceVlan(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="IP Address"
                                value={subInterfaceIp}
                                onChange={(e) =>
                                  setSubInterfaceIp(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Subnet Mask"
                                value={subInterfaceMask}
                                onChange={(e) =>
                                  setSubInterfaceMask(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={subInterfaceDesc}
                                onChange={(e) =>
                                  setSubInterfaceDesc(e.target.value)
                                }
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: "4px",
                                  marginTop: "4px",
                                }}
                              >
                                <button
                                  onClick={() => handleAddSubInterface(idx)}
                                  style={{
                                    flex: 1,
                                    padding: "4px",
                                    background: "#0ea5e9",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    fontSize: "7px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                >
                                  ✓ Přidat
                                </button>
                                <button
                                  onClick={() => setShowAddSubInterface(null)}
                                  style={{
                                    flex: 1,
                                    padding: "4px",
                                    background: "#94a3b8",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    fontSize: "7px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                  }}
                                >
                                  ✖ Zrušit
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowAddSubInterface(idx);
                              setSubInterfaceName(`${iface.name}.`);
                            }}
                            style={{
                              width: "100%",
                              padding: "4px",
                              background: "#e0f2fe",
                              color: "#0369a1",
                              border: "1px dashed #0ea5e9",
                              borderRadius: "3px",
                              fontSize: "7px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            ➕ Sub-Interface
                          </button>
                        )}
                      </div>
                    )}

                    {/* Switch: Trunk/Access Mode Toggle */}
                    {selectedNode.data.type === "switch" && (
                      <div style={{ marginTop: "6px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            onClick={() => handleToggleTrunkMode(idx)}
                            style={{
                              flex: 1,
                              padding: "4px",
                              background: iface.trunkMode
                                ? "#8b5cf6"
                                : "#e2e8f0",
                              color: iface.trunkMode ? "white" : "#64748b",
                              border: "none",
                              borderRadius: "3px",
                              fontSize: "7px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            {iface.trunkMode
                              ? "🔀 Trunk Mode"
                              : "📌 Access Mode"}
                          </button>
                          {iface.trunkMode && (
                            <button
                              onClick={() => handleConfigureTrunk(idx)}
                              style={{
                                padding: "4px 6px",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                fontSize: "7px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              ⚙️
                            </button>
                          )}
                        </div>

                        {/* Trunk Configuration Panel */}
                        {configuringTrunk === idx && iface.trunkMode && (
                          <div
                            style={{
                              marginTop: "6px",
                              background: "#f5f3ff",
                              padding: "8px",
                              borderRadius: "4px",
                              border: "1px solid #8b5cf6",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "8px",
                                fontWeight: "600",
                                color: "#8b5cf6",
                                marginBottom: "6px",
                              }}
                            >
                              ⚙️ Trunk Port Configuration
                            </div>

                            <div style={{ marginBottom: "6px" }}>
                              <label
                                style={{
                                  fontSize: "7px",
                                  color: "#64748b",
                                  display: "block",
                                  marginBottom: "3px",
                                }}
                              >
                                Native VLAN (Untagged):
                              </label>
                              <input
                                type="text"
                                value={trunkNativeVlan}
                                onChange={(e) =>
                                  setTrunkNativeVlan(e.target.value)
                                }
                                placeholder="1"
                                style={{
                                  width: "100%",
                                  padding: "4px",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                }}
                              />
                            </div>

                            <div style={{ marginBottom: "6px" }}>
                              <label
                                style={{
                                  fontSize: "7px",
                                  color: "#64748b",
                                  display: "block",
                                  marginBottom: "3px",
                                }}
                              >
                                Allowed VLANs (Tagged):
                              </label>
                              <div
                                style={{
                                  maxHeight: "100px",
                                  overflowY: "auto",
                                  background: "white",
                                  padding: "4px",
                                  borderRadius: "3px",
                                  border: "1px solid #cbd5e1",
                                }}
                              >
                                {(
                                  selectedNode.data.vlans || [
                                    { id: 1, name: "default", ports: [] },
                                  ]
                                ).map((vlan) => (
                                  <label
                                    key={vlan.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      padding: "2px",
                                      fontSize: "7px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={trunkAllowedVlans.includes(
                                        vlan.id
                                      )}
                                      onChange={() =>
                                        handleToggleVlanInTrunk(vlan.id)
                                      }
                                      style={{ cursor: "pointer" }}
                                    />
                                    <span>
                                      VLAN {vlan.id} - {vlan.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleSaveTrunkConfig(idx)}
                                style={{
                                  flex: 1,
                                  padding: "4px",
                                  background: "#8b5cf6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                }}
                              >
                                ✓ Uložit
                              </button>
                              <button
                                onClick={() => setConfiguringTrunk(null)}
                                style={{
                                  flex: 1,
                                  padding: "4px",
                                  background: "#94a3b8",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "3px",
                                  fontSize: "7px",
                                  cursor: "pointer",
                                  fontWeight: "600",
                                }}
                              >
                                ✖ Zrušit
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Display allowed VLANs on trunk */}
                        {iface.trunkMode &&
                          iface.allowedVlans &&
                          iface.allowedVlans.length > 0 && (
                            <div
                              style={{
                                marginTop: "4px",
                                fontSize: "7px",
                                color: "#64748b",
                                background: "#f8fafc",
                                padding: "4px",
                                borderRadius: "3px",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "2px",
                                }}
                              >
                                Allowed VLANs: {iface.allowedVlans.join(", ")}
                              </div>
                              <div style={{ color: "#8b5cf6" }}>
                                Native VLAN: {iface.nativeVlan || 1}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Routing Table - pouze pro routery */}
      {selectedNode.data.type === "router" && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🗺️ ROUTING TABLE
            </h3>
            <button
              onClick={() => setShowAddRoute(!showAddRoute)}
              style={{
                padding: "3px 8px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "9px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {showAddRoute ? "✖️" : "➕ Add"}
            </button>
          </div>

          {showAddRoute && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="text"
                placeholder="Network (192.168.2.0)"
                value={routeNetwork}
                onChange={(e) => setRouteNetwork(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Mask (255.255.255.0)"
                value={routeMask}
                onChange={(e) => setRouteMask(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Next Hop (10.0.0.2)"
                value={routeNextHop}
                onChange={(e) => setRouteNextHop(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="number"
                placeholder="Metric"
                value={routeMetric}
                onChange={(e) => setRouteMetric(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <button
                onClick={handleAddRoute}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save Route
              </button>
            </div>
          )}

          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {(selectedNode.data.routingTable || []).length === 0 ? (
              <div
                style={{
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "9px",
                  fontStyle: "italic",
                }}
              >
                Žádné routy
              </div>
            ) : (
              (selectedNode.data.routingTable || []).map((route, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px",
                    background: "white",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "600",
                        color: "#1e293b",
                        fontFamily: "monospace",
                      }}
                    >
                      {route.network}/{route.mask}
                    </div>
                    <button
                      onClick={() => handleDeleteRoute(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "10px",
                        padding: "0",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  <div style={{ fontSize: "8px", color: "#64748b" }}>
                    via {route.nextHop}
                  </div>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {route.protocol} [metric: {route.metric || 1}]
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* IPv6 Routing Table - pouze pro routery */}
      {selectedNode.data.type === "router" && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🗺️ IPv6 ROUTING TABLE
            </h3>
            <button
              onClick={() => setShowAddIpv6Route(!showAddIpv6Route)}
              style={{
                padding: "3px 8px",
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "9px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {showAddIpv6Route ? "✖️" : "➕ Add Route"}
            </button>
          </div>

          {showAddIpv6Route && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="text"
                placeholder="IPv6 Network (2001:db8:10::)"
                value={ipv6RouteNetwork}
                onChange={(e) => setIpv6RouteNetwork(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Prefix Length (64)"
                value={ipv6RoutePrefixLength}
                onChange={(e) => setIpv6RoutePrefixLength(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Next Hop (2001:db8:ffff::2)"
                value={ipv6RouteNextHop}
                onChange={(e) => setIpv6RouteNextHop(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Metric (1)"
                value={ipv6RouteMetric}
                onChange={(e) => setIpv6RouteMetric(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <button
                onClick={handleAddIpv6Route}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save IPv6 Route
              </button>
            </div>
          )}

          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {(selectedNode.data.ipv6RoutingTable || []).length === 0 ? (
              <div
                style={{
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "9px",
                  fontStyle: "italic",
                }}
              >
                Žádné IPv6 routy
              </div>
            ) : (
              (selectedNode.data.ipv6RoutingTable || []).map((route, index) => (
                <div
                  key={index}
                  style={{
                    padding: "8px",
                    background: "white",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "600",
                        color: "#1e293b",
                        fontFamily: "monospace",
                      }}
                    >
                      {route.network}/{route.prefixLength}
                    </div>
                    <button
                      onClick={() => handleDeleteIpv6Route(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "10px",
                        padding: "0",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  <div style={{ fontSize: "8px", color: "#64748b" }}>
                    via {route.nextHop}
                  </div>
                  <div
                    style={{
                      fontSize: "7px",
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {route.protocol} [metric: {route.metric || 1}]
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DHCP Server - pro routery a servery */}
      {(selectedNode.data.type === "router" ||
        selectedNode.data.type === "server") && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🌐 DHCP SERVER
            </h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "9px",
                  color: "#64748b",
                  gap: "6px",
                }}
              >
                <span>{selectedNode.data.isDhcpServer ? "ON" : "OFF"}</span>
                <div
                  onClick={() => {
                    updateNode(selectedNode.id, {
                      isDhcpServer: !selectedNode.data.isDhcpServer,
                    });
                  }}
                  style={{
                    width: "36px",
                    height: "18px",
                    background: selectedNode.data.isDhcpServer
                      ? "#059669"
                      : "#cbd5e1",
                    borderRadius: "9px",
                    position: "relative",
                    transition: "background 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: selectedNode.data.isDhcpServer ? "20px" : "2px",
                      transition: "left 0.3s",
                    }}
                  />
                </div>
              </label>
              {selectedNode.data.isDhcpServer && (
                <button
                  onClick={() => setShowAddDhcp(!showAddDhcp)}
                  style={{
                    padding: "3px 8px",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {showAddDhcp ? "✖️" : "➕ Add Pool"}
                </button>
              )}
            </div>
          </div>

          {selectedNode.data.isDhcpServer && showAddDhcp && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="text"
                placeholder="Pool Name (LAN)"
                value={dhcpName}
                onChange={(e) => setDhcpName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Network (192.168.1.0)"
                value={dhcpNetwork}
                onChange={(e) => setDhcpNetwork(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Mask (255.255.255.0)"
                value={dhcpMask}
                onChange={(e) => setDhcpMask(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Default Router (optional)"
                value={dhcpRouter}
                onChange={(e) => setDhcpRouter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="DNS Server (optional)"
                value={dhcpDns}
                onChange={(e) => setDhcpDns(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <button
                onClick={handleAddDhcpPool}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save Pool
              </button>
            </div>
          )}

          {selectedNode.data.isDhcpServer && (
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {(selectedNode.data.dhcpPools || []).length === 0 ? (
                <div
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "9px",
                    fontStyle: "italic",
                  }}
                >
                  Žádné DHCP pooly
                </div>
              ) : (
                (selectedNode.data.dhcpPools || []).map((pool, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {pool.name}
                      </div>
                      <button
                        onClick={() => handleDeleteDhcpPool(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "10px",
                          padding: "0",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#64748b",
                        fontFamily: "monospace",
                      }}
                    >
                      {pool.network}/{pool.mask}
                    </div>
                    {pool.defaultRouter && (
                      <div
                        style={{
                          fontSize: "7px",
                          color: "#94a3b8",
                          marginTop: "2px",
                        }}
                      >
                        Gateway: {pool.defaultRouter}
                      </div>
                    )}
                    {pool.dnsServer && (
                      <div style={{ fontSize: "7px", color: "#94a3b8" }}>
                        DNS: {pool.dnsServer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* DHCPv6 Server - pro routery a servery */}
      {(selectedNode.data.type === "router" ||
        selectedNode.data.type === "server") && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🌐 DHCPv6 SERVER
            </h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "9px",
                  color: "#64748b",
                  gap: "6px",
                }}
              >
                <span>{selectedNode.data.isDhcpv6Server ? "ON" : "OFF"}</span>
                <div
                  onClick={() => {
                    updateNode(selectedNode.id, {
                      isDhcpv6Server: !selectedNode.data.isDhcpv6Server,
                    });
                  }}
                  style={{
                    width: "36px",
                    height: "18px",
                    background: selectedNode.data.isDhcpv6Server
                      ? "#0ea5e9"
                      : "#cbd5e1",
                    borderRadius: "9px",
                    position: "relative",
                    transition: "background 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: selectedNode.data.isDhcpv6Server ? "20px" : "2px",
                      transition: "left 0.3s",
                    }}
                  />
                </div>
              </label>
              {selectedNode.data.isDhcpv6Server && (
                <button
                  onClick={() => setShowAddDhcpv6(!showAddDhcpv6)}
                  style={{
                    padding: "3px 8px",
                    background: "#0ea5e9",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {showAddDhcpv6 ? "✖️" : "➕ Add Pool"}
                </button>
              )}
            </div>
          </div>

          {selectedNode.data.isDhcpv6Server && showAddDhcpv6 && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="text"
                placeholder="Pool Name (VLAN10_IPv6)"
                value={dhcpv6Name}
                onChange={(e) => setDhcpv6Name(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="IPv6 Prefix (2001:db8:10::)"
                value={dhcpv6Prefix}
                onChange={(e) => setDhcpv6Prefix(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="Prefix Length (64)"
                value={dhcpv6PrefixLength}
                onChange={(e) => setDhcpv6PrefixLength(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="DNS Server (optional, 2001:db8::53)"
                value={dhcpv6DnsServer}
                onChange={(e) => setDhcpv6DnsServer(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <button
                onClick={handleAddDhcpv6Pool}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save DHCPv6 Pool
              </button>
            </div>
          )}

          {selectedNode.data.isDhcpv6Server && (
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {(selectedNode.data.dhcpv6Pools || []).length === 0 ? (
                <div
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "9px",
                    fontStyle: "italic",
                  }}
                >
                  Žádné DHCPv6 pooly
                </div>
              ) : (
                (selectedNode.data.dhcpv6Pools || []).map((pool, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <div style={{ fontSize: "9px", fontWeight: "600" }}>
                        {pool.name}
                      </div>
                      <button
                        onClick={() => handleDeleteDhcpv6Pool(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "9px",
                          padding: "0 4px",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div style={{ fontSize: "8px", color: "#64748b" }}>
                      Prefix: {pool.prefix}/{pool.prefixLength}
                    </div>
                    {pool.dnsServer && (
                      <div style={{ fontSize: "7px", color: "#94a3b8" }}>
                        DNS: {pool.dnsServer}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* DNS Server - pro routery a servery */}
      {(selectedNode.data.type === "router" ||
        selectedNode.data.type === "server") && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🔤 DNS SERVER
            </h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: "9px",
                  color: "#64748b",
                  gap: "6px",
                }}
              >
                <span>{selectedNode.data.isDnsServer ? "ON" : "OFF"}</span>
                <div
                  onClick={() => {
                    updateNode(selectedNode.id, {
                      isDnsServer: !selectedNode.data.isDnsServer,
                    });
                  }}
                  style={{
                    width: "36px",
                    height: "18px",
                    background: selectedNode.data.isDnsServer
                      ? "#7c3aed"
                      : "#cbd5e1",
                    borderRadius: "9px",
                    position: "relative",
                    transition: "background 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: selectedNode.data.isDnsServer ? "20px" : "2px",
                      transition: "left 0.3s",
                    }}
                  />
                </div>
              </label>
              {selectedNode.data.isDnsServer && (
                <button
                  onClick={() => setShowAddDns(!showAddDns)}
                  style={{
                    padding: "3px 8px",
                    background: "#7c3aed",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {showAddDns ? "✖️" : "➕ Add Record"}
                </button>
              )}
            </div>
          </div>

          {selectedNode.data.isDnsServer && showAddDns && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="text"
                placeholder="Hostname (pc1.local)"
                value={dnsHostname}
                onChange={(e) => setDnsHostname(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="IP Address"
                value={dnsIpAddress}
                onChange={(e) => setDnsIpAddress(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <select
                value={dnsType}
                onChange={(e) =>
                  setDnsType(e.target.value as "A" | "AAAA" | "CNAME")
                }
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              >
                <option value="A">A (IPv4)</option>
                <option value="AAAA">AAAA (IPv6)</option>
                <option value="CNAME">CNAME (Alias)</option>
              </select>
              <button
                onClick={handleAddDnsRecord}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save Record
              </button>
            </div>
          )}

          {selectedNode.data.isDnsServer && (
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {(selectedNode.data.dnsRecords || []).length === 0 ? (
                <div
                  style={{
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: "9px",
                    fontStyle: "italic",
                  }}
                >
                  Žádné DNS záznamy
                </div>
              ) : (
                (selectedNode.data.dnsRecords || []).map((record, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px",
                      background: "white",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        {record.hostname}
                      </div>
                      <button
                        onClick={() => handleDeleteDnsRecord(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontSize: "10px",
                          padding: "0",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "8px",
                        color: "#64748b",
                        fontFamily: "monospace",
                      }}
                    >
                      {record.ipAddress}
                    </div>
                    <div
                      style={{
                        fontSize: "7px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      Type: {record.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* VLAN Configuration - only for switches */}
      {selectedNode.data.type === "switch" && (
        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#1e293b",
                letterSpacing: "0.3px",
              }}
            >
              🔀 VLAN CONFIGURATION
            </h3>
            <button
              onClick={() => setShowAddVlan(!showAddVlan)}
              style={{
                padding: "3px 8px",
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "9px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {showAddVlan ? "✖️" : "➕ Add VLAN"}
            </button>
          </div>

          {showAddVlan && (
            <div
              style={{
                background: "#f1f5f9",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "8px",
                border: "1px solid #cbd5e1",
              }}
            >
              <input
                type="number"
                placeholder="VLAN ID (2-4094)"
                value={vlanId}
                onChange={(e) => setVlanId(e.target.value)}
                min="1"
                max="4094"
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "6px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <input
                type="text"
                placeholder="VLAN Name (optional)"
                value={vlanName}
                onChange={(e) => setVlanName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  marginBottom: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px",
                  fontSize: "9px",
                }}
              />
              <button
                onClick={handleAddVlan}
                style={{
                  width: "100%",
                  padding: "6px",
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                💾 Save VLAN
              </button>
            </div>
          )}

          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            {(
              selectedNode.data.vlans || [{ id: 1, name: "default", ports: [] }]
            ).map((vlan) => (
              <div
                key={vlan.id}
                style={{
                  padding: "8px",
                  background: "white",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "4px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        fontWeight: "600",
                        color: "#1e293b",
                      }}
                    >
                      VLAN {vlan.id} - {vlan.name}
                    </div>
                    <div
                      style={{
                        fontSize: "7px",
                        color: "#94a3b8",
                        marginTop: "2px",
                      }}
                    >
                      Ports:{" "}
                      {vlan.ports.length > 0 ? vlan.ports.join(", ") : "None"}
                    </div>
                  </div>
                  {vlan.id !== 1 && (
                    <button
                      onClick={() => handleDeleteVlan(vlan.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: "10px",
                        padding: "0",
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Port Configuration */}
          <div
            style={{
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h4
              style={{
                fontSize: "10px",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              🔌 Port Assignment
            </h4>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {selectedNode.data.interfaces.map((iface) => (
                <div
                  key={iface.name}
                  style={{
                    padding: "6px",
                    background:
                      editingPort === iface.name ? "#dbeafe" : "white",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  {editingPort === iface.name ? (
                    <div>
                      <div
                        style={{
                          fontSize: "8px",
                          fontWeight: "600",
                          marginBottom: "4px",
                          color: "#1e293b",
                        }}
                      >
                        {iface.name}
                      </div>
                      <select
                        value={portVlan}
                        onChange={(e) => setPortVlan(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "4px",
                          marginBottom: "4px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "3px",
                          fontSize: "8px",
                        }}
                      >
                        <option value="1">VLAN 1 (default)</option>
                        {(selectedNode.data.vlans || [])
                          .filter((v) => v.id !== 1)
                          .map((vlan) => (
                            <option key={vlan.id} value={vlan.id}>
                              VLAN {vlan.id} - {vlan.name}
                            </option>
                          ))}
                      </select>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={handleSavePortConfig}
                          style={{
                            flex: 1,
                            padding: "4px",
                            background: "#0ea5e9",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "7px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingPort(null)}
                          style={{
                            flex: 1,
                            padding: "4px",
                            background: "#94a3b8",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            fontSize: "7px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          ✖ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "8px",
                            fontWeight: "600",
                            color: "#1e293b",
                          }}
                        >
                          {iface.name}
                        </div>
                        <div style={{ fontSize: "7px", color: "#64748b" }}>
                          VLAN {iface.vlanId || 1}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditPort(iface.name)}
                        style={{
                          padding: "2px 6px",
                          background: "#0ea5e9",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          fontSize: "7px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        ⚙️ Configure
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "7px",
          marginTop: "14px",
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "8px",
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: "600",
            boxShadow: "0 3px 4px rgba(59, 130, 246, 0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1.5px)";
            e.currentTarget.style.boxShadow =
              "0 4px 8px rgba(59, 130, 246, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 3px 4px rgba(59, 130, 246, 0.3)";
          }}
        >
          ⚙️ Konfigurovat
        </button>

        <button
          onClick={() => setShowCLI(true)}
          style={{
            width: "100%",
            padding: "8px",
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            border: "none",
            borderRadius: "6px",
            color: "white",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: "600",
            boxShadow: "0 3px 4px rgba(5, 150, 105, 0.3)",
            transition: "all 0.2s",
            marginBottom: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1.5px)";
            e.currentTarget.style.boxShadow =
              "0 4px 8px rgba(5, 150, 105, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 3px 4px rgba(5, 150, 105, 0.3)";
          }}
        >
          📟 Otevřít CLI
        </button>

        <button
          onClick={handleDelete}
          style={{
            width: "100%",
            padding: "8px",
            background: "white",
            color: "#dc2626",
            border: "1.5px solid #fecaca",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fef2f2";
            e.currentTarget.style.borderColor = "#dc2626";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#fecaca";
          }}
        >
          🗑️ Smazat Zařízení
        </button>
      </div>

      {showCLI && (
        <CLITerminal device={selectedNode} onClose={() => setShowCLI(false)} />
      )}
    </div>
  );
}
