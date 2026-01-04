import { useEffect, useMemo, useState } from "react";
import { labsApi, deviceApi, connectionApi } from "../api/api";
import { useNetworkStore } from "../store/networkStore";

type LabSummary = {
  LabId: string;
  Name: string;
  IsPublic: boolean;
  Status: string;
  MongoTopologyId: string | null;
  CreatedAt: string;
  AllowedDeviceTotal: number;
  RunCount: number;
  AvgScore: number | null;
  LastRunAt: string | null;
};

interface LabsPanelProps {
  onClose: () => void;
}

export default function LabsPanel({ onClose }: LabsPanelProps) {
  const { setNodes, setEdges, setTopologyId } = useNetworkStore();
  const [labs, setLabs] = useState<LabSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedLabs = useMemo(() => {
    return [...labs].sort((a, b) => (a.CreatedAt < b.CreatedAt ? 1 : -1));
  }, [labs]);

  const loadLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await labsApi.list();
      setLabs(res.data);
    } catch (e) {
      setError("Nepodařilo se načíst laboratoře.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLabs();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Zadej název laboratoře.");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await labsApi.create({ name: name.trim(), isPublic });
      setName("");
      setIsPublic(false);
      await loadLabs();
    } catch (e) {
      setError("Nepodařilo se vytvořit laboratoř.");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleAttach = async (labId: string) => {
    setError(null);
    try {
      await labsApi.attachTopology(labId);
      await loadLabs();
    } catch (e) {
      setError("Nepodařilo se připojit topologii.");
      console.error(e);
    }
  };

  const handleOpenInEditor = async (mongoTopologyId: string) => {
    setError(null);
    try {
      setTopologyId(mongoTopologyId);

      const [devicesResponse, connectionsResponse] = await Promise.all([
        deviceApi.getByTopology(mongoTopologyId),
        connectionApi.getByTopology(mongoTopologyId),
      ]);

      const devices = devicesResponse.data;
      const loadedNodes = devices.map(
        (device: {
          _id: string;
          name: string;
          type: string;
          positionX: number;
          positionY: number;
          interfaces: unknown[];
        }) => ({
          id: device._id,
          type: "device",
          position: { x: device.positionX, y: device.positionY },
          data: {
            label: device.name,
            type: device.type,
            interfaces: device.interfaces || [],
          },
        })
      );

      const connections = connectionsResponse.data;
      const loadedEdges = connections.map(
        (conn: {
          _id: string;
          sourceDeviceId: string;
          targetDeviceId: string;
        }) => ({
          id: conn._id,
          source: conn.sourceDeviceId,
          target: conn.targetDeviceId,
          type: "default",
          animated: true,
        })
      );

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      onClose();
    } catch (e) {
      setError("Nepodařilo se otevřít laboratoř v editoru.");
      console.error(e);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        right: 20,
        width: 360,
        maxHeight: "80vh",
        overflow: "auto",
        background: "rgba(15, 23, 42, 0.98)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 8,
        padding: 14,
        color: "white",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 12 }}>
          Laboratoře / Projekty
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Název"
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: 11,
          }}
        />
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid rgba(59, 130, 246, 0.35)",
            background: "rgba(59, 130, 246, 0.15)",
            color: "#93c5fd",
            fontSize: 11,
            cursor: creating ? "not-allowed" : "pointer",
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? "⏳" : "＋"}
        </button>
      </div>

      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginTop: 8,
          fontSize: 11,
        }}
      >
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        Veřejné
      </label>

      {error && (
        <div style={{ marginTop: 10, color: "#fca5a5", fontSize: 11 }}>
          {error}
        </div>
      )}

      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 11, color: "#cbd5e1" }}>Seznam</div>
        <button
          onClick={() => void loadLabs()}
          disabled={loading}
          style={{
            padding: "4px 8px",
            background: "rgba(148,163,184,0.12)",
            border: "1px solid rgba(148,163,184,0.2)",
            borderRadius: 6,
            color: "#cbd5e1",
            fontSize: 10,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "⏳" : "↻"}
        </button>
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {sortedLabs.length === 0 && !loading && (
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Zatím žádné laboratoře.
          </div>
        )}

        {sortedLabs.map((lab) => (
          <div
            key={lab.LabId}
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid rgba(148,163,184,0.18)",
              background: "rgba(2, 6, 23, 0.55)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{lab.Name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>
                  Stav: {lab.Status} · Zařízení: {lab.AllowedDeviceTotal} ·
                  Běhy: {lab.RunCount}
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: lab.IsPublic ? "#86efac" : "#cbd5e1",
                }}
              >
                {lab.IsPublic ? "Public" : "Private"}
              </div>
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              {lab.MongoTopologyId ? (
                <button
                  onClick={() => void handleOpenInEditor(lab.MongoTopologyId!)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    border: "none",
                    borderRadius: 6,
                    color: "white",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Otevřít v editoru
                </button>
              ) : (
                <button
                  onClick={() => void handleAttach(lab.LabId)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    background: "rgba(251, 191, 36, 0.18)",
                    border: "1px solid rgba(251, 191, 36, 0.25)",
                    borderRadius: 6,
                    color: "#fbbf24",
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Připojit topologii
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
