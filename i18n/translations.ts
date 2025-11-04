export type Language = 'az' | 'en';

export interface Translations {
  // Common
  error: string;
  success: string;
  loading: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  cancel: string;
  confirm: string;
  yes: string;
  no: string;
  back: string;
  next: string;
  submit: string;
  search: string;
  filter: string;
  sort: string;
  refresh: string;
  retry: string;
  close: string;
  open: string;
  more: string;
  less: string;
  all: string;
  none: string;
  select: string;
  required: string;
  optional: string;
  premium: string;
  ok: string;

  // Navigation
  home: string;
  tests: string;
  profile: string;
  info: string;
  statistics: string;
  admin: string;

  // Settings
  settings: string;
  notifications: string;
  language: string;
  darkMode: string;
  theme: string;
  lightMode: string;
  account: string;
  changePassword: string;
  changeEmail: string;
  helpAndSupport: string;
  logout: string;
  logoutConfirmation: string;

  // Auth
  welcomeBack: string;
  signInToContinue: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  firstName: string;
  lastName: string;
  rememberMe: string;
  forgotPassword: string;
  resetPassword: string;
  newPassword: string;
  confirmPassword: string;
  enterYourEmail: string;
  enterPassword: string;
  enterFirstName: string;
  enterLastName: string;
  
  // Validation
  fillAllFields: string;
  invalidEmail: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  
  // Test Related
  startTest: string;
  submitTest: string;
  returnToTests: string;
  testTitle: string;
  testDescription: string;
  question: string;
  questions: string;
  score: string;
  points: string;
  correct: string;
  incorrect: string;
  yourAnswer: string;
  correctAnswer: string;
  noAnswerSelected: string;
  totalQuestions: string;
  questionsCount: string;
  minutesEstimate: string;
  published: string;
  draft: string;
  
  // Premium
  premiumSubscription: string;
  getPremium: string;
  premiumFeatures: string;
  unlimitedAccess: string;
  detailedStatistics: string;
  
  // Profile
  registrationDate: string;
  subscription: string;
  standard: string;
  verified: string;
  notVerified: string;
  
  // Info Page
  teacherInfo: string;
  mainPhone: string;
  secondaryPhone: string;
  call: string;
  whatsapp: string;
  message: string;
  contactInfo: string;
  quickActions: string;
  contactNote: string;
  
  // Admin
  dashboard: string;
  users: string;
  createTest: string;
  manageTests: string;
  manageUsers: string;
  systemStatistics: string;
  personalStatistics: string;
  welcomeAdmin: string;
  managementPanel: string;
  quickOperations: string;
  recentUsers: string;
  totalUsers: string;
  totalTests: string;
  publishedTests: string;
  draftTests: string;
  totalAttempts: string;
  
  // Statistics
  overallResult: string;
  averageSuccessRate: string;
  attempts: string;
  completed: string;
  averageScore: string;
  bestScore: string;
  worstScore: string;
  totalScore: string;
  completionRate: string;
  recentAttempts: string;
  noAttemptsYet: string;
  startTakingTests: string;
  
  // Errors
  loginFailed: string;
  signupFailed: string;
  invalidCredentials: string;
  emailNotVerified: string;
  accountLocked: string;
  userNotFound: string;
  networkError: string;
  serverError: string;
  
  // Success Messages
  loginSuccessful: string;
  signupSuccessful: string;
  profileUpdated: string;
  passwordChanged: string;
  
  // Verification
  verificationCode: string;
  enterVerificationCode: string;
  verifyCode: string;
  resendCode: string;
  verificationCodeSent: string;
  verificationFailed: string;
  emailVerified: string;
  
  // Test Results
  testResults: string;
  passed: string;
  failed: string;
  viewDetails: string;
  retake: string;
  submittedOn: string;
  
  // Sorting
  sortBy: string;
  date: string;
  questionCount: string;
  
  // Device Restriction
  deviceRestrictionError: string;
  logoutFromOtherDevice: string;
  
  // Screenshot Protection
  screenshotBlocked: string;
  contentProtected: string;
}

