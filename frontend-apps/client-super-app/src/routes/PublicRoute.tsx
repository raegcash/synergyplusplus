import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

function PublicRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;

