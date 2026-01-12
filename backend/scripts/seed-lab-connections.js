const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadConfig() {
  const cfgPath = path.join(__dirname, '..', 'config.json');
  if (!fs.existsSync(cfgPath)) throw new Error('backend/config.json not found');
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

async function main() {
  const cfg = loadConfig();
  const mongoUri = cfg.mongo.uri || process.env.MONGO_URI;

  await mongoose.connect(mongoUri, { dbName: 'network-simulator' });
  console.log('Connected to MongoDB');

  const Device = mongoose.model(
    'Device',
    new mongoose.Schema({}, { strict: false, timestamps: true }),
  );

  const Connection = mongoose.model(
    'Connection',
    new mongoose.Schema({}, { strict: false, timestamps: true }),
  );

  const Topology = mongoose.model(
    'Topology',
    new mongoose.Schema({}, { strict: false, timestamps: true }),
  );

  const labNames = ['Routing Lab', 'VLAN Lab', 'Server/Service Lab'];

  for (const name of labNames) {
    const topo = await Topology.findOne({ name }).lean();
    if (!topo) {
      console.log(`Topology not found: ${name}`);
      continue;
    }

    const topoId = topo._id.toString();
    console.log(`Processing topology ${name} (${topoId})`);

    const devices = await Device.find({ topologyId: topoId }).lean();
    const byName = {};
    for (const d of devices) byName[d.name] = d;

    // Helper to ensure device has interfaces
    async function ensureInterfaces(deviceName, ifaceDefs) {
      const d = byName[deviceName];
      if (!d) return null;
      const cur = d.interfaces || [];
      const newIfaces = [...cur];
      for (const def of ifaceDefs) {
        if (!newIfaces.find((i) => i.name === def.name)) newIfaces.push(def);
      }
      await Device.updateOne(
        { _id: d._id },
        { $set: { interfaces: newIfaces } },
      );
      return (await Device.findById(d._id)).toObject();
    }

    // Routing Lab
    if (name === 'Routing Lab') {
      const r1 = await ensureInterfaces('R1', [
        {
          name: 'G0/0',
          ipAddress: '10.0.1.1',
          subnetMask: '255.255.255.0',
          status: 'up',
        },
      ]);
      const r2 = await ensureInterfaces('R2', [
        {
          name: 'G0/0',
          ipAddress: '10.0.2.1',
          subnetMask: '255.255.255.0',
          status: 'up',
        },
      ]);
      const sw = await ensureInterfaces('SW1', [
        { name: 'port1', status: 'up' },
        { name: 'port2', status: 'up' },
      ]);

      if (r1 && sw) {
        await Connection.create({
          sourceDeviceId: r1._id.toString(),
          sourceInterface: 'G0/0',
          targetDeviceId: sw._id.toString(),
          targetInterface: 'port1',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
      if (r2 && sw) {
        await Connection.create({
          sourceDeviceId: r2._id.toString(),
          sourceInterface: 'G0/0',
          targetDeviceId: sw._id.toString(),
          targetInterface: 'port2',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }

      // add basic router config
      if (r1)
        await Device.updateOne(
          { _id: r1._id },
          {
            $set: {
              configuration: {
                runningConfig: `interface G0/0\n ip address ${r1.interfaces[0].ipAddress} ${r1.interfaces[0].subnetMask}\n no shutdown`,
              },
            },
          },
        );
      if (r2)
        await Device.updateOne(
          { _id: r2._id },
          {
            $set: {
              configuration: {
                runningConfig: `interface G0/0\n ip address ${r2.interfaces[0].ipAddress} ${r2.interfaces[0].subnetMask}\n no shutdown`,
              },
            },
          },
        );
    }

    // VLAN Lab
    if (name === 'VLAN Lab') {
      await ensureInterfaces('SW-A', [
        { name: 'port1', status: 'up' },
        { name: 'port48', status: 'up' },
      ]);
      await ensureInterfaces('SW-B', [
        { name: 'port1', status: 'up' },
        { name: 'port48', status: 'up' },
      ]);
      await ensureInterfaces('PC1', [
        { name: 'eth0', status: 'up', ipAddress: '192.168.1.10' },
      ]);
      await ensureInterfaces('PC2', [
        { name: 'eth0', status: 'up', ipAddress: '192.168.1.11' },
      ]);

      const a = byName['SW-A'];
      const b = byName['SW-B'];
      const pc1 = byName['PC1'];
      const pc2 = byName['PC2'];

      if (pc1 && a) {
        await Connection.create({
          sourceDeviceId: pc1._id.toString(),
          sourceInterface: 'eth0',
          targetDeviceId: a._id.toString(),
          targetInterface: 'port1',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
      if (pc2 && b) {
        await Connection.create({
          sourceDeviceId: pc2._id.toString(),
          sourceInterface: 'eth0',
          targetDeviceId: b._id.toString(),
          targetInterface: 'port1',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
      if (a && b) {
        await Connection.create({
          sourceDeviceId: a._id.toString(),
          sourceInterface: 'port48',
          targetDeviceId: b._id.toString(),
          targetInterface: 'port48',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
    }

    // Server/Service Lab
    if (name === 'Server/Service Lab') {
      await ensureInterfaces('DB-Server', [
        { name: 'eth0', status: 'up', ipAddress: '192.168.10.10' },
      ]);
      await ensureInterfaces('Web-Server', [
        { name: 'eth0', status: 'up', ipAddress: '192.168.10.11' },
        { name: 'eth1', status: 'up' },
      ]);
      await ensureInterfaces('Client-PC', [
        { name: 'eth0', status: 'up', ipAddress: '192.168.10.100' },
      ]);

      const db = byName['DB-Server'];
      const web = byName['Web-Server'];
      const client = byName['Client-PC'];

      if (db && web) {
        await Connection.create({
          sourceDeviceId: db._id.toString(),
          sourceInterface: 'eth0',
          targetDeviceId: web._id.toString(),
          targetInterface: 'eth0',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
      if (client && web) {
        await Connection.create({
          sourceDeviceId: client._id.toString(),
          sourceInterface: 'eth0',
          targetDeviceId: web._id.toString(),
          targetInterface: 'eth1',
          cableType: 'straight',
          status: 'up',
          topologyId: topoId,
        });
      }
    }
  }

  console.log('Finished seeding connections/configs.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
