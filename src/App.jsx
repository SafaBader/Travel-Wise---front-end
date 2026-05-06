import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import TripsPage from './pages/TripsPage';
import TripPlannerPage from './pages/TripPlannerPage';
import TripDetailPage from './pages/TripDetailPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

function Providers() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <Providers />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <Layout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/explore', element: <ExplorePage /> },
          { path: '/places/:id', element: <PlaceDetailPage /> },
          {
            path: '/favorites',
            element: <ProtectedRoute><FavoritesPage /></ProtectedRoute>,
          },
          {
            path: '/trips',
            element: <ProtectedRoute><TripsPage /></ProtectedRoute>,
          },
          {
            path: '/trips/:id',
            element: <ProtectedRoute><TripPlannerPage /></ProtectedRoute>,
          },
          {
            path: '/trips/:id/detail',
            element: <ProtectedRoute><TripDetailPage /></ProtectedRoute>,
          },
          {
            path: '/dashboard',
            element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
          },
          {
            path: '/profile',
            element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
          },
          { path: '*', element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
