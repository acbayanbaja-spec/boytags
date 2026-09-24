export type Role = "CUSTOMER" | "STAFF" | "ADMIN";
export type OrderType = "PICKUP" | "DELIVERY";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "COMPLETED"
  | "CANCELLED"
  | "UNCLAIMED";

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  availableQty: number;
  soldOut: boolean;
  active: boolean;
  category: { id: string; name: string; slug: string };
};

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Delivery = {
  address: string;
  landmark?: string | null;
  notes?: string | null;
  contactPhone: string;
  latitude: number;
  longitude: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  priority: "NORMAL" | "HIGH" | "URGENT";
  scheduledAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerNotes?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  delivery: Delivery | null;
  customer?: { id: string; name: string; email: string; phone?: string | null };
  history?: HistoryEntry[];
};

export type HistoryEntry = {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  previousValue: unknown;
  newValue: unknown;
  createdAt: string;
};

export type Alert = {
  id: string;
  type: string;
  status: string;
  message: string;
  createdAt: string;
  order?: { orderNumber?: string; customer?: { name: string; phone?: string | null }; items?: OrderItem[] } | null;
  acknowledgedBy?: { name: string } | null;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  orderId?: string | null;
  createdAt: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  UNCLAIMED: "Unclaimed",
};

export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED",
  UNCLAIMED: "COMPLETED",
};
