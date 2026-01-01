export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error:
          'Email service is not configured. Set RESEND_API_KEY in Vercel environment variables.'
      });
    }

    const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const to = process.env.CONTACT_TO || 'bymoliart@gmail.com';

    const payload = {
      from,
      to: [to],
      subject: `New message from ${name} (byMoliart website)`,
      reply_to: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(502).json({ ok: false, error: data?.message || 'Failed to send' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Unexpected server error' });
  }
}
