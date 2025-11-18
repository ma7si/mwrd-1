import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation & Common
    'nav.forClients': 'For Clients',
    'nav.forSuppliers': 'For Suppliers',
    'nav.howItWorks': 'How It Works',
    'nav.about': 'About',
    'nav.login': 'Login',
    'nav.requestDemo': 'Request a Demo',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.language': 'Language',

    // Landing Page
    'landing.hero.title': 'The Smarter B2B Marketplace, Managed for You',
    'landing.hero.subtitle': 'Connecting trusted suppliers with high-value clients under one seamless platform.',
    'landing.hero.clientBtn': "I'm a Client",
    'landing.hero.supplierBtn': "I'm a Supplier",
    'landing.features.title': 'For Clients',
    'landing.features.suppliers': 'For Suppliers',
    'landing.features.vetted.title': 'Access Vetted Suppliers',
    'landing.features.vetted.desc': 'Connect with a curated network of trusted professionals and service providers, ensuring quality and reliability.',
    'landing.features.procurement.title': 'Streamline Procurement',
    'landing.features.procurement.desc': 'Simplify your purchasing process with our intuitive tools, from request to payment, all in one place.',
    'landing.features.manage.title': 'Manage Projects Centrally',
    'landing.features.manage.desc': 'Oversee all your projects, communications, and milestones from a single, powerful dashboard.',
    'landing.howItWorks.title': 'How It Works',
    'landing.howItWorks.subtitle': 'A simple, transparent process to connect and get work done.',
    'landing.howItWorks.step1.title': 'Post or Find Opportunity',
    'landing.howItWorks.step1.desc': 'Clients post project requirements. Suppliers browse and find opportunities that match their expertise.',
    'landing.howItWorks.step2.title': 'Connect & Collaborate',
    'landing.howItWorks.step2.desc': 'Use our platform to communicate, negotiate terms, and manage project milestones seamlessly.',
    'landing.howItWorks.step3.title': 'Complete & Get Paid',
    'landing.howItWorks.step3.desc': 'Once the work is complete and approved, payments are processed securely and swiftly through the platform.',
    'landing.testimonials.title': 'Trusted by Industry Leaders',
    'landing.testimonials.subtitle': 'Hear what our partners have to say about their experience with mwrd.',
    'landing.testimonials.1': '"mwrd revolutionized our procurement process. We found a high-quality supplier in days, not weeks. The platform is intuitive and saved us countless hours."',
    'landing.testimonials.2': '"As a supplier, finding quality leads used to be our biggest challenge. With mwrd, we get access to serious clients and can focus on what we do best."',
    'landing.testimonials.3': '"The centralized project management and secure payment system gives us peace of mind. It\'s the most professional B2B platform we\'ve used."',
    'landing.footer.tagline': 'The premier managed marketplace for B2B connections.',
    'landing.footer.platform': 'Platform',
    'landing.footer.company': 'Company',
    'landing.footer.aboutUs': 'About Us',
    'landing.footer.careers': 'Careers',
    'landing.footer.contact': 'Contact',
    'landing.footer.legal': 'Legal',
    'landing.footer.privacy': 'Privacy Policy',
    'landing.footer.terms': 'Terms of Service',
    'landing.footer.rights': 'All rights reserved.',

    // Login Page
    'login.title': 'Welcome Back',
    'login.subtitle': 'Sign in to access your account',
    'login.email': 'Work Email',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot Password?',
    'login.signIn': 'Sign In',
    'login.signingIn': 'Signing In...',
    'login.noAccount': "Don't have your account?",
    'login.rightTitle': 'Unlock Your B2B Potential.',
    'login.rightDesc': 'Streamline procurement, manage supplier relationships, and drive growth in a secure, secure, unified marktplace. mwrd empowers your business with efficiency and control.',

    // Signup Page
    'signup.title': 'Create Your Account',
    'signup.subtitle': 'Join the managed B2B marketplace',
    'signup.iAmA': 'I am a',
    'signup.client': 'Client',
    'signup.supplier': 'Supplier',
    'signup.clientDesc': 'I need to buy',
    'signup.supplierDesc': 'I want to sell',
    'signup.email': 'Work Email',
    'signup.password': 'Password (min 6 characters)',
    'signup.fullName': 'Full Name / Contact Person',
    'signup.companyName': 'Company Name (Optional)',
    'signup.phone': 'Phone Number (Optional)',
    'signup.approvalNotice': 'Your account will be reviewed by our team before activation. This usually takes 24-48 hours.',
    'signup.createAccount': 'Create Account',
    'signup.creatingAccount': 'Creating Account...',
    'signup.haveAccount': 'Already have an account?',
    'signup.signIn': 'Sign In',
    'signup.rightTitle': 'Join the Future of B2B Commerce.',
    'signup.rightDesc': 'Connect with verified partners, streamline your operations, and grow your business in a secure ecosystem built for efficiency and trust.',
    'signup.success.title': 'Registration Submitted!',
    'signup.success.message': 'Your account has been created and is pending approval from our team. You\'ll receive an email once your account is activated.',
    'signup.success.loginBtn': 'Go to Login',

    // Portal Common
    'portal.dashboard': 'Dashboard',
    'portal.catalog': 'Catalog',
    'portal.inventory': 'Inventory',
    'portal.rfqs': 'RFQs',
    'portal.myRfqs': 'My RFQs',
    'portal.orders': 'Orders',
    'portal.settings': 'Settings',
    'portal.users': 'Users',
    'portal.items': 'Items',

    // Client Dashboard
    'client.dashboard.welcome': 'Welcome back',
    'client.dashboard.title': 'Client Dashboard',
    'client.dashboard.overview': 'Overview',
    'client.catalog.title': 'Product Catalog',
    'client.catalog.coming': 'Product catalog coming soon',

    // Supplier Dashboard
    'supplier.dashboard.welcome': 'Welcome back',
    'supplier.dashboard.title': 'Supplier Dashboard',
    'supplier.dashboard.overview': 'Overview',

    // Admin Dashboard
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.overview': 'System Overview',

    // Status & Actions
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.active': 'Active',
    'status.inactive': 'Inactive',

    // Unauthorized & Error Pages
    'unauthorized.title': 'Access Denied',
    'unauthorized.message': 'You do not have permission to access this page.',
    'unauthorized.goBack': 'Go Back',
    'pending.title': 'Pending Approval',
    'pending.message': 'Your account is currently pending approval from our admin team.',
  },
  ar: {
    // Navigation & Common
    'nav.forClients': 'للعملاء',
    'nav.forSuppliers': 'للموردين',
    'nav.howItWorks': 'كيف يعمل',
    'nav.about': 'حول',
    'nav.login': 'تسجيل الدخول',
    'nav.requestDemo': 'طلب عرض توضيحي',
    'nav.signUp': 'التسجيل',
    'nav.signOut': 'تسجيل الخروج',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.close': 'إغلاق',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.language': 'اللغة',

    // Landing Page
    'landing.hero.title': 'منصة B2B الأذكى، مُدارة من أجلك',
    'landing.hero.subtitle': 'ربط الموردين الموثوقين مع العملاء ذوي القيمة العالية تحت منصة واحدة سلسة.',
    'landing.hero.clientBtn': 'أنا عميل',
    'landing.hero.supplierBtn': 'أنا مورد',
    'landing.features.title': 'للعملاء',
    'landing.features.suppliers': 'للموردين',
    'landing.features.vetted.title': 'الوصول إلى موردين موثوقين',
    'landing.features.vetted.desc': 'اتصل بشبكة منتقاة من المحترفين ومزودي الخدمات الموثوق بهم، مما يضمن الجودة والموثوقية.',
    'landing.features.procurement.title': 'تبسيط المشتريات',
    'landing.features.procurement.desc': 'بسّط عملية الشراء الخاصة بك باستخدام أدواتنا البديهية، من الطلب إلى الدفع، كل ذلك في مكان واحد.',
    'landing.features.manage.title': 'إدارة المشاريع مركزياً',
    'landing.features.manage.desc': 'راقب جميع مشاريعك واتصالاتك ومراحلك الرئيسية من لوحة تحكم واحدة قوية.',
    'landing.howItWorks.title': 'كيف يعمل',
    'landing.howItWorks.subtitle': 'عملية بسيطة وشفافة للتواصل وإنجاز العمل.',
    'landing.howItWorks.step1.title': 'انشر أو ابحث عن فرصة',
    'landing.howItWorks.step1.desc': 'ينشر العملاء متطلبات المشروع. يتصفح الموردون ويجدون الفرص التي تتناسب مع خبرتهم.',
    'landing.howItWorks.step2.title': 'اتصل وتعاون',
    'landing.howItWorks.step2.desc': 'استخدم منصتنا للتواصل والتفاوض على الشروط وإدارة معالم المشروع بسلاسة.',
    'landing.howItWorks.step3.title': 'أكمل واحصل على الدفع',
    'landing.howItWorks.step3.desc': 'بمجرد اكتمال العمل والموافقة عليه، تتم معالجة المدفوعات بشكل آمن وسريع من خلال المنصة.',
    'landing.testimonials.title': 'موثوق به من قبل قادة الصناعة',
    'landing.testimonials.subtitle': 'اسمع ما يقوله شركاؤنا عن تجربتهم مع mwrd.',
    'landing.testimonials.1': '"أحدثت mwrd ثورة في عملية الشراء لدينا. وجدنا مورداً عالي الجودة في أيام، وليس أسابيع. المنصة بديهية ووفرت لنا ساعات لا حصر لها."',
    'landing.testimonials.2': '"كمورد، كان العثور على عملاء محتملين ذوي جودة هو أكبر تحدٍ لنا. مع mwrd، نحصل على الوصول إلى عملاء جادين ونركز على ما نقوم به بشكل أفضل."',
    'landing.testimonials.3': '"نظام إدارة المشاريع المركزي ونظام الدفع الآمن يمنحنا راحة البال. إنها المنصة الأكثر احترافية لـ B2B التي استخدمناها."',
    'landing.footer.tagline': 'السوق المُدار الرائد لاتصالات B2B.',
    'landing.footer.platform': 'المنصة',
    'landing.footer.company': 'الشركة',
    'landing.footer.aboutUs': 'معلومات عنا',
    'landing.footer.careers': 'الوظائف',
    'landing.footer.contact': 'اتصل بنا',
    'landing.footer.legal': 'قانوني',
    'landing.footer.privacy': 'سياسة الخصوصية',
    'landing.footer.terms': 'شروط الخدمة',
    'landing.footer.rights': 'جميع الحقوق محفوظة.',

    // Login Page
    'login.title': 'مرحباً بعودتك',
    'login.subtitle': 'قم بتسجيل الدخول للوصول إلى حسابك',
    'login.email': 'البريد الإلكتروني للعمل',
    'login.password': 'كلمة المرور',
    'login.forgotPassword': 'نسيت كلمة المرور؟',
    'login.signIn': 'تسجيل الدخول',
    'login.signingIn': 'جاري تسجيل الدخول...',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.rightTitle': 'افتح إمكانات B2B الخاصة بك.',
    'login.rightDesc': 'بسّط المشتريات، وإدارة علاقات الموردين، ودفع النمو في سوق آمن وموحد. تمكّن mwrd عملك بالكفاءة والتحكم.',

    // Signup Page
    'signup.title': 'إنشاء حسابك',
    'signup.subtitle': 'انضم إلى السوق المُدار لـ B2B',
    'signup.iAmA': 'أنا',
    'signup.client': 'عميل',
    'signup.supplier': 'مورد',
    'signup.clientDesc': 'أحتاج للشراء',
    'signup.supplierDesc': 'أريد البيع',
    'signup.email': 'البريد الإلكتروني للعمل',
    'signup.password': 'كلمة المرور (6 أحرف على الأقل)',
    'signup.fullName': 'الاسم الكامل / الشخص المسؤول',
    'signup.companyName': 'اسم الشركة (اختياري)',
    'signup.phone': 'رقم الهاتف (اختياري)',
    'signup.approvalNotice': 'سيتم مراجعة حسابك من قبل فريقنا قبل التفعيل. يستغرق هذا عادةً 24-48 ساعة.',
    'signup.createAccount': 'إنشاء حساب',
    'signup.creatingAccount': 'جاري إنشاء الحساب...',
    'signup.haveAccount': 'هل لديك حساب بالفعل؟',
    'signup.signIn': 'تسجيل الدخول',
    'signup.rightTitle': 'انضم إلى مستقبل تجارة B2B.',
    'signup.rightDesc': 'اتصل بشركاء موثوقين، وبسّط عملياتك، وقم بتنمية أعمالك في نظام بيئي آمن مبني على الكفاءة والثقة.',
    'signup.success.title': 'تم تقديم التسجيل!',
    'signup.success.message': 'تم إنشاء حسابك وهو في انتظار الموافقة من فريقنا. ستتلقى بريداً إلكترونياً بمجرد تفعيل حسابك.',
    'signup.success.loginBtn': 'الذهاب إلى تسجيل الدخول',

    // Portal Common
    'portal.dashboard': 'لوحة التحكم',
    'portal.catalog': 'الكتالوج',
    'portal.inventory': 'المخزون',
    'portal.rfqs': 'طلبات الأسعار',
    'portal.myRfqs': 'طلبات الأسعار الخاصة بي',
    'portal.orders': 'الطلبات',
    'portal.settings': 'الإعدادات',
    'portal.users': 'المستخدمون',
    'portal.items': 'المنتجات',

    // Client Dashboard
    'client.dashboard.welcome': 'مرحباً بعودتك',
    'client.dashboard.title': 'لوحة تحكم العميل',
    'client.dashboard.overview': 'نظرة عامة',
    'client.catalog.title': 'كتالوج المنتجات',
    'client.catalog.coming': 'كتالوج المنتجات قريباً',

    // Supplier Dashboard
    'supplier.dashboard.welcome': 'مرحباً بعودتك',
    'supplier.dashboard.title': 'لوحة تحكم المورد',
    'supplier.dashboard.overview': 'نظرة عامة',

    // Admin Dashboard
    'admin.dashboard.title': 'لوحة تحكم المسؤول',
    'admin.dashboard.overview': 'نظرة عامة على النظام',

    // Status & Actions
    'status.pending': 'قيد الانتظار',
    'status.approved': 'تمت الموافقة',
    'status.rejected': 'مرفوض',
    'status.active': 'نشط',
    'status.inactive': 'غير نشط',

    // Unauthorized & Error Pages
    'unauthorized.title': 'تم رفض الوصول',
    'unauthorized.message': 'ليس لديك إذن للوصول إلى هذه الصفحة.',
    'unauthorized.goBack': 'العودة',
    'pending.title': 'في انتظار الموافقة',
    'pending.message': 'حسابك حالياً في انتظار الموافقة من فريق الإدارة لدينا.',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ar' ? 'ar' : 'en') as Language;
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
