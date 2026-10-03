export const navGroups: [string, [string, string, string, string?][]][] = [
  [
    "Atelier",
    [
      ["overview", "Overview", "overview", "4"],
      ["calendar", "Calendar", "calendar"],
      ["appointments", "Appointments", "clock", "3"],
      ["commissions", "Commissions", "layers", "6"],
      ["production", "Production", "scissors"],
      ["measurements", "Measurements", "ruler"],
      ["assets", "Assets", "image", "12"],
    ],
  ],
  [
    "Commerce",
    [
      ["orders", "Orders", "bag", "8"],
      ["customers", "Customers", "users"],
      ["catalogue", "Catalogue", "box"],
    ],
  ],
];
export const menus: Record<string, { label: string; options: string[] }> = {
  market: {
    label: "Operating context",
    options: [
      "Lagos studio · NGN",
      "London studio · GBP",
      "All studios · Mixed",
    ],
  },
  range: {
    label: "Reporting period",
    options: ["Today", "This week", "Last 30 days", "This quarter"],
  },
  status: {
    label: "Appointment status",
    options: [
      "All statuses",
      "Requested",
      "Confirmed",
      "Completed",
      "Cancelled",
    ],
  },
  appointmentType: {
    label: "Appointment type",
    options: [
      "All appointment types",
      "Consultation",
      "Fitting",
      "Measurements",
      "Follow-up",
    ],
  },
  room: {
    label: "Location",
    options: [
      "All rooms",
      "Studio 1",
      "Studio 2",
      "Virtual",
      "Customer location",
    ],
  },
  team: {
    label: "Assigned team",
    options: ["All makers", "Cutting team", "Sewing team", "Finishing team"],
  },
  measurementStatus: {
    label: "Profile status",
    options: [
      "All profiles",
      "Needs review",
      "Atelier measured",
      "Client submitted",
    ],
  },
  category: {
    label: "Asset category",
    options: [
      "All categories",
      "Sketches",
      "Fabric",
      "Fittings",
      "Quality control",
    ],
  },
  assetSort: {
    label: "Sort assets",
    options: ["Recently added", "Oldest first", "File name", "Category"],
  },
  productionSort: {
    label: "Sort production",
    options: ["Target date", "Stage", "Maker", "Health"],
  },
  orderStatus: {
    label: "Payment status",
    options: ["All statuses", "Paid", "Authorised", "Pending", "Refunded"],
  },
  segment: {
    label: "Client segment",
    options: [
      "All segments",
      "Bridal",
      "Bespoke",
      "Ready-to-wear",
      "International",
    ],
  },
  collection: {
    label: "Collection",
    options: ["Linear Summer 26", "Bridal 26", "Core collection", "Archive"],
  },
  productStatus: {
    label: "Product status",
    options: ["All statuses", "Live", "Draft", "Review"],
  },
  notifications: {
    label: "Notifications",
    options: [
      "Measurements missing · NE-00241",
      "Fitting starts in 30 minutes",
      "Two garments passed target date",
    ],
  },
};
export const apptRows = [
  [
    "AO",
    "Ada Okafor",
    "Bridal fitting",
    "24 Sep · 10:30",
    "Studio 1",
    "Confirmed",
    "green",
  ],
  [
    "CN",
    "Chioma Nwosu",
    "Consultation",
    "24 Sep · 12:00",
    "In-store",
    "Requested",
    "blue",
  ],
  [
    "NE",
    "Nneka Eze",
    "Follow-up",
    "24 Sep · 14:30",
    "Virtual",
    "Confirmed",
    "green",
  ],
  [
    "LA",
    "Lola Adeyemi",
    "Fitting",
    "24 Sep · 16:00",
    "Customer location",
    "Unconfirmed",
    "amber",
  ],
  [
    "TA",
    "Temi Adeola",
    "Bridal consultation",
    "25 Sep · 12:45",
    "Studio 2",
    "Requested",
    "blue",
  ],
  [
    "ZO",
    "Zainab Olaniyi",
    "Measurements",
    "25 Sep · 15:10",
    "Studio 1",
    "Cancelled",
    "red",
  ],
];
export const jobs = [
  ["NE-00241", "Ada Okafor", "Dewdrop bridal gown", "28 Sep", "AO"],
  ["NE-00238", "Nneka Eze", "Ivory silk set", "30 Sep", "BS"],
  ["NE-00237", "Lola Adeyemi", "Midnight Jewel", "02 Oct", "GA"],
  ["NE-00236", "Temi Adeola", "Bespoke column dress", "04 Oct", "AA"],
  ["NE-00234", "Zainab Olaniyi", "Tokyo mini · custom", "07 Oct", "BS"],
  ["NE-00229", "Muna Bello", "Bloom gown · olive", "Past due", "GA"],
];
export const calendarModes = ["Day", "Week", "Month", "List"];
export const drawerLabels: Record<string, string> = {
  "New appointment": "appointment",
  "New commission": "commission",
  "Add production note": "note",
  "New profile": "profile",
  "Create order": "order",
  "Add client": "client",
  "Add product": "product",
  "Import CSV": "csv",
};
export const formConfigs: Record<
  string,
  {
    eyebrow: string;
    title: string;
    submit: string;
    fields: [string, string, string, string][];
  }
