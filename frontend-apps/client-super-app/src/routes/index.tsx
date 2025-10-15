import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Lazy load pages
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Marketplace = lazy(() => import('../pages/Marketplace/Marketplace'));
const ProductDetails = lazy(() => import('../pages/Marketplace/ProductDetails'));
const AssetDetails = lazy(() => import('../pages/Marketplace/AssetDetails'));
const Portfolio = lazy(() => import('../pages/Portfolio/Portfolio'));
const Transactions = lazy(() => import('../pages/Transactions/TransactionHistory'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Watchlist = lazy(() => import('../pages/Watchlist/Watchlist'));

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress />
  </Box>
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/products/:productId" element={<ProductDetails />} />
            <Route path="/assets/:assetId" element={<AssetDetails />} />
            
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;

