import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar pool de conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createAdmin() {
  try {
    console.log('[create-admin] 🚀 Iniciando creación de usuario admin...');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('Gas05720572!', 10);
    console.log('[create-admin] ✅ Contraseña hasheada');

    // 1. Crear o actualizar usuario admin
    const userResult = await pool.query(
      `
      INSERT INTO users (username, password, role, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (username) DO UPDATE
      SET password = EXCLUDED.password, role = EXCLUDED.role
      RETURNING id, username, role
      `,
      ['George0572', hashedPassword, 'admin']
    );

    const userId = userResult.rows[0].id;
    console.log('[create-admin] ✅ Usuario admin creado/actualizado:', {
      id: userId,
      username: userResult.rows[0].username,
      role: userResult.rows[0].role,
    });

    // 2. Asignar plan PRO ilimitado
    const subscriptionResult = await pool.query(
      `
      INSERT INTO subscriptions (user_id, plan, status, current_period_end, cancel_at_period_end, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET plan = EXCLUDED.plan, 
          status = EXCLUDED.status,
          current_period_end = EXCLUDED.current_period_end,
          cancel_at_period_end = EXCLUDED.cancel_at_period_end,
          updated_at = NOW()
      RETURNING id, plan, status, current_period_end
      `,
      [
        userId,
        'pro',
        'active',
        new Date('2099-12-31').toISOString(), // No expira nunca
        false,
      ]
    );

    console.log('[create-admin] ✅ Plan PRO asignado:', {
      subscriptionId: subscriptionResult.rows[0].id,
      plan: subscriptionResult.rows[0].plan,
      status: subscriptionResult.rows[0].status,
      expiresAt: subscriptionResult.rows[0].current_period_end,
    });

    console.log('\n✅ ============================================');
    console.log('✅ Usuario admin creado exitosamente!');
    console.log('✅ ============================================');
    console.log('Username: George0572');
    console.log('Password: Gas05720572!');
    console.log('Role: admin');
    console.log('Plan: pro (ilimitado, nunca expira)');
    console.log('✅ ============================================\n');
  } catch (error: any) {
    console.error('[create-admin] ❌ Error:', error.message);
    console.error('[create-admin] Stack:', error.stack);
    throw error;
  } finally {
    await pool.end();
  }
}

createAdmin()
  .then(() => {
    console.log('[create-admin] ✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[create-admin] ❌ Error fatal:', error);
    process.exit(1);
  });













