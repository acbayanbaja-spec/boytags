import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventsUrl } from "@/lib/api";
import { subscribeMockStore } from "@/lib/mockStore";
import { useAuth } from "@/context/AuthContext";
import { sound } from "@/lib/sound";
import { toast } from "sonner";

export function useRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Listen to local / simulation events
    const unsubscribeMock = subscribeMockStore((event) => {
      if (event.type === "order-completed") {
        sound.play("success");
        toast.success(`Order ${event.orderNumber || ""} is Done! 🎉`, {
          description: "Your order has been completed! Salamat sa pag-order sa Boytag's!",
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    });

    // Listen to SSE server stream
    let source: EventSource | null = null;
    try {
      source = new EventSource(eventsUrl());
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            orderNumber?: string;
            status?: string;
            orderId?: string;
          };

          if (payload.type === "order-completed" || payload.status === "COMPLETED") {
            sound.play("success");
            toast.success(`Order ${payload.orderNumber || ""} is Done! 🎉`, {
              description: "Your order has been completed and delivered! Salamat sa pag-order sa Boytag's!",
            });
          }

          if (payload.type === "order" || payload.type === "order-completed" || payload.type === "staff-event") {
            void queryClient.invalidateQueries({ queryKey: ["orders"] });
            void queryClient.invalidateQueries({ queryKey: ["order"] });
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
        } catch {
          // ignore malformed frame
        }
      };
    } catch {
      // SSE not available, offline fallback
    }

    return () => {
      unsubscribeMock();
      source?.close();
    };
  }, [user, queryClient]);
}
