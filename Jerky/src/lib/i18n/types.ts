export type FaqItem = {
  q: string;
  a: string;
};

export type Dictionary = {
  meta: {
    siteName: string;
    description: string;
  };
  nav: {
    shop: string;
    story: string;
    faq: string;
    contact: string;
    cart: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    home: string;
    primary: string;
    skip: string;
    account: string;
    admin: string;
  };
  footer: {
    note: string;
    privacy: string;
    terms: string;
    languages: string;
    tagline: string;
  };
  home: {
    eyebrow: string;
    title: string;
    lede: string;
    filtersLabel: string;
    all: string;
    classic: string;
    sweet: string;
    hot: string;
    sortLabel: string;
    sortRecommended: string;
    sortName: string;
    view: string;
    fresh: string;
    ratingEmpty: string;
    priceSoon: string;
    cards: {
      original: string;
      teriyaki: string;
      "hot-chili": string;
    };
  };
  shop: {
    eyebrow: string;
    title: string;
    lede: string;
    view: string;
  };
  product: {
    draft: string;
    weight: string;
    add: string;
    added: string;
    addNote: string;
    ingredientsTitle: string;
    ingredientsBody: string;
    storageTitle: string;
    storageBody: string;
    reviewsTitle: string;
    reviewsEmpty: string;
    related: string;
    placeholder: string;
    back: string;
  };
  story: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
  };
  faq: {
    eyebrow: string;
    title: string;
    lede: string;
    items: FaqItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    lede: string;
    name: string;
    email: string;
    message: string;
    disabledNote: string;
  };
  legal: {
    draft: string;
    privacyTitle: string;
    privacyBody: string[];
    termsTitle: string;
    termsBody: string[];
  };
  price: {
    comingSoon: string;
  };
  cart: {
    eyebrow: string;
    title: string;
    empty: string;
    toShop: string;
    quantity: string;
    remove: string;
    subtotal: string;
    total: string;
    pricePending: string;
    checkout: string;
    note: string;
  };
  checkout: {
    eyebrow: string;
    title: string;
    lede: string;
    name: string;
    email: string;
    phone: string;
    optional: string;
    country: string;
    city: string;
    postalCode: string;
    address: string;
    submit: string;
    pending: string;
    errors: {
      customerName: string;
      email: string;
      city: string;
      postalCode: string;
      addressLine: string;
      items: string;
    };
  };
  order: {
    eyebrow: string;
    title: string;
    banner: string;
    number: string;
    status: string;
    back: string;
  };
  auth: {
    loginEyebrow: string;
    loginTitle: string;
    loginLede: string;
    registerEyebrow: string;
    registerTitle: string;
    registerLede: string;
    name: string;
    email: string;
    password: string;
    confirm: string;
    submitLogin: string;
    submitRegister: string;
    pending: string;
    haveAccount: string;
    needAccount: string;
    logout: string;
    errors: {
      name: string;
      email: string;
      password: string;
      confirm: string;
      credentials: string;
      taken: string;
      failed: string;
    };
  };
  account: {
    eyebrow: string;
    title: string;
    lede: string;
    empty: string;
    orders: string;
    customer: string;
    admin: string;
    panel: string;
    test: string;
  };
  admin: {
    dashboard: string;
    orders: string;
    products: string;
    back: string;
    overviewEyebrow: string;
    overviewTitle: string;
    overviewLede: string;
    orderCount: string;
    productCount: string;
    latest: string;
    empty: string;
    search: string;
    status: string;
    all: string;
    filter: string;
    customer: string;
    address: string;
    items: string;
    history: string;
    notes: string;
    noteLabel: string;
    addNote: string;
    saveStatus: string;
    testBanner: string;
    published: string;
    price: string;
    priceHint: string;
    sort: string;
    slug: string;
    accent: string;
    profile: string;
    create: string;
    edit: string;
    save: string;
    newTitle: string;
    saved: string;
    errors: {
      price: string;
      slug: string;
      fields: string;
      note: string;
    };
    statuses: {
      NEW: string;
      CONFIRMED: string;
      PREPARING: string;
      READY: string;
      SHIPPED: string;
      COMPLETED: string;
      CANCELLED: string;
      REFUNDED: string;
    };
  };
};
