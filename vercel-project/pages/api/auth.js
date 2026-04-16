import { signToken } from '../../lib/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  if (password !== correctPassword) {
    return res.status(401).json({ error: 'Wrong password' });
  }

  const token = await signToken({ role: 'user', iat: Date.now() });

  // Set httpOnly cookie so middleware can read it
  res.setHeader('Set-Cookie', [
    `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ]);

  return res.status(200).json({ ok: true });
}
