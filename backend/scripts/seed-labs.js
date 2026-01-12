const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const mongoose = require('mongoose');

function loadConfig() {
  const cfgPath = path.join(__dirname, '..', 'config.json');
  if (!fs.existsSync(cfgPath)) throw new Error('backend/config.json not found');
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

async function main() {
  const cfg = loadConfig();
  const mssqlCfg = cfg.mssql;
  const mongoUri = cfg.mongo.uri || process.env.MONGO_URI;

  const pool = await new sql.ConnectionPool({
    server: mssqlCfg.server,
    port: mssqlCfg.port,
    user: mssqlCfg.user,
    password: mssqlCfg.password,
    database: mssqlCfg.database,
    options: {
      encrypt: mssqlCfg.encrypt,
      trustServerCertificate: mssqlCfg.trustServerCertificate,
    },
  }).connect();

  console.log('Connected to MSSQL');

  // get device model ids
  const resModels = await pool
    .request()
    .query(
      'SELECT Id, DeviceType, ModelName FROM dbo.DeviceModel WHERE IsDeprecated = 0',
    );
  const models = resModels.recordset;
  console.log(
    'Available device models:',
    models.map((m) => `${m.Id}:${m.ModelName}:${m.DeviceType}`).join(', '),
  );

  // helper to insert lab and allowed models
  async function createLabInMssql(name, ownerId, isPublic, allowedModels) {
    const tx = pool.transaction();
    await tx.begin();
    try {
      const inserted = await tx
        .request()
        .input('name', name)
        .input('description', name + ' description')
        .input('isPublic', isPublic)
        .input('ownerMongoUserId', ownerId).query(`
          INSERT INTO dbo.Lab (Name, Description, IsPublic, Status, MongoTopologyId, OwnerMongoUserId)
          OUTPUT inserted.Id
          VALUES (@name, @description, @isPublic, 'pending', NULL, @ownerMongoUserId)
        `);

      const labId = inserted.recordset[0].Id;
      for (const item of allowedModels) {
        await tx
          .request()
          .input('labId', labId)
          .input('deviceModelId', item.deviceModelId)
          .input('quantity', item.quantity).query(`
            INSERT INTO dbo.LabAllowedModel (LabId, DeviceModelId, Quantity)
            VALUES (@labId, @deviceModelId, @quantity)
          `);
      }
      await tx.commit();
      return labId;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  // connect to Mongo
  await mongoose.connect(mongoUri, { dbName: 'network-simulator' });
  console.log('Connected to MongoDB');

  const Topology = mongoose.model(
    'Topology',
    new mongoose.Schema(
      {
        name: { type: String, required: true },
        description: String,
        userId: { type: String, required: true },
        isPublic: { type: Boolean, default: false },
      },
      { timestamps: true },
    ),
  );

  const Device = mongoose.model(
    'Device',
    new mongoose.Schema(
      {
        name: String,
        type: String,
        positionX: Number,
        positionY: Number,
        interfaces: { type: Array, default: [] },
        configuration: { type: Object, default: {} },
        topologyId: String,
      },
      { timestamps: true },
    ),
  );

  // Define sample labs
  const samples = [
    {
      name: 'Routing Lab',
      owner: 'seed-user-1',
      isPublic: true,
      allowed: [
        { deviceType: 'router', quantity: 2 },
        { deviceType: 'switch', quantity: 1 },
      ],
      devices: [
        {
          name: 'R1',
          type: 'router',
          x: 100,
          y: 100,
          interfaces: [
            {
              name: 'G0/0',
              ipAddress: '10.0.1.1',
              subnetMask: '255.255.255.0',
            },
          ],
        },
        {
          name: 'R2',
          type: 'router',
          x: 300,
          y: 100,
          interfaces: [
            {
              name: 'G0/0',
              ipAddress: '10.0.2.1',
              subnetMask: '255.255.255.0',
            },
          ],
        },
        { name: 'SW1', type: 'switch', x: 200, y: 250 },
      ],
    },
    {
      name: 'VLAN Lab',
      owner: 'seed-user-2',
      isPublic: false,
      allowed: [
        { deviceType: 'switch', quantity: 2 },
        { deviceType: 'pc', quantity: 4 },
      ],
      devices: [
        { name: 'SW-A', type: 'switch', x: 150, y: 120 },
        { name: 'SW-B', type: 'switch', x: 350, y: 120 },
        { name: 'PC1', type: 'pc', x: 120, y: 300 },
        { name: 'PC2', type: 'pc', x: 180, y: 300 },
      ],
    },
    {
      name: 'Server/Service Lab',
      owner: 'seed-user-3',
      isPublic: false,
      allowed: [
        { deviceType: 'server', quantity: 2 },
        { deviceType: 'pc', quantity: 1 },
      ],
      devices: [
        {
          name: 'DB-Server',
          type: 'server',
          x: 200,
          y: 150,
          interfaces: [{ name: 'eth0', ipAddress: '192.168.10.10' }],
        },
        {
          name: 'Web-Server',
          type: 'server',
          x: 400,
          y: 150,
          interfaces: [{ name: 'eth0', ipAddress: '192.168.10.11' }],
        },
        { name: 'Client-PC', type: 'pc', x: 300, y: 300 },
      ],
    },
  ];

  const created = [];
  for (const s of samples) {
    // map allowed device types to deviceModelIds (pick first matching model)
    const allowedModels = s.allowed.map((a) => {
      const m =
        models.find((md) => md.DeviceType === a.deviceType) || models[0];
      return { deviceModelId: m.Id, quantity: a.quantity };
    });

    const labId = await createLabInMssql(
      s.name,
      s.owner,
      s.isPublic,
      allowedModels,
    );
    console.log(`Created MSSQL Lab ${s.name} => Id ${labId}`);

    const topo = await Topology.create({
      name: s.name,
      description: s.name + ' topology',
      userId: s.owner,
      isPublic: s.isPublic,
    });
    const topoId = topo._id.toString();

    // insert devices
    for (const d of s.devices) {
      await Device.create({
        name: d.name,
        type: d.type,
        positionX: d.x || 0,
        positionY: d.y || 0,
        interfaces: d.interfaces || [],
        configuration: d.configuration || {},
        topologyId: topoId,
      });
    }

    // update Lab with mongo topology id
    await pool
      .request()
      .input('labId', labId)
      .input('ownerMongoUserId', s.owner)
      .input('mongoTopologyId', topoId).query(`
      UPDATE dbo.Lab
      SET MongoTopologyId = @mongoTopologyId, Status = 'ready'
      WHERE Id = @labId AND OwnerMongoUserId = @ownerMongoUserId
    `);

    console.log(`Attached Mongo topology ${topoId} to lab ${labId}`);
    created.push({ labId, topoId, owner: s.owner });
  }

  console.log('Done. Created labs:', created);
  await pool.close();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
