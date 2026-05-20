import { createElement } from 'react';
import type { RouteObject } from 'react-router';
import { createBrowserRouter } from 'react-router';
import { NotFound, RouteError } from '@/app/pages/public';
import { adminRoutes, authRoutes, companyRoutes, userRoutes } from '@/app/route-config';

function withErrorElement(routes: RouteObject[]) {
  return routes.map((route) => ({
    ...route,
    errorElement: createElement(RouteError),
  }));
}

export const router = createBrowserRouter([
  ...withErrorElement(authRoutes),
  ...withErrorElement(userRoutes),
  ...withErrorElement(companyRoutes),
  ...withErrorElement(adminRoutes),
  { path: '*', Component: NotFound, errorElement: createElement(RouteError) },
]);
