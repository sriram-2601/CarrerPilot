import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell } from './components/AppShell.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { InternshipsPage } from './pages/InternshipsPage.jsx';
import { InternshipDetailPage } from './pages/InternshipDetailPage.jsx';
import { TrackerPage } from './pages/TrackerPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'internships',
        element: <InternshipsPage />
      },
      {
        path: 'internships/:id',
        element: <InternshipDetailPage />
      },
      {
        path: 'tracker',
        element: <TrackerPage />
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
