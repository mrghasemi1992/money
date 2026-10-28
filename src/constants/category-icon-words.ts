import type { CategoryIcon, CategoryIconWords } from "@/types/category";

/**
 * The picker's themes, in order. Their names are the `categoryIcons.groups` messages.
 */
export const CATEGORY_ICON_GROUPS = [
  "food",
  "shopping",
  "home",
  "transport",
  "health",
  "people",
  "leisure",
  "work",
  "money",
  "other",
] as const;

/**
 * Each category icon's theme and the words that find it, in both languages: the first word is
 * its name (the swatch's label), the others are what people call such a category. The picker
 * searches them, and `guessCategoryIcon` matches them against the names of categories the app
 * creates (CSV import). Loaded lazily by the picker; listed in the picker's order.
 */
export const CATEGORY_ICON_WORDS: Record<CategoryIcon, CategoryIconWords> = {
  utensils: {
    group: "food",
    fa: ["خوراک", "غذا", "رستوران", "خوراکی"],
    en: ["Food", "meals", "restaurant", "dining"],
  },
  "shopping-basket": {
    group: "food",
    fa: ["سوپرمارکت", "خواربار", "بقالی", "هایپر"],
    en: ["Groceries", "supermarket", "grocery"],
  },
  coffee: {
    group: "food",
    fa: ["قهوه", "کافه", "کافی‌شاپ", "چای"],
    en: ["Coffee", "café", "cafe", "tea"],
  },
  "cup-soda": {
    group: "food",
    fa: ["نوشیدنی", "نوشابه", "آبمیوه"],
    en: ["Drinks", "soda", "juice", "beverages"],
  },
  pizza: {
    group: "food",
    fa: ["پیتزا", "فست‌فود"],
    en: ["Pizza", "fast food", "takeaway"],
  },
  sandwich: {
    group: "food",
    fa: ["ساندویچ", "ناهار"],
    en: ["Sandwich", "lunch"],
  },
  croissant: {
    group: "food",
    fa: ["نان", "نانوایی", "صبحانه"],
    en: ["Bread", "bakery", "breakfast"],
  },
  apple: {
    group: "food",
    fa: ["میوه"],
    en: ["Fruit"],
  },
  carrot: {
    group: "food",
    fa: ["سبزیجات", "سبزی", "تره‌بار"],
    en: ["Vegetables", "produce"],
  },
  beef: {
    group: "food",
    fa: ["گوشت", "قصابی", "مرغ"],
    en: ["Meat", "butcher", "chicken"],
  },
  fish: {
    group: "food",
    fa: ["ماهی", "غذای دریایی"],
    en: ["Fish", "seafood"],
  },
  egg: {
    group: "food",
    fa: ["تخم‌مرغ"],
    en: ["Eggs"],
  },
  milk: {
    group: "food",
    fa: ["لبنیات", "شیر", "ماست", "پنیر"],
    en: ["Dairy", "milk", "cheese"],
  },
  cookie: {
    group: "food",
    fa: ["شیرینی", "تنقلات", "شکلات"],
    en: ["Sweets", "snacks", "chocolate"],
  },
  "ice-cream-cone": {
    group: "food",
    fa: ["بستنی", "دسر"],
    en: ["Ice cream", "dessert"],
  },
  cake: {
    group: "food",
    fa: ["کیک", "تولد"],
    en: ["Cake", "birthday"],
  },
  soup: {
    group: "food",
    fa: ["سوپ", "آش"],
    en: ["Soup"],
  },
  salad: {
    group: "food",
    fa: ["سالاد", "رژیم"],
    en: ["Salad", "diet"],
  },
  "chef-hat": {
    group: "food",
    fa: ["آشپزی", "آشپزخانه"],
    en: ["Cooking", "kitchen"],
  },

  "shopping-cart": {
    group: "shopping",
    fa: ["خرید", "خریدها"],
    en: ["Shopping", "purchases"],
  },
  "shopping-bag": {
    group: "shopping",
    fa: ["فروشگاه", "خرید روزانه"],
    en: ["Store", "shopping bag"],
  },
  store: {
    group: "shopping",
    fa: ["مغازه", "بازار"],
    en: ["Shop", "market"],
  },
  package: {
    group: "shopping",
    fa: ["خرید اینترنتی", "بسته", "سفارش"],
    en: ["Online shopping", "package", "orders"],
  },
  shirt: {
    group: "shopping",
    fa: ["پوشاک", "لباس", "کفش"],
    en: ["Clothing", "clothes", "shoes"],
  },
  gem: {
    group: "shopping",
    fa: ["طلا", "جواهر", "زیورآلات"],
    en: ["Jewelry", "gold"],
  },
  watch: {
    group: "shopping",
    fa: ["ساعت", "اکسسوری"],
    en: ["Watch", "accessories"],
  },
  glasses: {
    group: "shopping",
    fa: ["عینک"],
    en: ["Glasses"],
  },
  sparkles: {
    group: "shopping",
    fa: ["آرایش", "زیبایی", "لوازم آرایشی"],
    en: ["Beauty", "cosmetics", "makeup"],
  },
  smartphone: {
    group: "shopping",
    fa: ["موبایل", "گوشی", "شارژ سیم‌کارت"],
    en: ["Mobile", "phone", "top-up"],
  },
  laptop: {
    group: "shopping",
    fa: ["لپ‌تاپ", "کامپیوتر", "کار آزاد"],
    en: ["Laptop", "computer", "freelance"],
  },
  headphones: {
    group: "shopping",
    fa: ["هدفون", "صوتی"],
    en: ["Headphones", "audio"],
  },
  tv: {
    group: "shopping",
    fa: ["تلویزیون", "لوازم الکترونیکی"],
    en: ["TV", "electronics"],
  },
  gift: {
    group: "shopping",
    fa: ["هدیه", "کادو", "هدایا"],
    en: ["Gifts", "gift", "presents"],
  },

  house: {
    group: "home",
    fa: ["خانه", "مسکن", "منزل"],
    en: ["Home", "housing", "house"],
  },
  "key-round": {
    group: "home",
    fa: ["اجاره", "رهن", "اجاره‌بها"],
    en: ["Rent", "lease"],
  },
  receipt: {
    group: "home",
    fa: ["قبوض", "قبض", "صورت‌حساب"],
    en: ["Bills", "utilities", "bill"],
  },
  zap: {
    group: "home",
    fa: ["برق"],
    en: ["Electricity", "power"],
  },
  droplet: {
    group: "home",
    fa: ["آب"],
    en: ["Water"],
  },
  flame: {
    group: "home",
    fa: ["گاز", "گرمایش"],
    en: ["Gas", "heating"],
  },
  wifi: {
    group: "home",
    fa: ["اینترنت", "وای‌فای"],
    en: ["Internet", "wifi", "broadband"],
  },
  phone: {
    group: "home",
    fa: ["تلفن", "تلفن ثابت"],
    en: ["Telephone", "landline"],
  },
  "building-2": {
    group: "home",
    fa: ["شارژ ساختمان", "ساختمان", "آپارتمان"],
    en: ["Building fees", "building", "apartment"],
  },
  wrench: {
    group: "home",
    fa: ["تعمیرات", "تعمیر", "نگهداری"],
    en: ["Repairs", "maintenance"],
  },
  hammer: {
    group: "home",
    fa: ["ابزار", "بازسازی"],
    en: ["Tools", "renovation"],
  },
  "paint-roller": {
    group: "home",
    fa: ["دکوراسیون", "نقاشی ساختمان"],
    en: ["Decoration", "painting"],
  },
  sofa: {
    group: "home",
    fa: ["مبلمان", "مبل", "اثاثیه"],
    en: ["Furniture", "sofa"],
  },
  lamp: {
    group: "home",
    fa: ["لوازم خانه", "وسایل خانه"],
    en: ["Home goods", "household"],
  },
  "washing-machine": {
    group: "home",
    fa: ["لوازم برقی", "لباسشویی", "خشکشویی"],
    en: ["Appliances", "laundry", "dry cleaning"],
  },
  refrigerator: {
    group: "home",
    fa: ["یخچال", "لوازم آشپزخانه"],
    en: ["Fridge", "kitchenware"],
  },
  "spray-can": {
    group: "home",
    fa: ["نظافت", "شوینده", "بهداشتی"],
    en: ["Cleaning", "detergent", "toiletries"],
  },
  bed: {
    group: "home",
    fa: ["تخت", "خواب", "کالای خواب"],
    en: ["Bed", "bedding"],
  },
  "flower-2": {
    group: "home",
    fa: ["گل", "گیاه", "باغچه"],
    en: ["Flowers", "plants", "garden"],
  },

  "car-front": {
    group: "transport",
    fa: ["خودرو", "ماشین", "حمل‌ونقل", "رفت‌وآمد"],
    en: ["Car", "transport", "commute"],
  },
  "car-taxi-front": {
    group: "transport",
    fa: ["تاکسی", "اسنپ", "تپسی", "آژانس"],
    en: ["Taxi", "ride", "cab"],
  },
  fuel: {
    group: "transport",
    fa: ["سوخت", "بنزین", "پمپ بنزین"],
    en: ["Fuel", "petrol", "gas station"],
  },
  bus: {
    group: "transport",
    fa: ["اتوبوس", "حمل‌ونقل عمومی"],
    en: ["Bus", "public transport"],
  },
  "train-front": {
    group: "transport",
    fa: ["مترو", "قطار"],
    en: ["Metro", "train", "subway"],
  },
  plane: {
    group: "transport",
    fa: ["پرواز", "هواپیما", "بلیت هواپیما"],
    en: ["Flights", "plane", "airfare"],
  },
  bike: {
    group: "transport",
    fa: ["دوچرخه"],
    en: ["Bike", "bicycle"],
  },
  motorbike: {
    group: "transport",
    fa: ["موتورسیکلت", "موتور"],
    en: ["Motorbike", "motorcycle", "scooter"],
  },
  "circle-parking": {
    group: "transport",
    fa: ["پارکینگ", "پارک"],
    en: ["Parking"],
  },
  truck: {
    group: "transport",
    fa: ["باربری", "اسباب‌کشی", "پیک"],
    en: ["Moving", "delivery", "courier"],
  },
  ship: {
    group: "transport",
    fa: ["کشتی", "قایق"],
    en: ["Ferry", "boat"],
  },
  "traffic-cone": {
    group: "transport",
    fa: ["عوارض", "جریمه", "خلافی"],
    en: ["Tolls", "fines", "traffic"],
  },

  "heart-pulse": {
    group: "health",
    fa: ["سلامت", "درمان", "بهداشت"],
    en: ["Health", "healthcare", "medical"],
  },
  pill: {
    group: "health",
    fa: ["دارو", "داروخانه"],
    en: ["Pharmacy", "medicine", "drugs"],
  },
  stethoscope: {
    group: "health",
    fa: ["پزشک", "دکتر", "ویزیت"],
    en: ["Doctor", "physician", "checkup"],
  },
  hospital: {
    group: "health",
    fa: ["بیمارستان", "درمانگاه", "کلینیک"],
    en: ["Hospital", "clinic"],
  },
  syringe: {
    group: "health",
    fa: ["آزمایش", "واکسن", "تزریق"],
    en: ["Lab tests", "vaccine"],
  },
  smile: {
    group: "health",
    fa: ["دندان‌پزشکی", "دندان"],
    en: ["Dentist", "dental"],
  },
  eye: {
    group: "health",
    fa: ["چشم‌پزشکی", "بینایی"],
    en: ["Eye care", "optician"],
  },
  brain: {
    group: "health",
    fa: ["روان‌شناسی", "مشاوره", "روان‌درمانی"],
    en: ["Therapy", "mental health", "counseling"],
  },
  dumbbell: {
    group: "health",
    fa: ["باشگاه", "ورزش", "بدنسازی"],
    en: ["Gym", "fitness", "workout"],
  },
  bath: {
    group: "health",
    fa: ["حمام", "بهداشت شخصی", "مراقبت شخصی"],
    en: ["Personal care", "hygiene", "bath"],
  },
  scissors: {
    group: "health",
    fa: ["آرایشگاه", "سلمانی", "پیرایش"],
    en: ["Haircut", "barber", "salon"],
  },

  users: {
    group: "people",
    fa: ["خانواده", "خانوار"],
    en: ["Family", "household"],
  },
  user: {
    group: "people",
    fa: ["شخصی", "خودم"],
    en: ["Personal", "me"],
  },
  baby: {
    group: "people",
    fa: ["کودک", "بچه", "نوزاد", "فرزند"],
    en: ["Kids", "baby", "children"],
  },
  heart: {
    group: "people",
    fa: ["همسر", "عشق", "دوست"],
    en: ["Partner", "love", "friends"],
  },
  "party-popper": {
    group: "people",
    fa: ["مهمانی", "جشن", "عروسی"],
    en: ["Party", "celebration", "wedding"],
  },
  "hand-heart": {
    group: "people",
    fa: ["خیریه", "کمک", "نذر", "صدقه"],
    en: ["Charity", "donation", "giving"],
  },
  "paw-print": {
    group: "people",
    fa: ["حیوان خانگی", "دامپزشک"],
    en: ["Pets", "vet"],
  },
  dog: {
    group: "people",
    fa: ["سگ"],
    en: ["Dog"],
  },
  cat: {
    group: "people",
    fa: ["گربه"],
    en: ["Cat"],
  },
  cigarette: {
    group: "people",
    fa: ["سیگار", "دخانیات", "قلیان"],
    en: ["Smoking", "tobacco", "cigarettes"],
  },

  popcorn: {
    group: "leisure",
    fa: ["تفریح", "سرگرمی"],
    en: ["Leisure", "entertainment", "fun"],
  },
  film: {
    group: "leisure",
    fa: ["سینما", "فیلم"],
    en: ["Cinema", "movies", "film"],
  },
  "tv-minimal-play": {
    group: "leisure",
    fa: ["فیلم و سریال", "استریم"],
    en: ["Streaming", "series"],
  },
  repeat: {
    group: "leisure",
    fa: ["اشتراک‌ها", "اشتراک", "حق عضویت"],
    en: ["Subscriptions", "subscription", "membership"],
  },
  music: {
    group: "leisure",
    fa: ["موسیقی", "کنسرت"],
    en: ["Music", "concert"],
  },
  ticket: {
    group: "leisure",
    fa: ["بلیت", "بلیط", "رویداد"],
    en: ["Tickets", "events"],
  },
  "gamepad-2": {
    group: "leisure",
    fa: ["بازی", "گیم"],
    en: ["Games", "gaming"],
  },
  "book-open": {
    group: "leisure",
    fa: ["کتاب", "مطالعه"],
    en: ["Books", "reading"],
  },
  palette: {
    group: "leisure",
    fa: ["هنر", "سرگرمی‌ها"],
    en: ["Art", "hobbies"],
  },
  camera: {
    group: "leisure",
    fa: ["عکاسی", "دوربین"],
    en: ["Photography", "camera"],
  },
  volleyball: {
    group: "leisure",
    fa: ["ورزش‌ها", "فوتبال", "والیبال"],
    en: ["Sports", "football", "volleyball"],
  },
  waves: {
    group: "leisure",
    fa: ["استخر", "شنا"],
    en: ["Pool", "swimming"],
  },
  trophy: {
    group: "leisure",
    fa: ["مسابقه", "جایزه مسابقه"],
    en: ["Competitions", "prize"],
  },
  luggage: {
    group: "leisure",
    fa: ["سفر", "مسافرت"],
    en: ["Travel", "trip"],
  },
  "tree-palm": {
    group: "leisure",
    fa: ["تعطیلات", "سفر تفریحی"],
    en: ["Vacation", "holiday"],
  },
  hotel: {
    group: "leisure",
    fa: ["هتل", "اقامت"],
    en: ["Hotel", "accommodation", "lodging"],
  },
  tent: {
    group: "leisure",
    fa: ["کمپینگ", "طبیعت‌گردی"],
    en: ["Camping", "outdoors"],
  },
  mountain: {
    group: "leisure",
    fa: ["کوه", "کوهنوردی"],
    en: ["Hiking", "mountains"],
  },
  map: {
    group: "leisure",
    fa: ["گردش", "تور"],
    en: ["Sightseeing", "tours"],
  },

  "briefcase-business": {
    group: "work",
    fa: ["حقوق", "کار", "شغل", "درآمد کاری"],
    en: ["Salary", "work", "job", "wages"],
  },
  building: {
    group: "work",
    fa: ["شرکت", "دفتر", "کسب‌وکار"],
    en: ["Office", "company", "business"],
  },
  handshake: {
    group: "work",
    fa: ["قرارداد", "مشاوره کاری", "پروژه"],
    en: ["Contracts", "consulting", "projects"],
  },
  award: {
    group: "work",
    fa: ["پاداش", "عیدی", "جایزه"],
    en: ["Bonus", "award", "reward"],
  },
  "graduation-cap": {
    group: "work",
    fa: ["آموزش", "دانشگاه", "شهریه", "تحصیل"],
    en: ["Education", "university", "tuition"],
  },
  school: {
    group: "work",
    fa: ["مدرسه"],
    en: ["School"],
  },
  presentation: {
    group: "work",
    fa: ["دوره", "کلاس", "کارگاه"],
    en: ["Courses", "classes", "workshops"],
  },
  languages: {
    group: "work",
    fa: ["زبان", "کلاس زبان"],
    en: ["Languages", "language classes"],
  },
  "notebook-pen": {
    group: "work",
    fa: ["لوازم‌التحریر", "نوشت‌افزار"],
    en: ["Stationery", "supplies"],
  },
  printer: {
    group: "work",
    fa: ["چاپ", "کپی", "تکثیر"],
    en: ["Printing", "copies"],
  },
  code: {
    group: "work",
    fa: ["برنامه‌نویسی", "نرم‌افزار"],
    en: ["Software", "programming"],
  },
  "file-text": {
    group: "work",
    fa: ["اسناد", "مدارک", "دفتر اسناد"],
    en: ["Documents", "paperwork"],
  },

  wallet: {
    group: "money",
    fa: ["کیف پول", "پول", "مالی"],
    en: ["Wallet", "money", "finance"],
  },
  banknote: {
    group: "money",
    fa: ["نقد", "پول نقد", "اسکناس", "حقوق ماهانه"],
    en: ["Cash", "banknotes", "monthly salary"],
  },
  coins: {
    group: "money",
    fa: ["سایر درآمدها", "درآمد", "سکه"],
    en: ["Other income", "income", "coins"],
  },
  "piggy-bank": {
    group: "money",
    fa: ["پس‌انداز", "اندوخته"],
    en: ["Savings", "saving"],
  },
  landmark: {
    group: "money",
    fa: ["بانک", "کارمزد بانکی"],
    en: ["Bank", "bank fees"],
  },
  "credit-card": {
    group: "money",
    fa: ["کارت", "کارت اعتباری", "قسط"],
    en: ["Card", "credit card", "installments"],
  },
  "hand-coins": {
    group: "money",
    fa: ["وام", "قرض", "بدهی"],
    en: ["Loans", "debt", "borrowing"],
  },
  percent: {
    group: "money",
    fa: ["سود سپرده", "سود", "بهره", "کارمزد"],
    en: ["Interest", "fees", "dividends"],
  },
  "trending-up": {
    group: "money",
    fa: ["سرمایه‌گذاری", "بورس", "سهام"],
    en: ["Investments", "stocks", "shares"],
  },
  bitcoin: {
    group: "money",
    fa: ["ارز دیجیتال", "رمزارز", "کریپتو"],
    en: ["Crypto", "bitcoin"],
  },
  vault: {
    group: "money",
    fa: ["گاوصندوق", "صندوق امانات"],
    en: ["Safe", "vault"],
  },
  "receipt-text": {
    group: "money",
    fa: ["مالیات", "عوارض شهری"],
    en: ["Taxes", "tax"],
  },
  "shield-check": {
    group: "money",
    fa: ["بیمه"],
    en: ["Insurance"],
  },
  scale: {
    group: "money",
    fa: ["حقوقی", "وکیل", "دادگاه"],
    en: ["Legal", "lawyer"],
  },
  calculator: {
    group: "money",
    fa: ["حسابداری", "حساب‌وکتاب"],
    en: ["Accounting", "bookkeeping"],
  },
  "rotate-ccw": {
    group: "money",
    fa: ["بازپرداخت", "برگشت پول", "مرجوعی"],
    en: ["Refunds", "refund", "returns"],
  },

  shapes: {
    group: "other",
    fa: ["سایر", "متفرقه", "عمومی"],
    en: ["Other", "miscellaneous", "general"],
  },
  star: {
    group: "other",
    fa: ["ویژه", "مهم"],
    en: ["Special", "favorites"],
  },
  target: {
    group: "other",
    fa: ["هدف", "اهداف"],
    en: ["Goals", "target"],
  },
  calendar: {
    group: "other",
    fa: ["رویدادها", "مناسبت"],
    en: ["Occasions", "calendar"],
  },
  mail: {
    group: "other",
    fa: ["پست", "نامه"],
    en: ["Post", "mail"],
  },
  box: {
    group: "other",
    fa: ["انبار", "وسایل"],
    en: ["Storage", "stuff"],
  },
  lightbulb: {
    group: "other",
    fa: ["ایده", "نوآوری"],
    en: ["Ideas"],
  },
  leaf: {
    group: "other",
    fa: ["طبیعت", "محیط زیست"],
    en: ["Nature", "environment"],
  },
  globe: {
    group: "other",
    fa: ["خارج از کشور", "بین‌المللی"],
    en: ["Abroad", "international"],
  },
};
