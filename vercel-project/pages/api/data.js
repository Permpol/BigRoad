import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  // middleware already verified JWT

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir))
    return res.status(404).json({ error: 'Data directory not found' });

  // Auto-scan: read ALL .csv files in data/ folder
  const csvFiles = fs.readdirSync(dataDir)
    .filter(f => f.toLowerCase().endsWith('.csv'))
    .sort(); // alphabetical = chronological if named by date

  if (csvFiles.length === 0)
    return res.status(404).json({ error: 'No CSV files found in data/' });

  const ticks = [];

  for (const file of csvFiles) {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const lines = raw.split('\n').slice(1); // skip header per file

    for (const line of lines) {
      const p = line.trim().split(',');
      if (p.length < 2) continue;
      const price = parseFloat(p[1]);
      if (isNaN(price)) continue;
      ticks.push({ t: p[0].trim(), p: price });
    }
  }

  // Anti-download headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Content-Disposition', 'inline');

  return res.status(200).json({
    files: csvFiles,
    count: ticks.length,
    ticks,
  });
}
