import type { Alert, Category, NotificationItem, Order, OrderStatus, Product, User } from "@/types";

const images = {
  whole: "/images/whole-lechon-manok.jpg",
  half: "/images/half-lechon-manok.jpg",
  spicy: "/images/spicy-labuyo-lechon-manok.jpg",
  bilao: "/images/barkada-fiesta-roast-bilao.jpg",
  inasal: "/images/chicken-inasal.jpg",
  fried: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=70",
  liempo: "/images/grilled-liempo.jpg",
  rice: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=70",
  drinks: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=70",
  sauce: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=70",
};

export const INITIAL_USERS: User[] = [
  {
    id: "usr_admin",
    name: "Elena Boytag",
    email: "admin@boytags.local",
    phone: "09171234567",
    role: "ADMIN",
  },
  {
    id: "usr_staff",
    name: "Marco Reyes",
    email: "staff@boytags.local",
    phone: "09181234567",
    role: "STAFF",
  },
  {
    id: "usr_customer",
    name: "Ana Villanueva",
    email: "customer@boytags.local",
    phone: "09192223333",
    role: "CUSTOMER",
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok", description: "Slow-roasted whole chicken, Boytag's Tupi signature.", sortOrder: 1 },
  { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried", description: "Inasal, fried chicken, and liempo.", sortOrder: 2 },
  { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides", description: "Complete the table with house sauces & rice.", sortOrder: 3 },
  { id: "cat_drinks", name: "Drinks", slug: "drinks", description: "Ice-cold kalamansi & refreshments.", sortOrder: 4 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_whole",
    name: "Whole Lechon Manok",
    slug: "whole-lechon-manok",
    description: "Crisp golden crackling skin, juicy meat, and our signature garlic-lemongrass marinade roasted slowly over live hardwood charcoal. Serves 4–5.",
    price: 380,
    imageUrl: images.whole,
    availableQty: 24,
    soldOut: false,
    active: true,
    bestseller: true,
    featured: true,
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_half",
    name: "Half Lechon Manok",
    slug: "half-lechon-manok",
    description: "The same authentic roast chicken, sized for a pair or a generous solo dinner in Tupi. Serves 2–3.",
    price: 210,
    imageUrl: images.half,
    availableQty: 18,
    soldOut: false,
    active: true,
    bestseller: true,
    featured: true,
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_spicy",
    name: "Spicy Labuyo Lechon Manok",
    slug: "spicy-labuyo-lechon-manok",
    description: "Charcoal-roasted whole chicken infused with fiery Mindanao sili labuyo chili oil glaze and aromatic lemongrass. Serves 4–5.",
    price: 395,
    imageUrl: images.spicy,
    availableQty: 16,
    soldOut: false,
    active: true,
    bestseller: true,
    featured: true,
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_bilao",
    name: "Barkada Fiesta Roast Bilao",
    slug: "barkada-fiesta-roast-bilao",
    description: "Grand native bamboo bilao feast with chopped whole roast chicken, grilled liempo, chicken inasal, java rice, and house sawsawan. Serves 6–8.",
    price: 999,
    imageUrl: images.bilao,
    availableQty: 12,
    soldOut: false,
    active: true,
    bestseller: true,
    featured: true,
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_inasal",
    name: "Chicken Inasal (2 pcs)",
    slug: "chicken-inasal",
    description: "Char-grilled, annatto-brushed, served with toyomansi, sili labuyo, and native calamansi.",
    price: 165,
    imageUrl: images.inasal,
    availableQty: 30,
    soldOut: false,
    active: true,
    category: { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried" },
  },
  {
    id: "prod_fried",
    name: "Crispy Fried Chicken",
    slug: "crispy-fried-chicken",
    description: "Buttermilk-brined, golden double-fried, served with Boytag's house gravy.",
    price: 149,
    imageUrl: images.fried,
    availableQty: 20,
    soldOut: false,
    active: true,
    category: { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried" },
  },
  {
    id: "prod_liempo",
    name: "Grilled Pork Liempo",
    slug: "grilled-liempo",
    description: "Juicy pork belly, charcoal-kissed over coconut hardwood with atchara.",
    price: 185,
    imageUrl: images.liempo,
    availableQty: 14,
    soldOut: false,
    active: true,
    category: { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried" },
  },
  {
    id: "prod_java",
    name: "Java Rice",
    slug: "java-rice",
    description: "Annatto-scented rice, the proper partner for lechon manok.",
    price: 35,
    imageUrl: images.rice,
    availableQty: 80,
    soldOut: false,
    active: true,
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_garlic",
    name: "Garlic Rice",
    slug: "garlic-rice",
    description: "Toasted garlic, fluffy grains, extra golden crunch on top.",
    price: 35,
    imageUrl: images.rice,
    availableQty: 80,
    soldOut: false,
    active: true,
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_sauce",
    name: "House Sawsawan Set",
    slug: "sawsawan-set",
    description: "Toyomansi, chili garlic oil, and savory liver sauce in takeout cups.",
    price: 25,
    imageUrl: images.sauce,
    availableQty: 50,
    soldOut: false,
    active: true,
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_calamansi",
    name: "Iced Calamansi Juice",
    slug: "iced-calamansi",
    description: "Freshly squeezed native calamansi, lightly sweetened with wild honey.",
    price: 45,
    imageUrl: images.drinks,
    availableQty: 40,
    soldOut: false,
    active: true,
    category: { id: "cat_drinks", name: "Drinks", slug: "drinks" },
  },
  {
    id: "prod_sago",
    name: "Sago't Gulaman",
    slug: "sago-gulaman",
    description: "Brown sugar syrup, chewy tapioca sago, cool gulaman jelly cubes.",
    price: 45,
    imageUrl: images.drinks,
    availableQty: 0,
    soldOut: true,
    active: true,
    category: { id: "cat_drinks", name: "Drinks", slug: "drinks" },
  },
  {
    id: "prod_porchetta",
    name: "Crispy Lechon Porchetta Roll",
    slug: "crispy-lechon-porchetta-roll",
    description: "Slow-roasted pork belly roll with ultra-crispy crackling skin, stuffed with native lemongrass, garlic cloves, and scallions. 1kg slice.",
    price: 580,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=70",
    availableQty: 15,
    soldOut: false,
    active: true,
    bestseller: true,
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_sisig",
    name: "Poblacion Sizzling Chicken Sisig",
    slug: "poblacion-sizzling-chicken-sisig",
    description: "Chopped crispy roast chicken tossed with savory chicken liver glaze, calamansi, native onions, and fiery Mindanao sili labuyo.",
    price: 245,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=70",
    availableQty: 25,
    soldOut: false,
    active: true,
    featured: true,
    category: { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried" },
  },
  {
    id: "prod_inasal_pecho",
    name: "Inasal Pecho Large with Garlic Rice",
    slug: "inasal-pecho-large-garlic-rice",
    description: "Charcoal-grilled quarter chicken breast & wing basted with authentic annatto chicken oil. Served with warm garlic rice and spiced sinamak vinegar.",
    price: 195,
    imageUrl: "/images/chicken-inasal.jpg",
    availableQty: 22,
    soldOut: false,
    active: true,
    category: { id: "cat_grilled", name: "Grilled & Fried", slug: "grilled-fried" },
  },
  {
    id: "prod_kangkong",
    name: "Crispy Kangkong with Garlic Dip",
    slug: "crispy-kangkong-garlic-dip",
    description: "Fresh local river spinach flash-fried in golden tempura batter with toasted garlic bits and house spicy garlic-mayo sawsawan.",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=70",
    availableQty: 35,
    soldOut: false,
    active: true,
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_quencher",
    name: "Lemongrass Calamansi Quencher (1L Pitcher)",
    slug: "lemongrass-calamansi-quencher-1l",
    description: "Freshly brewed wild tanglad (lemongrass) tea infused with pure Tupi calamansi juice and wild Mindanao honey over crushed ice. Serves 3–4.",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=70",
    availableQty: 40,
    soldOut: false,
    active: true,
    category: { id: "cat_drinks", name: "Drinks", slug: "drinks" },
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_1001",
    orderNumber: "BT-1001",
    type: "DELIVERY",
    status: "PREPARING",
    priority: "HIGH",
    scheduledAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    subtotal: 415,
    deliveryFee: 40,
    total: 455,
    customerNotes: "Please call when outside. Extra spicy sawsawan if possible!",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    customer: INITIAL_USERS[2],
    items: [
      {
        id: "item_1",
        productId: "prod_whole",
        productName: "Whole Lechon Manok",
        unitPrice: 380,
        quantity: 1,
        lineTotal: 380,
      },
      {
        id: "item_2",
        productId: "prod_garlic",
        productName: "Garlic Rice",
        unitPrice: 35,
        quantity: 1,
        lineTotal: 35,
      },
    ],
    delivery: {
      address: "Purok 2, Poblacion, Tupi, South Cotabato",
      landmark: "Near Tupi Municipal Gymnasium, yellow gate with mango tree",
      notes: "Please call mobile or honk when outside.",
      contactPhone: "09192223333",
      latitude: 6.3345,
      longitude: 124.9525,
    },
    history: [
      {
        id: "hist_1",
        actorName: "Ana Villanueva",
        actorRole: "CUSTOMER",
        action: "ORDER_CREATED",
        previousValue: null,
        newValue: { orderNumber: "BT-1001" },
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: "hist_2",
        actorName: "Marco Reyes",
        actorRole: "STAFF",
        action: "STATUS_CHANGED",
        previousValue: { status: "PENDING" },
        newValue: { status: "CONFIRMED" },
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: "hist_3",
        actorName: "Marco Reyes",
        actorRole: "STAFF",
        action: "STATUS_CHANGED",
        previousValue: { status: "CONFIRMED" },
        newValue: { status: "PREPARING" },
        createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "ord_1002",
    orderNumber: "BT-1002",
    type: "PICKUP",
    status: "READY",
    priority: "NORMAL",
    scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    subtotal: 210,
    deliveryFee: 0,
    total: 210,
    customerNotes: "Cut into 4 pieces please for pickup at Poblacion Tupi store.",
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    customer: INITIAL_USERS[2],
    delivery: null,
    items: [
      {
        id: "item_3",
        productId: "prod_half",
        productName: "Half Lechon Manok",
        unitPrice: 210,
        quantity: 1,
        lineTotal: 210,
      },
    ],
    history: [
      {
        id: "hist_4",
        actorName: "Ana Villanueva",
        actorRole: "CUSTOMER",
        action: "ORDER_CREATED",
        previousValue: null,
        newValue: { orderNumber: "BT-1002" },
        createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: "hist_5",
        actorName: "Marco Reyes",
        actorRole: "STAFF",
        action: "STATUS_CHANGED",
        previousValue: { status: "PREPARING" },
        newValue: { status: "READY" },
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "ord_1003",
    orderNumber: "BT-1003",
    type: "DELIVERY",
    status: "PENDING",
    priority: "URGENT",
    scheduledAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    subtotal: 580,
    deliveryFee: 40,
    total: 620,
    customerNotes: "Family feast order along Sarangani Road.",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    customer: INITIAL_USERS[2],
    items: [
      {
        id: "item_4",
        productId: "prod_whole",
        productName: "Whole Lechon Manok",
        unitPrice: 380,
        quantity: 1,
        lineTotal: 380,
      },
      {
        id: "item_5",
        productId: "prod_inasal",
        productName: "Chicken Inasal (2 pcs)",
        unitPrice: 165,
        quantity: 1,
        lineTotal: 165,
      },
      {
        id: "item_6",
        productId: "prod_sauce",
        productName: "House Sawsawan Set",
        unitPrice: 25,
        quantity: 1,
        lineTotal: 25,
      },
    ],
    delivery: {
      address: "Crossing Rubber, Tupi, South Cotabato",
      landmark: "Beside agricultural supply, green gate",
      contactPhone: "09192223333",
      latitude: 6.3315,
      longitude: 124.9495,
    },
    history: [
      {
        id: "hist_6",
        actorName: "Ana Villanueva",
        actorRole: "CUSTOMER",
        action: "ORDER_CREATED",
        previousValue: null,
        newValue: { orderNumber: "BT-1003" },
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    orderId: "ord_1001",
    type: "STATUS_UPDATE",
    title: "Roaster Fired Up in Poblacion Tupi! 🔥",
    body: "Your order BT-1001 is now roasting over hot hardwood coals at our Tupi main pit.",
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_2",
    orderId: "ord_1002",
    type: "STATUS_UPDATE",
    title: "Ready for Pickup at Poblacion Store! 🍗",
    body: "Order BT-1002 is packed in our warmer box. Present your reference at the counter.",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "notif_3",
    type: "PROMO",
    title: "Tupi Weekend Crispy Skin Special",
    body: "Use code BOYTAGS10 for 10% off any whole chicken or family bundle today.",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "al_1",
    type: "LOW_STOCK",
    status: "OPEN",
    message: "Grilled Pork Liempo is down to 12 servings remaining today at Tupi store.",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "al_2",
    type: "SOLD_OUT",
    status: "OPEN",
    message: "Sago't Gulaman sold out for today.",
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
];

// Persistent state holder in memory and localStorage
class MockBackend {
  private users: User[] = [];
  private categories: Category[] = [];
  private products: Product[] = [];
  private orders: Order[] = [];
  private notifications: NotificationItem[] = [];
  private alerts: Alert[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.load();
    this.sweepExpired();
    if (typeof window !== "undefined") {
      setInterval(() => this.sweepExpired(), 30000);
    }
  }

  /** Returns reserved stock to the shelf when an order leaves the pipeline. */
  private restock(order: Order) {
    for (const item of order.items || []) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) continue;
      prod.availableQty = (prod.availableQty ?? 0) + item.quantity;
      prod.soldOut = prod.availableQty <= 0;
    }
  }

  /** Mirrors the server's expiry watcher: overdue unfulfilled orders auto-cancel and leave the queue. */
  private sweepExpired() {
    const now = Date.now();
    let changed = false;
    for (const order of this.orders) {
      if (order.status !== "PENDING") continue;
      const deadline = order.autoCancelAt
        ? new Date(order.autoCancelAt).getTime()
        : new Date(order.scheduledAt).getTime() + 15 * 60 * 1000;
      if (Number.isNaN(deadline) || now < deadline) continue;
      order.status = "CANCELLED";
      order.cancelReason = "Auto-expired: the scheduled pickup or delivery time passed without confirmation.";
      order.updatedAt = new Date().toISOString();
      this.restock(order);
      this.notifications.unshift({
        id: `notif_${Date.now()}_exp`,
        orderId: order.id,
        type: "AUTO_EXPIRED",
        title: `Order ${order.orderNumber} expired`,
        body: "Its scheduled time passed without confirmation, so it was automatically cancelled and removed from the queue.",
        read: false,
        createdAt: new Date().toISOString(),
      });
      emitMockStore({ type: "order-expired", orderId: order.id, orderNumber: order.orderNumber, status: "CANCELLED" });
      changed = true;
    }
    for (const order of this.orders) {
      if (order.status !== "READY" && order.status !== "OUT_FOR_DELIVERY") continue;
      const since = new Date(order.readyAt || order.scheduledAt).getTime();
      if (Number.isNaN(since) || now < since + 15 * 60 * 1000) continue;
      const waitedMinutes = Math.round((now - since) / 60000);
      order.status = "UNCLAIMED";
      order.unclaimedAt = new Date().toISOString();
      order.priority = "URGENT";
      order.updatedAt = new Date().toISOString();
      this.notifications.unshift({
        id: `notif_${Date.now()}_unc`,
        orderId: order.id,
        type: "UNCLAIMED",
        title: `Order ${order.orderNumber} is unclaimed`,
        body: `It has been ready for ${waitedMinutes} minutes without being claimed. Please contact the customer or release the stock.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      emitMockStore({ type: "order-unclaimed", orderId: order.id, orderNumber: order.orderNumber, status: "UNCLAIMED", waitedMinutes });
      changed = true;
    }
    if (changed) this.save();
  }

  private load() {
    try {
      const STORE_VERSION = "boytags.mock.v8";
      if (typeof window !== "undefined" && localStorage.getItem("boytags.mock.ver") !== STORE_VERSION) {
        localStorage.removeItem("boytags.mock.products");
        localStorage.removeItem("boytags.mock.categories");
        localStorage.removeItem("boytags.mock.orders");
        localStorage.setItem("boytags.mock.ver", STORE_VERSION);
      }

      const u = localStorage.getItem("boytags.mock.users");
      this.users = u ? JSON.parse(u) : INITIAL_USERS;

      const c = localStorage.getItem("boytags.mock.categories");
      this.categories = c ? JSON.parse(c) : INITIAL_CATEGORIES;

      const p = localStorage.getItem("boytags.mock.products");
      this.products = p ? JSON.parse(p) : INITIAL_PRODUCTS;

      const o = localStorage.getItem("boytags.mock.orders");
      this.orders = o ? JSON.parse(o) : INITIAL_ORDERS;

      const n = localStorage.getItem("boytags.mock.notifications");
      this.notifications = n ? JSON.parse(n) : INITIAL_NOTIFICATIONS;

      const a = localStorage.getItem("boytags.mock.alerts");
      this.alerts = a ? JSON.parse(a) : INITIAL_ALERTS;

      const cur = localStorage.getItem("boytags.mock.current_user");
      this.currentUser = cur ? JSON.parse(cur) : null;
    } catch {
      this.users = INITIAL_USERS;
      this.categories = INITIAL_CATEGORIES;
      this.products = INITIAL_PRODUCTS;
      this.orders = INITIAL_ORDERS;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.alerts = INITIAL_ALERTS;
      this.currentUser = null;
    }
  }

  private save() {
    try {
      localStorage.setItem("boytags.mock.users", JSON.stringify(this.users));
      localStorage.setItem("boytags.mock.categories", JSON.stringify(this.categories));
      localStorage.setItem("boytags.mock.products", JSON.stringify(this.products));
      localStorage.setItem("boytags.mock.orders", JSON.stringify(this.orders));
      localStorage.setItem("boytags.mock.notifications", JSON.stringify(this.notifications));
      localStorage.setItem("boytags.mock.alerts", JSON.stringify(this.alerts));
      if (this.currentUser) {
        localStorage.setItem("boytags.mock.current_user", JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem("boytags.mock.current_user");
      }
    } catch {
      // Storage quota safe fail
    }
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public login(email: string): { user: User; accessToken: string; refreshToken: string } {
    let user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      const role = email.includes("admin") ? "ADMIN" : email.includes("staff") ? "STAFF" : "CUSTOMER";
      user = {
        id: `usr_${Date.now()}`,
        email,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
      };
      this.users.push(user);
    }
    this.currentUser = user;
    this.save();
    return {
      user,
      accessToken: `mock_access_${user.id}`,
      refreshToken: `mock_refresh_${user.id}`,
    };
  }

  public register(input: { name: string; email: string; phone?: string }): { user: User; accessToken: string; refreshToken: string } {
    const existing = this.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      this.currentUser = existing;
      return { user: existing, accessToken: `mock_access_${existing.id}`, refreshToken: `mock_refresh_${existing.id}` };
    }
    const user: User = {
      id: `usr_${Date.now()}`,
      email: input.email,
      name: input.name,
      phone: input.phone,
      role: "CUSTOMER",
    };
    this.users.push(user);
    this.currentUser = user;
    this.save();
    return { user, accessToken: `mock_access_${user.id}`, refreshToken: `mock_refresh_${user.id}` };
  }

  public logout() {
    this.currentUser = null;
    this.save();
  }

  public updateMe(updates: { name?: string; phone?: string | null }): User {
    if (!this.currentUser) throw new Error("Not logged in");
    if (updates.name) this.currentUser.name = updates.name;
    if (updates.phone !== undefined) this.currentUser.phone = updates.phone;
    const idx = this.users.findIndex((u) => u.id === this.currentUser!.id);
    if (idx !== -1) this.users[idx] = this.currentUser;
    this.save();
    return this.currentUser;
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public createProduct(data: { name: string; description: string; price: number; imageUrl: string; availableQty: number; categoryId?: string; active?: boolean }): Product {
    const category = this.categories.find((c) => c.id === data.categoryId) || this.categories[0];
    const newProd: Product = {
      id: `prod_${Date.now()}`,
      category: { id: category.id, name: category.name, slug: category.slug },
      name: data.name || "Special Tupi Dish",
      slug: (data.name || "dish").toLowerCase().replace(/\s+/g, "-"),
      description: data.description || "Authentic Boytag's specialty.",
      price: Number(data.price || 150),
      imageUrl: data.imageUrl || images.whole,
      availableQty: Number(data.availableQty || 20),
      soldOut: Number(data.availableQty || 0) <= 0,
      active: data.active ?? true,
    };
    this.products.unshift(newProd);
    this.save();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product> & { categoryId?: string }): Product {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    const existing = this.products[idx];
    const availableQty = updates.availableQty !== undefined ? Number(updates.availableQty) : existing.availableQty;
    const updated: Product = {
      ...existing,
      ...updates,
      availableQty,
      soldOut: availableQty <= 0,
    };
    if (updates.categoryId) {
      const cat = this.categories.find((c) => c.id === updates.categoryId);
      if (cat) updated.category = { id: cat.id, name: cat.name, slug: cat.slug };
    }
    this.products[idx] = updated;
    this.save();
    return updated;
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter((p) => p.id !== id);
    this.save();
  }

  /** Attach live product info (photo etc.) to order items, mirroring the real API. */
  private withProductData(order: Order): Order {
    return {
      ...order,
      items: order.items.map((item) => {
        const product = this.products.find((p) => p.id === item.productId);
        return product ? { ...item, product: { imageUrl: product.imageUrl, slug: product.slug, name: product.name, description: product.description, availableQty: product.availableQty } } : item;
      }),
    };
  }

  public getOrders(user?: User | null): Order[] {
    if (!user) {
      return [];
    }
    if (user.role === "STAFF" || user.role === "ADMIN") {
      return this.orders.map((o) => this.withProductData(o));
    }
    return this.orders.filter((o) => o.customer?.id === user.id).map((o) => this.withProductData(o));
  }

  public getQueueOrders(): Order[] {
    const ACTIVE_QUEUE = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "UNCLAIMED"];
    return this.orders.filter((o) => ACTIVE_QUEUE.includes(o.status));
  }

  /** Staff audit trail, mirroring the server's /api/orders/audit shape. */
  public getAuditLog(limit = 60) {
    return this.orders
      .flatMap((order) =>
        (order.history || []).map((entry) => ({
          ...entry,
          orderId: order.id,
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            scheduledAt: order.scheduledAt,
            type: order.type,
          },
        })),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  public getOrder(id: string): Order {
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new Error("Order not found");
    return order;
  }

  public createOrder(payload: {
    type: "PICKUP" | "DELIVERY";
    scheduledAt: string;
    customerNotes?: string;
    items: Array<{ productId: string; quantity: number }>;
    delivery?: {
      address: string;
      landmark?: string;
      notes?: string;
      contactPhone: string;
      latitude: number;
      longitude: number;
    };
  }): Order {
    if (!this.currentUser) {
      throw new Error("You must be logged in to place an order. Please sign in or create an account.");
    }
    const user = this.currentUser;
    const orderNum = `BT-${1000 + this.orders.length + 1}`;

    let subtotal = 0;
    const orderItems = payload.items.map((i, idx) => {
      const prod = this.products.find((p) => p.id === i.productId) || this.products[0];
      const lineTotal = prod.price * i.quantity;
      subtotal += lineTotal;
      return {
        id: `item_${Date.now()}_${idx}`,
        productId: prod.id,
        productName: prod.name,
        unitPrice: prod.price,
        quantity: i.quantity,
        lineTotal,
      };
    });

    for (const item of orderItems) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) continue;
      if (prod.soldOut || (prod.availableQty ?? 0) < item.quantity) {
        throw new Error(`${prod.name} does not have enough stock for this order.`);
      }
      prod.availableQty = Math.max(0, (prod.availableQty ?? 0) - item.quantity);
      prod.soldOut = prod.availableQty <= 0;
    }
    this.save();

    const deliveryFee = payload.type === "DELIVERY" ? 40 : 0;
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      customer: user,
      type: payload.type,
      status: "PENDING",
      priority: "NORMAL",
      scheduledAt: payload.scheduledAt,
      autoCancelAt: new Date(new Date(payload.scheduledAt).getTime() + 15 * 60 * 1000).toISOString(),
      subtotal,
      deliveryFee,
      total,
      customerNotes: payload.customerNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
      delivery: payload.delivery || null,
      history: [
        {
          id: `hist_${Date.now()}`,
          actorName: user.name,
          actorRole: user.role,
          action: "ORDER_CREATED",
          previousValue: null,
          newValue: { orderNumber: orderNum },
          createdAt: new Date().toISOString(),
        },
      ],
    };

    this.orders.unshift(newOrder);

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      orderId: newOrder.id,
      type: "ORDER_CREATED",
      title: "Order Placed at Boytag's Tupi! 🍗",
      body: `Order ${orderNum} received by our Poblacion kitchen. We'll start roasting shortly.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, newStatus: OrderStatus): Order {
    const order = this.getOrder(id);
    const prevStatus = order.status;
    order.status = newStatus;
    if (newStatus === "CONFIRMED") order.autoCancelAt = null;
    if (newStatus === "READY" && !order.readyAt) order.readyAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    const actor = this.currentUser || INITIAL_USERS[1];
    if (!order.history) order.history = [];
    order.history.unshift({
      id: `hist_${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role,
      action: "STATUS_CHANGED",
      previousValue: { status: prevStatus },
      newValue: { status: newStatus },
      createdAt: new Date().toISOString(),
    });

    if (newStatus === "COMPLETED") {
      this.notifications.unshift({
        id: `notif_${Date.now()}_done`,
        orderId: order.id,
        type: "ORDER_COMPLETED",
        title: `Order ${order.orderNumber} is Done! 🎉`,
        body: order.type === "DELIVERY"
          ? `Your order ${order.orderNumber} has been safely delivered to your doorstep in Tupi! Salamat sa pag-order sa Boytag's Lechon Manok!`
          : `Your order ${order.orderNumber} has been picked up and completed at our Poblacion HQ! Enjoy your charcoal-roasted feast!`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      this.notifications.unshift({
        id: `notif_${Date.now()}`,
        orderId: order.id,
        type: "STATUS_UPDATE",
        title: `Order ${order.orderNumber}: ${newStatus.replace(/_/g, " ")}`,
        body: `Your order status changed from ${prevStatus} to ${newStatus}.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    this.save();
    emitMockStore({
      type: newStatus === "COMPLETED" ? "order-completed" : "order-updated",
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: newStatus,
    });
    return order;
  }

  public updateOrder(id: string, updates: { customerNotes?: string; scheduledAt?: string }): Order {
    const order = this.getOrder(id);
    if (updates.customerNotes !== undefined) order.customerNotes = updates.customerNotes;
    if (updates.scheduledAt) order.scheduledAt = updates.scheduledAt;
    order.updatedAt = new Date().toISOString();
    this.save();
    emitMockStore({
      type: "order-updated",
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
    });
    return order;
  }

  public cancelOrder(id: string, reason?: string): Order {
    const order = this.getOrder(id);
    const wasCancelled = order.status === "CANCELLED";
    order.status = "CANCELLED";
    order.cancelReason = reason || "Cancelled by customer.";
    order.updatedAt = new Date().toISOString();
    if (!wasCancelled) this.restock(order);

    const actor = this.currentUser || INITIAL_USERS[2];
    if (!order.history) order.history = [];
    order.history.unshift({
      id: `hist_${Date.now()}`,
      actorName: actor.name,
      actorRole: actor.role,
      action: "ORDER_CANCELLED",
      previousValue: null,
      newValue: { reason: order.cancelReason },
      createdAt: new Date().toISOString(),
    });
    this.save();
    emitMockStore({
      type: "order-cancelled",
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: "CANCELLED",
    });
    return order;
  }

  public notifyRiderArrived(id: string): Order {
    const order = this.getOrder(id);
    this.notifications.unshift({
      id: `notif_${Date.now()}_arrived`,
      orderId: order.id,
      type: "RIDER_ARRIVED",
      title: "Kuya Jun (Rider) is Outside Your House! 🛵🔔",
      body: `Your Boytag's rider has arrived at ${order.delivery?.address || 'your gate'} with your hot roast chicken feast! Please meet the rider at your gate.`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save();
    emitMockStore({
      type: "rider-arrived",
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
    return order;
  }

  public getDashboardStats() {
    const today = new Date().toISOString().split("T")[0];
    const metrics = {
      ordersToday: this.orders.length,
      pending: this.orders.filter((o) => o.status === "PENDING").length,
      preparing: this.orders.filter((o) => o.status === "PREPARING").length,
      ready: this.orders.filter((o) => o.status === "READY").length,
      outForDelivery: this.orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
      completed: this.orders.filter((o) => o.status === "COMPLETED").length,
      unclaimed: this.orders.filter((o) => o.status === "UNCLAIMED").length,
      soldOut: this.products.filter((p) => p.soldOut || p.availableQty <= 0).length,
    };

    const series = [
      { date: "2026-09-18", label: "Fri", orders: 28, completed: 27 },
      { date: "2026-09-19", label: "Sat", orders: 48, completed: 47 },
      { date: "2026-09-20", label: "Sun", orders: 56, completed: 55 },
      { date: "2026-09-21", label: "Mon", orders: 24, completed: 23 },
      { date: "2026-09-22", label: "Tue", orders: 29, completed: 28 },
      { date: "2026-09-23", label: "Wed", orders: 34, completed: 33 },
      { date: today, label: "Today", orders: Math.max(20, this.orders.length), completed: Math.max(14, metrics.completed) },
    ];

    const recentOrders = this.orders.slice(0, 8);
    const upcoming = this.orders.filter((o) => ["PENDING", "CONFIRMED", "PREPARING"].includes(o.status)).slice(0, 5);

    const recentHistory = this.orders
      .flatMap((o) => (o.history || []).map((h) => ({ ...h, order: { orderNumber: o.orderNumber } })))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    const openAlerts = this.alerts.filter((a) => a.status === "OPEN").map((a) => ({
      ...a,
      order: { orderNumber: "BT-1001" },
    }));

    return {
      metrics,
      series,
      recentOrders,
      upcoming,
      recentHistory,
      openAlerts,
    };
  }

  public getAlerts(status?: string): Alert[] {
    if (!status || status === "ALL") return this.alerts;
    return this.alerts.filter((a) => a.status === status);
  }

  public ackAlert(id: string): Alert {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw new Error("Alert not found");
    alert.status = "ACKNOWLEDGED";
    const actor = this.currentUser || INITIAL_USERS[1];
    alert.acknowledgedBy = { name: actor.name };
    this.save();
    return alert;
  }

  public resolveAlert(id: string): Alert {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) throw new Error("Alert not found");
    alert.status = "RESOLVED";
    this.save();
    return alert;
  }

  public getNotifications(): { items: NotificationItem[]; unread: number } {
    if (!this.currentUser) {
      return { items: [], unread: 0 };
    }
    let userNotifs = this.notifications;
    if (this.currentUser.role === "CUSTOMER") {
      const userOrderIds = new Set(this.orders.filter((o) => o.customer?.id === this.currentUser!.id).map((o) => o.id));
      userNotifs = this.notifications.filter((n) => !n.orderId || userOrderIds.has(n.orderId));
    }
    const unread = userNotifs.filter((n) => !n.read).length;
    return { items: userNotifs, unread };
  }

  public markNotificationRead(id: string) {
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
    this.save();
  }

  public markAllNotificationsRead() {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.save();
  }
}

export const mockBackend = new MockBackend();

export type MockStoreEvent = {
  type: string;
  orderId?: string;
  orderNumber?: string;
  status?: string;
  waitedMinutes?: number;
};

type MockStoreListener = (event: MockStoreEvent) => void;
const mockStoreListeners = new Set<MockStoreListener>();

export function subscribeMockStore(listener: MockStoreListener): () => void {
  mockStoreListeners.add(listener);
  return () => {
    mockStoreListeners.delete(listener);
  };
}

export function emitMockStore(event: MockStoreEvent) {
  mockStoreListeners.forEach((fn) => {
    try {
      fn(event);
    } catch {
      // safe fallback
    }
  });
}