> = {
  appointment: {
    eyebrow: "Calendar / New",
    title: "Create appointment",
    submit: "Add appointment",
    fields: [
      ["client", "Client name", "text", "Ada Okafor"],
      ["purpose", "Purpose", "text", "Bridal fitting"],
      ["date", "Date", "date", ""],
      ["time", "Time", "time", ""],
      ["location", "Location", "text", "Studio 1"],
      ["notes", "Notes", "textarea", "Fit notes or preparation details"],
    ],
  },
  commission: {
    eyebrow: "Atelier / New",
    title: "Create commission",
    submit: "Add commission",
    fields: [
      ["client", "Client name", "text", ""],
      ["garment", "Garment", "text", ""],
      ["target", "Target date", "date", ""],
      ["maker", "Assigned maker", "text", ""],
      ["brief", "Brief", "textarea", "Construction, fabric and finish notes"],
    ],
  },
  note: {
    eyebrow: "Production / Note",
    title: "Add production note",
    submit: "Save note",
    fields: [
      ["reference", "Commission reference", "text", "NE-00241"],
      ["stage", "Production stage", "text", "Cutting"],
      ["note", "Note", "textarea", "Add a clear handoff or quality note"],
    ],
  },
  profile: {
    eyebrow: "Measurements / New",
    title: "Create measurement profile",
    submit: "Add profile",
    fields: [
      ["client", "Client name", "text", ""],
      ["bust", "Bust, cm", "number", ""],
      ["waist", "Waist, cm", "number", ""],
      ["hip", "Hip, cm", "number", ""],
      ["source", "Measurement source", "text", "Atelier measured"],
      ["notes", "Fit notes", "textarea", "Optional posture, ease or fit notes"],
    ],
  },
  order: {
    eyebrow: "Commerce / New",
    title: "Create order",
    submit: "Add order",
    fields: [
      ["client", "Client name", "text", ""],
      ["total", "Order total", "number", ""],
      ["currency", "Currency", "text", "NGN"],
      ["fulfilment", "Fulfilment stage", "text", "Atelier"],
      [
        "notes",
        "Order notes",
        "textarea",
        "Optional payment or delivery notes",
      ],
    ],
  },
  client: {
    eyebrow: "Clients / New",
    title: "Add client",
    submit: "Add client",
    fields: [
      ["name", "Full name", "text", ""],
      ["email", "Email", "email", ""],
      ["phone", "Phone", "tel", ""],
      ["segment", "Client segment", "text", "Bespoke"],
      ["notes", "Notes", "textarea", "Preferences, context or service notes"],
    ],
  },
  account: {
    eyebrow: "Profile / Identity",
    title: "Edit operator profile",
    submit: "Save profile",
    fields: [
      ["name", "Display name", "text", "Ghost69"],
      ["email", "Work email", "email", "ghost69@neloatelier.com"],
      ["phone", "Phone", "tel", "+234 803 555 0198"],
      ["studio", "Primary studio", "text", "Lagos"],
      ["role", "Role", "text", "Operations lead"],
      [
        "bio",
        "Operator note",
        "textarea",
        "Coordinates front desk, fittings and atelier production.",
      ],
    ],
  },
  product: {
    eyebrow: "Catalogue / New",
    title: "Add product",
    submit: "Add product",
    fields: [
      ["name", "Product name", "text", ""],
      ["sku", "SKU", "text", "NL-LS26-"],
      ["price", "Price", "number", ""],
      ["collection", "Collection", "text", "Linear Summer 26"],
      ["status", "Release status", "text", "Draft"],
      [
        "description",
        "Description",
        "textarea",
        "Short internal catalogue description",
      ],
    ],
  },
};
