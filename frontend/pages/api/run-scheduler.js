const runScheduler = require('../../scheduler');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    await runScheduler();
    res.status(200).json({ ok: true, message: 'Scheduler executed successfully' });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
}