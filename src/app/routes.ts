import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { NotFound, RouteError } from '@/app/pages/public';
import { adminRoutes, authRoutes, companyRoutes, userRoutes } from '@/app/route-config';
import { lazyPage } from '@/app/route-config/lazyPage';
import { GuestRoute, ProtectedRoute } from '@/app/route-config/ProtectedRoute';
import {
  AccountBlocked,
  AccountPending,
  AccountUnderReview,
  CompanyPendingVerification,
} from '@/app/pages/public/AccountStatus';
import type { WorkBridgeUser } from '@/app/api/pages/auth/session';

const RequestService = lazyPage(() => import('@/app/pages/user/RequestService'));
const PublicProfile = lazyPage(() => import('@/app/pages/public/PublicProfile'));

function withErrorElement(routes: RouteObject[]) {
  return routes.map((route) => ({
    ...route,
    errorElement: createElement(RouteError),
  }));
}

function protect(routes: RouteObject[], roles?: WorkBridgeUser['role'][]) {
  return routes.map((route) => ({
    ...route,
    element: createElement(
      ProtectedRoute,
      { roles },
      route.element || (route.Component ? createElement(route.Component) : null),
    ),
    Component: undefined,
  }));
}

function guestOnly(routes: RouteObject[]) {
  return routes.map((route) => {
    if (!['/login', '/register'].includes(String(route.path))) {
      return route;
    }

    return {
      ...route,
      element: createElement(
        GuestRoute,
        null,
        route.element || (route.Component ? createElement(route.Component) : null),
      ),
      Component: undefined,
    };
  });
}

export const router = createBrowserRouter([
  ...withErrorElement(guestOnly(authRoutes)),
  ...withErrorElement([{ path: '/freelancers/:id', Component: PublicProfile }]),
  ...withErrorElement([
    {
      path: '/account-pending',
      element: createElement(AccountPending),
    },
    {
      path: '/account-under-review',
      element: createElement(AccountUnderReview),
    },
    {
      path: '/account-blocked',
      element: createElement(AccountBlocked),
    },
    {
      path: '/company-pending-verification',
      element: createElement(CompanyPendingVerification),
    },
  ]),
  ...withErrorElement(
    protect(
      [{ path: '/services/:id/request', Component: RequestService }],
      ['personal', 'company'],
    ),
  ),
  ...withErrorElement(protect(userRoutes, ['personal'])),
  ...withErrorElement(protect(companyRoutes, ['company'])),
  ...withErrorElement(protect(adminRoutes, ['admin'])),
  { path: '*', Component: NotFound, errorElement: createElement(RouteError) },
]);
