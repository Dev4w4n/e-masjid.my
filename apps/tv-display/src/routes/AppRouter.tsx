import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LandingRoute } from './LandingRoute';
import { DisplayRoute } from './DisplayRoute';

function RootRoute() {
  return <Outlet />;
}

export const appRouter = createBrowserRouter([
  {
    element: <RootRoute />,
    children: [
      {
        index: true,
        element: <LandingRoute />,
      },
      {
        path: 'landing',
        element: <Navigate to="/" replace />,
      },
      {
        path: 'display/:id',
        element: <DisplayRoute />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);