export const translations: Record<Language, Translations> = {
  az: {
    // Common
    error: 'Xəta',
    success: 'Uğurlu',
    loading: 'Yüklənir...',
    save: 'Yadda saxla',
    delete: 'Sil',
    edit: 'Redaktə et',
    add: 'Əlavə et',
    cancel: 'Ləğv et',
    confirm: 'Təsdiq et',
    yes: 'Bəli',
    no: 'Xeyr',
    back: 'Geri',
    next: 'İrəli',
    submit: 'Göndər',
    search: 'Axtar',
    filter: 'Süz',
    sort: 'Sırala',
    refresh: 'Yenilə',
    retry: 'Yenidən cəhd et',
    close: 'Bağla',
    open: 'Aç',
    more: 'Daha çox',
    less: 'Daha az',
    all: 'Hamısı',
    none: 'Heç biri',
    select: 'Seç',
    required: 'Məcburi',
    optional: 'İstəyə bağlı',
    premium: 'Premium',
    ok: 'Tamam',

    // Navigation
    home: 'Ana səhifə',
    tests: 'Testlər',
    profile: 'Profil',
    info: 'Məlumat',
    statistics: 'Statistika',
    admin: 'Admin',

    // Settings
    settings: 'Parametrlər',
    notifications: 'Bildirişlər',
    language: 'Dil',
    darkMode: 'Qaranlıq rejim',
    theme: 'Tema',
    lightMode: 'İşıqlı rejim',
    account: 'Hesab',
    changePassword: 'Şifrəni dəyişdir',
    changeEmail: 'E-poçtu dəyişdir',
    helpAndSupport: 'Kömək və Dəstək',
    logout: 'Çıxış',
    logoutConfirmation: 'Çıxış etmək istədiyinizə əminsiniz?',

    // Auth
    welcomeBack: 'Xoş gəldiniz!',
    signInToContinue: 'Davam etmək üçün daxil olun',
    email: 'E-poçt',
    password: 'Şifrə',
    signIn: 'Daxil ol',
    signUp: 'Qeydiyyat',
    createAccount: 'Hesab yarat',
    alreadyHaveAccount: 'Artıq hesabınız var?',
    dontHaveAccount: 'Hesabınız yoxdur?',
    firstName: 'Ad',
    lastName: 'Soyad',
    rememberMe: 'Məni xatırla',
    forgotPassword: 'Şifrəni unutmusunuz?',
    resetPassword: 'Şifrəni sıfırla',
    newPassword: 'Yeni şifrə',
    confirmPassword: 'Şifrəni təsdiqlə',
    enterYourEmail: 'E-poçtunuzu daxil edin',
    enterPassword: 'Şifrənizi daxil edin',
    enterFirstName: 'Adınızı daxil edin',
    enterLastName: 'Soyadınızı daxil edin',

    // Validation
    fillAllFields: 'Bütün xanaları doldurun',
    invalidEmail: 'Düzgün e-poçt ünvanı daxil edin',
    passwordTooShort: 'Şifrə ən azı 6 simvol olmalıdır',
    passwordsDoNotMatch: 'Şifrələr uyğun gəlmir',

    // Test Related
    startTest: 'Testə başla',
    submitTest: 'Testi təqdim et',
    returnToTests: 'Testlərə qayıt',
    testTitle: 'Test başlığı',
    testDescription: 'Test təsviri',
    question: 'Sual',
    questions: 'Suallar',
    score: 'Bal',
    points: 'xal',
    correct: 'Düzgün',
    incorrect: 'Səhv',
    yourAnswer: 'Sizin cavabınız',
    correctAnswer: 'Düzgün cavab',
    noAnswerSelected: 'Cavab seçilməyib',
    totalQuestions: 'Ümumi suallar',
    questionsCount: 'sual',
    minutesEstimate: 'dəqiqə',
    published: 'Dərc edilib',
    draft: 'Qaralama',

    // Premium
    premiumSubscription: 'Premium Abunəlik',
    getPremium: 'Premium Abunəlik Al',
    premiumFeatures: 'Premium xüsusiyyətlər',
    unlimitedAccess: 'Bütün testlərə giriş',
    detailedStatistics: 'Ətraflı statistika',

    // Profile
    registrationDate: 'Qeydiyyat Tarixi',
    subscription: 'Abunəlik',
    standard: 'Standart',
    verified: 'Təsdiqlənib',
    notVerified: 'Təsdiqlənməyib',

    // Info Page
    teacherInfo: 'Müəllim Məlumatları',
    mainPhone: 'Əsas telefon',
    secondaryPhone: 'Əlavə telefon',
    call: 'Zəng et',
    whatsapp: 'WhatsApp',
    message: 'Mesaj',
    contactInfo: 'Əlaqə məlumatları',
    quickActions: 'Tez əməliyyatlar',
    contactNote: 'Suallarınız olduqda, istənilən vaxt əlaqə saxlaya bilərsiniz',

    // Admin
    dashboard: 'İdarə paneli',
    users: 'İstifadəçilər',
    createTest: 'Test Yarat',
    manageTests: 'Testləri İdarə Et',
    manageUsers: 'İstifadəçilər',
    systemStatistics: 'Sistem Statistikası',
    personalStatistics: 'Şəxsi Nəticə',
    welcomeAdmin: 'Xoş gəlmisiniz',
    managementPanel: 'İdarəetmə paneli',
    quickOperations: 'Tez Əməliyyatlar',
    recentUsers: 'Son İstifadəçilər',
    totalUsers: 'Ümumi İstifadəçi',
    totalTests: 'Ümumi Test',
    publishedTests: 'Dərc edilmiş',
    draftTests: 'Qaralama',
    totalAttempts: 'Ümumi Cəhdlər',

    // Statistics
    overallResult: 'Ümumi Nəticə',
    averageSuccessRate: 'Orta uğur faizi',
    attempts: 'Cəhd',
    completed: 'Tamamlanan',
    averageScore: 'Orta xal',
    bestScore: 'Ən yaxşı nəticə',
    worstScore: 'Ən aşağı nəticə',
    totalScore: 'Toplam xal',
    completionRate: 'Tamamlanma',
    recentAttempts: 'Son Cəhdlər',
    noAttemptsYet: 'Hələ cəhd yoxdur',
    startTakingTests: 'Test həll etməyə başlayın',

    // Errors
    loginFailed: 'Giriş uğursuz oldu',
    signupFailed: 'Qeydiyyat uğursuz oldu',
    invalidCredentials: 'E-poçt və ya şifrə yanlışdır',
    emailNotVerified: 'E-poçt təsdiqlənməyib',
    accountLocked: 'Hesab müvəqqəti bloklanıb',
    userNotFound: 'İstifadəçi tapılmadı',
    networkError: 'İnternet bağlantısını yoxlayın',
    serverError: 'Server xətası baş verdi',

    // Success Messages
    loginSuccessful: 'Giriş uğurla tamamlandı',
    signupSuccessful: 'Qeydiyyat uğurla tamamlandı',
    profileUpdated: 'Profil yeniləndi',
    passwordChanged: 'Şifrə dəyişdirildi',

    // Verification
    verificationCode: 'Təsdiq kodu',
    enterVerificationCode: 'Təsdiq kodunu daxil edin',
    verifyCode: 'Kodu təsdiqlə',
    resendCode: 'Kodu yenidən göndər',
    verificationCodeSent: 'Təsdiq kodu göndərildi',
    verificationFailed: 'Təsdiq uğursuz oldu',
    emailVerified: 'E-poçt təsdiqləndi',

    // Test Results
    testResults: 'Test Nəticələri',
    passed: 'Keçdi',
    failed: 'Uğursuz',
    viewDetails: 'Təfərrüatlara bax',
    retake: 'Yenidən cəhd et',
    submittedOn: 'Təqdim tarixi',

    // Sorting
    sortBy: 'Sıralama',
    date: 'Tarix',
    questionCount: 'Sual sayı',

    // Device Restriction
    deviceRestrictionError: 'Bu hesab artıq başqa cihazda istifadə olunur. Əvvəlcə digər cihazdan çıxış edin.',
    logoutFromOtherDevice: 'Digər cihazdan çıxış edin',

    // Screenshot Protection
    screenshotBlocked: 'Ekran görüntüsü bloklandı',
    contentProtected: 'Məzmun qorunur',
  },
  en: {
    // Common
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    cancel: 'Cancel',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    retry: 'Retry',
    close: 'Close',
    open: 'Open',
    more: 'More',
    less: 'Less',
    all: 'All',
    none: 'None',
    select: 'Select',
    required: 'Required',
    optional: 'Optional',
    premium: 'Premium',
    ok: 'OK',

    // Navigation
    home: 'Home',
    tests: 'Tests',
    profile: 'Profile',
    info: 'Info',
    statistics: 'Statistics',
    admin: 'Admin',

    // Settings
    settings: 'Settings',
    notifications: 'Notifications',
    language: 'Language',
    darkMode: 'Dark Mode',
    theme: 'Theme',
    lightMode: 'Light Mode',
    account: 'Account',
    changePassword: 'Change Password',
    changeEmail: 'Change Email',
    helpAndSupport: 'Help & Support',
    logout: 'Logout',
    logoutConfirmation: 'Are you sure you want to logout?',

    // Auth
    welcomeBack: 'Welcome Back!',
    signInToContinue: 'Sign in to continue',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    firstName: 'First Name',
    lastName: 'Last Name',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    enterYourEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',

    // Validation
    fillAllFields: 'Please fill all fields',
    invalidEmail: 'Please enter a valid email',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDoNotMatch: 'Passwords do not match',

    // Test Related
    startTest: 'Start Test',
    submitTest: 'Submit Test',
    returnToTests: 'Return to Tests',
    testTitle: 'Test Title',
    testDescription: 'Test Description',
    question: 'Question',
    questions: 'Questions',
    score: 'Score',
    points: 'points',
    correct: 'Correct',
    incorrect: 'Incorrect',
    yourAnswer: 'Your Answer',
    correctAnswer: 'Correct Answer',
    noAnswerSelected: 'No answer selected',
    totalQuestions: 'Total Questions',
    questionsCount: 'questions',
    minutesEstimate: 'minutes',
    published: 'Published',
    draft: 'Draft',

    // Premium
    premiumSubscription: 'Premium Subscription',
    getPremium: 'Get Premium',
    premiumFeatures: 'Premium Features',
    unlimitedAccess: 'Unlimited access to all tests',
    detailedStatistics: 'Detailed statistics',

    // Profile
    registrationDate: 'Registration Date',
    subscription: 'Subscription',
    standard: 'Standard',
    verified: 'Verified',
    notVerified: 'Not Verified',

    // Info Page
    teacherInfo: 'Teacher Information',
    mainPhone: 'Main Phone',
    secondaryPhone: 'Secondary Phone',
    call: 'Call',
    whatsapp: 'WhatsApp',
    message: 'Message',
    contactInfo: 'Contact Information',
    quickActions: 'Quick Actions',
    contactNote: 'Feel free to contact us anytime if you have any questions',

    // Admin
    dashboard: 'Dashboard',
    users: 'Users',
    createTest: 'Create Test',
    manageTests: 'Manage Tests',
    manageUsers: 'Users',
    systemStatistics: 'System Statistics',
    personalStatistics: 'Personal Statistics',
    welcomeAdmin: 'Welcome',
    managementPanel: 'Management Panel',
    quickOperations: 'Quick Operations',
    recentUsers: 'Recent Users',
    totalUsers: 'Total Users',
    totalTests: 'Total Tests',
    publishedTests: 'Published',
    draftTests: 'Drafts',
    totalAttempts: 'Total Attempts',

    // Statistics
    overallResult: 'Overall Result',
    averageSuccessRate: 'Average success rate',
    attempts: 'Attempts',
    completed: 'Completed',
    averageScore: 'Average score',
    bestScore: 'Best score',
    worstScore: 'Worst score',
    totalScore: 'Total score',
    completionRate: 'Completion',
    recentAttempts: 'Recent Attempts',
    noAttemptsYet: 'No attempts yet',
    startTakingTests: 'Start taking tests',

    // Errors
    loginFailed: 'Login failed',
    signupFailed: 'Sign up failed',
    invalidCredentials: 'Invalid email or password',
    emailNotVerified: 'Email not verified',
    accountLocked: 'Account temporarily locked',
    userNotFound: 'User not found',
    networkError: 'Please check your internet connection',
    serverError: 'Server error occurred',

    // Success Messages
    loginSuccessful: 'Login successful',
    signupSuccessful: 'Sign up successful',
    profileUpdated: 'Profile updated',
    passwordChanged: 'Password changed',

    // Verification
    verificationCode: 'Verification Code',
    enterVerificationCode: 'Enter verification code',
    verifyCode: 'Verify Code',
    resendCode: 'Resend Code',
    verificationCodeSent: 'Verification code sent',
    verificationFailed: 'Verification failed',
    emailVerified: 'Email verified',

    // Test Results
    testResults: 'Test Results',
    passed: 'Passed',
    failed: 'Failed',
    viewDetails: 'View Details',
    retake: 'Retake',
    submittedOn: 'Submitted on',

    // Sorting
    sortBy: 'Sort By',
    date: 'Date',
    questionCount: 'Question Count',

    // Device Restriction
    deviceRestrictionError: 'This account is already in use on another device. Please logout from the other device first.',
    logoutFromOtherDevice: 'Logout from other device',

    // Screenshot Protection
    screenshotBlocked: 'Screenshot blocked',
    contentProtected: 'Content protected',
  },
};

