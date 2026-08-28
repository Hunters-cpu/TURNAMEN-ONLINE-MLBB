import { db } from './index.ts';
import { users, systemAuditLogs } from './schema.ts';
import { eq } from 'drizzle-orm';

export const SUPER_ADMIN_EMAIL = 'mumumimi353@gmail.com';

export async function getOrCreateUser(uid: string, email: string, name?: string, avatarUrl?: string) {
  const isSuper = email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const role = isSuper ? 'admin' : 'peserta';

  try {
    const result = await db.insert(users)
      .values({
        uid,
        email: email.toLowerCase(),
        name: name || (isSuper ? 'Admin Utama (Mumumimi)' : 'Pemain Esport'),
        role,
        isSuperAdmin: isSuper,
        avatarUrl: avatarUrl || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase(),
          ...(name ? { name } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
          ...(isSuper ? { role: 'admin', isSuperAdmin: true } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Gagal memproses akun pengguna di database.', { cause: error });
  }
}

export async function getAllDbUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Database getAllDbUsers failed:', error);
    throw new Error('Gagal mengambil daftar pengguna.', { cause: error });
  }
}

export async function logSystemAudit(actorEmail: string, action: string, category: string, details?: string) {
  try {
    await db.insert(systemAuditLogs).values({
      actorEmail,
      action,
      category,
      details: details || '',
    });
  } catch (error) {
    console.error('Log system audit error (non-fatal):', error);
  }
}
