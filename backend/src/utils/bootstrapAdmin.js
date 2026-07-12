const Admin = require('../models/Admin');

async function bootstrapAdmin() {
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) return;

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[bootstrap-admin] No admin exists and ADMIN_EMAIL / ADMIN_PASSWORD are not set.');
    console.warn('[bootstrap-admin] Admin login will fail until you run the seed script or POST /api/auth/admin/setup.');
    return;
  }

  try {
    await Admin.create({
      email,
      password,
      name: process.env.ADMIN_NAME?.trim() || 'Sunday Admin',
    });
    console.log(`[bootstrap-admin] Created initial admin account for ${email.toLowerCase()}`);
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
}

module.exports = bootstrapAdmin;
