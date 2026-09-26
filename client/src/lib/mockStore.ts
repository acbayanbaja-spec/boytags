import type { Alert, Category, NotificationItem, Order, OrderStatus, Product, User } from "@/types";

const images = {
  whole: "/images/dishes/whole-lechon.jpg",
  half: "/images/dishes/half-lechon.jpg",
  spicyLechon: "/images/dishes/spicy-lechon.jpg",
  inasal: "/images/dishes/inasal.jpg",
  fried: "/images/dishes/fried.jpg",
  liempo: "/images/dishes/liempo.jpg",
  sisig: "/images/dishes/sisig.jpg",
  bangus: "/images/dishes/bangus.jpg",
  bilao: "/images/dishes/fiesta-bilao.jpg",
  javaRice: "/images/dishes/java-rice.jpg",
  garlicRice: "/images/dishes/garlic-rice.jpg",
  sauce: "/images/dishes/sawsawan.jpg",
  atchara: "/images/dishes/atchara.jpg",
  calamansi: "/images/dishes/calamansi.jpg",
  sago: "/images/dishes/sago.jpg",
  bukoPandan: "/images/dishes/buko-pandan.jpg",
  haloHalo: "/images/dishes/halo-halo.jpg",
  drinks: "/images/dishes/drinks-bottles.jpg",
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
  { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok", description: "Slow-roasted whole chicken, Boytag's signature with garlic & lemongrass.", sortOrder: 1 },
  { id: "cat_bilao", name: "Barkada & Bilao", slug: "barkada-bilao", description: "Party bilao platters and bundles for celebrations and family gatherings.", sortOrder: 2 },
  { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried", description: "Inasal skewers, charcoal-grilled pork liempo, and sizzling sisig.", sortOrder: 3 },
  { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides", description: "Golden Java rice, garlic sinangag, atchara, and house sawsawan trio.", sortOrder: 4 },
  { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks", description: "Ice-cold native calamansi, sago't gulaman, buko pandan, and halo-halo.", sortOrder: 5 },
];

export const INITIAL_PRODUCTS: Product[] = [
  // Lechon Manok
  {
    id: "prod_whole",
    name: "Whole Lechon Manok",
    slug: "whole-lechon-manok",
    description: "Crisp golden crackling skin, juicy tender meat, stuffed with fresh garlic and native lemongrass. Charcoal-roasted live at our Tupi pit.",
    price: 380,
    imageUrl: images.whole,
    availableQty: 28,
    soldOut: false,
    active: true,
    badge: "★ #1 Bestseller",
    isBestseller: true,
    servings: "Serves 4–5",
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_half",
    name: "Half Lechon Manok",
    slug: "half-lechon-manok",
    description: "The same roast chicken, portioned generously for a hearty solo feast or a pair. Served fresh from the roaster.",
    price: 210,
    imageUrl: images.half,
    availableQty: 20,
    soldOut: false,
    active: true,
    badge: "Pair Favorite",
    servings: "Serves 1–2",
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },
  {
    id: "prod_spicy_lechon",
    name: "Spicy Labuyo Lechon Manok",
    slug: "spicy-labuyo-lechon-manok",
    description: "Whole roasted chicken infused with crushed red sili labuyo, peppercorns, and aromatics. Fiery aroma and succulent kick.",
    price: 395,
    imageUrl: images.spicyLechon,
    availableQty: 15,
    soldOut: false,
    active: true,
    badge: "🌶️ Extra Spicy",
    isSpicy: true,
    servings: "Serves 4–5",
    category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
  },

  // Bilao & Party Feasts
  {
    id: "prod_fiesta_bilao",
    name: "Barkada Fiesta Roast Bilao",
    slug: "barkada-fiesta-roast-bilao",
    description: "The ultimate feast: 1 Whole Lechon Manok, 4 pcs Chicken Inasal skewers, 2 cuts Grilled Liempo, Sizzling Sisig, 6 cups Java Rice, atchara, and 4 sawsawan sets in a traditional round bilao.",
    price: 999,
    imageUrl: images.bilao,
    availableQty: 10,
    soldOut: false,
    active: true,
    badge: "👑 Giant Bilao Platter",
    isBestseller: true,
    servings: "Feeds 6–8",
    category: { id: "cat_bilao", name: "Barkada & Bilao", slug: "barkada-bilao" },
  },
  {
    id: "prod_family_combo",
    name: "Family Salu-Salo Platter",
    slug: "family-salu-salo-platter",
    description: "1 Whole Lechon Manok, 1 thick slab Charcoal Liempo, 4 cups Java Rice, 1 Bottle Boytag's Spiced Vinegar, and house gravy.",
    price: 699,
    imageUrl: images.bilao,
    availableQty: 12,
    soldOut: false,
    active: true,
    badge: "Family Favorite",
    servings: "Feeds 4–5",
    category: { id: "cat_bilao", name: "Barkada & Bilao", slug: "barkada-bilao" },
  },

  // Grilled & Sizzling
  {
    id: "prod_liempo",
    name: "Grilled Pork Liempo",
    slug: "grilled-liempo",
    description: "Thick-cut, juicy pork belly marinated in calamansi and sweet-savory spices, charcoal-grilled over coconut hardwood with atchara.",
    price: 185,
    imageUrl: images.liempo,
    availableQty: 18,
    soldOut: false,
    active: true,
    badge: "Charcoal Kissed",
    servings: "Solo / Pair",
    category: { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried" },
  },
  {
    id: "prod_inasal",
    name: "Chicken Inasal (2 pcs)",
    slug: "chicken-inasal",
    description: "Char-grilled quarters brushed with annatto oil and native spices. Served with toyomansi, fresh native calamansi, and sili labuyo.",
    price: 165,
    imageUrl: images.inasal,
    availableQty: 30,
    soldOut: false,
    active: true,
    badge: "Chef's Cut",
    servings: "Solo Meal",
    category: { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried" },
  },
  {
    id: "prod_sisig",
    name: "Sizzling Lechon Chicken Sisig",
    slug: "sizzling-lechon-chicken-sisig",
    description: "Chopped roast chicken tossed on a hot cast iron plate with crisp white onions, green chilies, calamansi, chicken liver sauce, topped with fresh egg.",
    price: 195,
    imageUrl: images.sisig,
    availableQty: 22,
    soldOut: false,
    active: true,
    badge: "Sizzling Hot",
    isSpicy: true,
    servings: "Good for 2",
    category: { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried" },
  },
  {
    id: "prod_fried",
    name: "Crispy Double-Fried Chicken",
    slug: "crispy-fried-chicken",
    description: "Buttermilk-brined, double golden-fried chicken pieces with crunchy seasoned crust. Served with Boytag's house chicken gravy.",
    price: 149,
    imageUrl: images.fried,
    availableQty: 25,
    soldOut: false,
    active: true,
    badge: "Extra Crunchy",
    servings: "Solo Meal",
    category: { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried" },
  },
  {
    id: "prod_bangus",
    name: "Grilled Boneless Bangus",
    slug: "grilled-boneless-bangus",
    description: "Jumbo boneless milkfish stuffed with diced native tomatoes, red onions, and ginger, wrapped and charcoal-grilled to tender perfection.",
    price: 240,
    imageUrl: images.bangus,
    availableQty: 14,
    soldOut: false,
    active: true,
    badge: "Fresh Seafood",
    servings: "Serves 2–3",
    category: { id: "cat_grilled", name: "Grilled & Sizzling", slug: "grilled-fried" },
  },

  // Rice & Sides
  {
    id: "prod_java",
    name: "Java Rice (Special)",
    slug: "java-rice",
    description: "Annatto and garlic-scented rice tossed with golden butter. The quintessential partner for roasted lechon and grilled liempo.",
    price: 35,
    imageUrl: images.javaRice,
    availableQty: 100,
    soldOut: false,
    active: true,
    badge: "Must-Have Side",
    servings: "1 Generous Cup",
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_garlic",
    name: "Garlic Sinangag Rice",
    slug: "garlic-rice",
    description: "Fluffy steamed rice fried in fragrant garlic oil with lots of crispy golden toasted garlic chips on top.",
    price: 35,
    imageUrl: images.garlicRice,
    availableQty: 80,
    soldOut: false,
    active: true,
    badge: "Toasted Garlic",
    servings: "1 Generous Cup",
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_sauce",
    name: "House Sawsawan Tri-Pack",
    slug: "sawsawan-set",
    description: "Trio of authentic dipping sauces: Toyomansi with sili labuyo, rich liver lechon sauce, and spicy garlic chili oil in takeout tubs.",
    price: 25,
    imageUrl: images.sauce,
    availableQty: 60,
    soldOut: false,
    active: true,
    badge: "3-in-1 Combo",
    servings: "3 Dipping Cups",
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },
  {
    id: "prod_atchara",
    name: "Special House Atchara (200g)",
    slug: "special-house-atchara",
    description: "Crisp pickled green papaya slaw with julienned carrots, native ginger, bell pepper, and raisins in sweet spiced cane vinegar.",
    price: 35,
    imageUrl: images.atchara,
    availableQty: 45,
    soldOut: false,
    active: true,
    badge: "Refreshing Crunch",
    servings: "1 Tub (200g)",
    category: { id: "cat_extras", name: "Rice & Sides", slug: "rice-sides" },
  },

  // Drinks & Coolers
  {
    id: "prod_calamansi",
    name: "Fresh Iced Calamansi with Honey",
    slug: "iced-calamansi",
    description: "Hand-squeezed native kalamansi juice lightly sweetened with wild mountain honey. Served ice-cold with crushed ice.",
    price: 45,
    imageUrl: images.calamansi,
    availableQty: 50,
    soldOut: false,
    active: true,
    badge: "Pure Wild Honey",
    servings: "16oz Cup",
    category: { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks" },
  },
  {
    id: "prod_sago",
    name: "Classic Sago't Gulaman Cooler",
    slug: "sago-gulaman",
    description: "Fragrant brown sugar caramel syrup, chewy soft tapioca pearls, and refreshing pandan-scented jelly cubes over crushed ice.",
    price: 45,
    imageUrl: images.sago,
    availableQty: 40,
    soldOut: false,
    active: true,
    badge: "All-Time Classic",
    servings: "16oz Cup",
    category: { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks" },
  },
  {
    id: "prod_buko_pandan",
    name: "Creamy Buko Pandan Cooler",
    slug: "creamy-buko-pandan",
    description: "Shredded fresh young coconut strips, bright green pandan jelly, and rich chilled sweet milk over shaved ice.",
    price: 55,
    imageUrl: images.bukoPandan,
    availableQty: 30,
    soldOut: false,
    active: true,
    badge: "Sweet & Creamy",
    servings: "16oz Cup",
    category: { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks" },
  },
  {
    id: "prod_halo_halo",
    name: "Halo-Halo Supreme Especial",
    slug: "halo-halo-supreme-especial",
    description: "Traditional crushed ice treat layered with sweet beans, ube halaya, rich golden leche flan, nata de coco, and toasted pinipig.",
    price: 75,
    imageUrl: images.haloHalo,
    availableQty: 25,
    soldOut: false,
    active: true,
    badge: "Chef's Dessert",
    servings: "Especial Bowl",
    category: { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks" },
  },
  {
    id: "prod_coke_15",
    name: "Coca-Cola 1.5L Party Bottle",
    slug: "coca-cola-15l",
    description: "Ice-cold 1.5 liter Coca-Cola bottle, ideal for family dinners and barkada bilao celebrations.",
    price: 85,
    imageUrl: images.drinks,
    availableQty: 40,
    soldOut: false,
    active: true,
    badge: "Party Size",
    servings: "1.5L Bottle",
    category: { id: "cat_drinks", name: "Drinks & Coolers", slug: "drinks" },
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
  }

  private load() {
    const DATA_VERSION = "v3.2_dishes_and_images_fixed";
    try {
      const u = localStorage.getItem("boytags.mock.users");
      this.users = u ? JSON.parse(u) : INITIAL_USERS;

      const c = localStorage.getItem("boytags.mock.categories");
      const p = localStorage.getItem("boytags.mock.products");
      const savedVersion = localStorage.getItem("boytags.mock.version");

      if (savedVersion !== DATA_VERSION || !p || !c) {
        this.categories = INITIAL_CATEGORIES;
        this.products = INITIAL_PRODUCTS;
        localStorage.setItem("boytags.mock.version", DATA_VERSION);
      } else {
        this.categories = JSON.parse(c);
        this.products = JSON.parse(p);
        // Ensure new dishes or categories are included
        if (this.products.length < INITIAL_PRODUCTS.length) {
          this.products = INITIAL_PRODUCTS;
          this.categories = INITIAL_CATEGORIES;
        }
      }

      // Automatically heal any outdated or broken Unsplash URLs
      this.products.forEach((prod) => {
        if (!prod.imageUrl || prod.imageUrl.includes("1598103442097-8b70429476eb")) {
          prod.imageUrl = "/images/dishes/whole-lechon.jpg";
        }
        if (prod.imageUrl.includes("1544025162-d76690232f46")) {
          prod.imageUrl = "/images/dishes/liempo.jpg";
        }
        if (prod.imageUrl.includes("1516684738272-bd2d19e0a4aa")) {
          prod.imageUrl = "/images/dishes/java-rice.jpg";
        }
        if (prod.imageUrl.includes("1544145945-f9049b5f6440")) {
          prod.imageUrl = "/images/dishes/calamansi.jpg";
        }
      });

      const o = localStorage.getItem("boytags.mock.orders");
      this.orders = o ? JSON.parse(o) : INITIAL_ORDERS;

      const n = localStorage.getItem("boytags.mock.notifications");
      this.notifications = n ? JSON.parse(n) : INITIAL_NOTIFICATIONS;

      const a = localStorage.getItem("boytags.mock.alerts");
      this.alerts = a ? JSON.parse(a) : INITIAL_ALERTS;

      const cur = localStorage.getItem("boytags.mock.current_user");
      this.currentUser = cur ? JSON.parse(cur) : this.users[0];
      this.save();
    } catch {
      this.users = INITIAL_USERS;
      this.categories = INITIAL_CATEGORIES;
      this.products = INITIAL_PRODUCTS;
      this.orders = INITIAL_ORDERS;
      this.notifications = INITIAL_NOTIFICATIONS;
      this.alerts = INITIAL_ALERTS;
      this.currentUser = INITIAL_USERS[0];
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

  public getOrders(user?: User | null): Order[] {
    if (!user || user.role === "STAFF" || user.role === "ADMIN") {
      return this.orders;
    }
    return this.orders.filter((o) => o.customer?.id === user.id);
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
    const user = this.currentUser || INITIAL_USERS[2];
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

    this.notifications.unshift({
      id: `notif_${Date.now()}`,
      orderId: order.id,
      type: "STATUS_UPDATE",
      title: `Order ${order.orderNumber}: ${newStatus.replace(/_/g, " ")}`,
      body: `Your order status changed from ${prevStatus} to ${newStatus}.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    return order;
  }

  public updateOrder(id: string, updates: { customerNotes?: string; scheduledAt?: string }): Order {
    const order = this.getOrder(id);
    if (updates.customerNotes !== undefined) order.customerNotes = updates.customerNotes;
    if (updates.scheduledAt) order.scheduledAt = updates.scheduledAt;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  public cancelOrder(id: string, reason?: string): Order {
    const order = this.getOrder(id);
    order.status = "CANCELLED";
    order.cancelReason = reason || "Cancelled by customer.";
    order.updatedAt = new Date().toISOString();

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
    const unread = this.notifications.filter((n) => !n.read).length;
    return { items: this.notifications, unread };
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
