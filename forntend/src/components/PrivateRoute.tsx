import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/utils/constants";

interface PrivateRouteProps {
  children: ReactNode;
  roles?: ("USER" | "ORGANIZER" | "ADMIN")[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ returnTo: location.pathname }}
        replace
      />
    );
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
