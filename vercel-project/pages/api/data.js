import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  // middleware already verified JWT

  const csvPath = path.join(process.cwd(), 'data', 'data.csv');
  if (!fs.existsSync(csvPath))
    return res.status(404).json({ error: 'Data file not found' });

  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').slice(1); // skip header
  const ticks = [];

  for (const line of lines) {
    const p = line.trim().split(',');
    if (p.length < 2) continue;
    const price = parseFloat(p[1]);
    if (isNaN(price)) continue;
    ticks.push({ t: p[0].trim(), p: price });
  }

  // Anti-download headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Content-Disposition', 'inline');

  return res.status(200).json({ ticks });
}
