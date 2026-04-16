import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Middleware already verified JWT token

  const csvPath = path.join(process.cwd(), 'data', 'data.csv');

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({ error: 'Data file not found' });
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Anti-download: return JSON parsed data, not raw CSV
  const lines = csvContent.split('\n').slice(1); // skip header
  const ticks = [];

  for (const line of lines) {
    const parts = line.trim().split(',');
    if (parts.length < 2) continue;
    const ts = parts[0].trim();
    const price = parseFloat(parts[1]);
    if (isNaN(price)) continue;
    ticks.push({ t: ts, p: price });
  }

  // Set no-cache, no-store headers to prevent caching/saving
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Content-Disposition', 'inline'); // prevent download prompt

  return res.status(200).json({ ticks });
}
