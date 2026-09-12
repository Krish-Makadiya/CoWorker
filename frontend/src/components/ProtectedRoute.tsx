import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRole: 'customer' | 'worker' | 'cooperative';
  children: React.ReactElement;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  const userId = localStorage.getItem('userId');
  const userJson = localStorage.getItem('user');

  // If not logged in at all, redirect to login page for that role
  if (!userId || !userJson) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }

  try {
    const user = JSON.parse(userJson);
    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];

    // If user has the allowed role for this route, render dashboard
    if (userRoles.includes(allowedRole)) {
      return children;
    }

    // If user is logged in but does not have the allowed role for this dashboard,
    // route them to their actual role dashboard!
    const primaryRole = userRoles[0];
    if (primaryRole === 'customer') {
      return <Navigate to="/dashboard/customer" replace />;
    } else if (primaryRole === 'worker') {
      return <Navigate to="/dashboard/worker" replace />;
    } else if (primaryRole === 'cooperative') {
      return <Navigate to="/dashboard/cooperative" replace />;
    }
  } catch {
    localStorage.clear();
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }

  return <Navigate to="/" replace />;
}
