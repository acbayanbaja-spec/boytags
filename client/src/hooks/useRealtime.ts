import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventsUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export function useRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const source = new EventSource(eventsUrl());
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string };
      if (payload.type === "order" || payload.type === "staff-event") {
        void queryClient.invalidateQueries({ queryKey: ["orders"] });
        void queryClient.invalidateQueries({ queryKey: ["queue"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
      if (payload.type === "inventory") {
        void queryClient.invalidateQueries({ queryKey: ["products"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
      if (payload.type === "alerts" || payload.type === "notification" || payload.type === "staff-event") {
        void queryClient.invalidateQueries({ queryKey: ["alerts"] });
        void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };
    return () => source.close();
  }, [user, queryClient]);
}
