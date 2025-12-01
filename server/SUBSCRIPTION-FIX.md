# 🚨 PROBLEMA: Suscripciones no se actualizan después del pago

## Descripción del Problema

**Síntoma:** 
- El usuario realiza el pago exitosamente en Stripe
- Stripe captura el pago correctamente
- **PERO** la suscripción del usuario NO se actualiza de "free" a "plus" en la base de datos

**Caso específico:**
- Usuario: `Andres`
- Email: `georgelopez1972@gmail.com`
- Plan pagado: `plus` ($5.99/mes)
- Estado actual: La cuenta sigue en "free" a pesar del pago exitoso

## Causa Raíz

El **backend NO está procesando correctamente el webhook de Stripe** cuando se completa un pago. Esto puede deberse a:

1. **Webhook de Stripe no configurado:** El webhook no está configurado en el dashboard de Stripe para apuntar al backend
2. **Endpoint del webhook no existe o no funciona:** El endpoint que recibe el webhook no está implementado o tiene errores
3. **Webhook recibido pero no procesado:** El backend recibe el webhook pero no actualiza la suscripción en la base de datos
4. **Error en la lógica de actualización:** Hay un bug en el código que actualiza la suscripción después del pago

## Solución Necesaria en el Backend

### Opción 1: Verificar y arreglar el webhook (RECOMENDADO)

1. **Verificar que el webhook esté configurado en Stripe:**
   - Ir a Stripe Dashboard → Developers → Webhooks
   - Verificar que hay un webhook apuntando a: `https://tecniflux-production.up.railway.app/api/webhooks/stripe`
   - Verificar que está escuchando el evento: `checkout.session.completed`

2. **Verificar que el endpoint del webhook exista y funcione:**
   ```typescript
   // Endpoint debe ser algo como:
   POST /api/webhooks/stripe
   
   // O:
   POST /api/subscription/webhook
   ```

3. **El webhook debe:**
   - Recibir el evento `checkout.session.completed`
   - Extraer el `customer_id` o `client_reference_id` del session
   - Buscar el usuario en la base de datos
   - Actualizar la suscripción del usuario a "plus" (o el plan correspondiente)
   - Actualizar `current_period_end` a 30 días desde ahora

### Opción 2: Crear endpoint de verificación manual (TEMPORAL)

Crear un endpoint que permita verificar y actualizar la suscripción usando el `session_id`:

```typescript
POST /api/subscription/verify-payment
Body: { sessionId: "cs_live_..." }

// Este endpoint debe:
// 1. Consultar Stripe para verificar el estado del session_id
// 2. Si el pago fue exitoso, actualizar la suscripción del usuario
// 3. Retornar la suscripción actualizada
```

### Opción 3: Actualización manual directa en la base de datos

Si el webhook no funciona, puedes actualizar manualmente la suscripción del usuario:

```sql
-- Buscar el usuario por email
SELECT id, username, email FROM users WHERE email = 'georgelopez1972@gmail.com';

-- Actualizar la suscripción
UPDATE subscriptions 
SET 
  plan = 'plus',
  status = 'active',
  current_period_end = NOW() + INTERVAL '30 days',
  cancel_at_period_end = false,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'georgelopez1972@gmail.com');

-- O insertar si no existe
INSERT INTO subscriptions (user_id, plan, status, current_period_end, cancel_at_period_end, created_at)
VALUES (
  (SELECT id FROM users WHERE email = 'georgelopez1972@gmail.com'),
  'plus',
  'active',
  NOW() + INTERVAL '30 days',
  false,
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET 
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  current_period_end = EXCLUDED.current_period_end,
  cancel_at_period_end = EXCLUDED.cancel_at_period_end,
  updated_at = NOW();
```

## Mejoras Implementadas en el Frontend

El frontend ahora:

1. ✅ Intenta verificar el pago usando `session_id` (si el endpoint existe)
2. ✅ Hace polling más agresivo (hasta 60 segundos) esperando que el backend actualice
3. ✅ Muestra mensaje claro si el backend no actualiza la suscripción
4. ✅ Incluye el `session_id` en el mensaje de error para facilitar el debugging

## Acción Inmediata Requerida

**PRIORIDAD ALTA:** Revisar y arreglar el webhook de Stripe en el backend. Sin esto, **NINGUNA suscripción se actualizará automáticamente** después de los pagos.

### Pasos para diagnosticar:

1. **Revisar logs del backend en Railway** para ver si hay errores relacionados con webhooks
2. **Verificar en Stripe Dashboard** si hay intentos de webhook fallidos
3. **Probar el endpoint del webhook manualmente** si existe
4. **Actualizar manualmente** la suscripción del usuario `georgelopez1972@gmail.com` mientras se arregla el webhook

## Archivos a revisar en el backend:

- Endpoint del webhook de Stripe
- Lógica de actualización de suscripciones
- Manejo del evento `checkout.session.completed`
- Conexión con la base de datos para actualizar suscripciones


