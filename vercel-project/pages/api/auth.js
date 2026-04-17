import { signToken } from '../../lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  const correct = process.env.APP_PASSWORD;

  if (!correct)
    return res.status(500).json({ error: 'Server not configured' });

  if (password !== correct)
    return res.status(401).json({ error: 'Wrong password' });

  const token = await signToken({ role: 'user' });

  res.setHeader('Set-Cookie',
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400` +
    (process.env.NODE_ENV === 'production' ? '; Secure' : '')
  );

  return res.status(200).json({ ok: true });
}
