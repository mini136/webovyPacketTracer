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

  // Names of the seeded labs to make public
  const labNames = ['Routing Lab', 'VLAN Lab', 'Server/Service Lab'];

  // Update MSSQL labs
  const namesParam = labNames.map((_, i) => `@name${i}`).join(', ');
  const request = pool.request();
  labNames.forEach((n, i) => request.input(`name${i}`, n));

  const updateQuery = `
    UPDATE dbo.Lab
    SET IsPublic = 1
    WHERE Name IN (${namesParam})
  `;

  const res = await request.query(updateQuery);
  console.log('MSSQL update result:', res.rowsAffected);

  // Update Mongo topologies with matching names
  await mongoose.connect(mongoUri, { dbName: 'network-simulator' });
  console.log('Connected to MongoDB');

  const Topology = mongoose.model(
    'Topology',
    new mongoose.Schema(
      { name: String, isPublic: Boolean },
      { timestamps: true },
    ),
  );

  const mongoRes = await Topology.updateMany(
    { name: { $in: labNames } },
    { $set: { isPublic: true } },
  );
  console.log(
    'Mongo update result:',
    mongoRes.modifiedCount || mongoRes.nModified || mongoRes,
  );

  await pool.close();
  await mongoose.disconnect();
  console.log('Done. Marked sample labs as public.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
