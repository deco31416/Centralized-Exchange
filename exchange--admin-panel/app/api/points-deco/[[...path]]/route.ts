import { createAdminProxyHandler } from '../../_shared/proxy';

export const dynamic = 'force-dynamic';

export const { GET, POST, PUT, PATCH, DELETE } = createAdminProxyHandler('points-deco', {
  sensitiveRoutes: [
    {
      methods: ['POST'],
      pathIncludes: 'execute-resolution',
      requiredRoles: ['super_admin', 'admin'],
      label: 'Puntos Deco resolution execution',
      requiresEmailReauth: true,
    },
    {
      methods: ['POST'],
      pathIncludes: 'economic-actions',
      requiredRoles: ['super_admin', 'admin'],
      label: 'Puntos Deco economic action execution',
      requiresEmailReauth: true,
    },
    {
      methods: ['POST'],
      pathIncludes: 'forms',
      requiredRoles: ['super_admin', 'admin'],
      label: 'Puntos Deco secure form action',
      requiresEmailReauth: true,
    },
  ],
});
