// DEPRECATED: Use users-new.js instead
// This file redirects to the new endpoint

export default async function handler(req, res) {
  return res.status(410).json({ 
    ok: false, 
    error: 'This endpoint is deprecated. Use /api/admin/users-new instead.',
    redirect: '/api/admin/users-new'
  });
}