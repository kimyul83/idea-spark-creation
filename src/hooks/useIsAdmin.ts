import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useIsAdmin() {
  const { user, loading } = useAuth();
  const [dbAllowed, setDbAllowed] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user) {
      setDbAllowed(false);
      setRoleLoading(false);
      return;
    }

    setRoleLoading(true);
    supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        setDbAllowed(!error && !!data);
        setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  const isAdmin = dbAllowed;
  return { isAdmin, loading: loading || roleLoading };
}

export const ADMIN_EMAIL = "vm5j8rn27t@privaterelay.appleid.com";
