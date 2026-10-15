"use strict";
/* Full EN/AR translation dictionaries for the Dana Jo portfolio.
   Every user-facing string lives here — public site, admin, validation,
   errors and confirmations. Arabic = everything in Arabic, English = all English. */

const STRINGS = {
en: {
  // brand / meta
  brand_name: "Dana Jo",
  brand_first: "Dana",
  brand_last: "Jo",
  meta_title_suffix: "Dana Jo — Graphic Designer",
  meta_description: "Dana Jo is a graphic designer with 5 years of experience crafting thoughtful brand identities, print and digital design.",

  // header / nav
  nav_home: "Home", nav_work: "Work", nav_services: "Services", nav_about: "About", nav_contact: "Contact",
  nav_cta: "Let's Talk",
  open_menu: "Open menu",
  lang_switch_label: "Switch language",
  lang_other: "العربية",

  // hero
  hero_tagline_line: "thoughtful design, made to last",
  hero_stamp: "Graphic Designer · Dana Jo · Graphic Designer ·",
  scroll_cue: "Scroll",
  stat_branding: "Branding", stat_branding_sub: "Identity & Logos",
  stat_print: "Print", stat_print_sub: "Editorial & Packaging",
  stat_digital: "Digital", stat_digital_sub: "Social & Web Visuals",

  // marquee
  mq_1: "Brand Identity", mq_2: "Print Design", mq_3: "Digital Design",
  mq_4: "Typography", mq_5: "Social Media", mq_6: "Packaging",

  // section eyebrows / headings
  eyebrow_portfolio: "Portfolio", eyebrow_services: "What I Do", eyebrow_news: "News",
  eyebrow_about: "About", eyebrow_contact: "Contact",
  announcements_heading: "Announcements", announcement_label: "Announcement",

  // work cards / buttons
  view_project: "View project",
  view_all_work: "View All Work",
  all_filter: "All",
  show_all: "Show All",
  empty_work_title: "The portfolio is being curated",
  empty_work_body: "Selected projects will appear here soon. In the meantime, feel free to get in touch about your project.",
  empty_work_filter_title: "No projects here yet",
  empty_work_filter_cat: "Nothing published in “{cat}” yet — try another category.",
  empty_work_filter_plain: "The portfolio is being curated. Selected work will appear here soon.",
  get_in_touch: "Get in Touch",

  // project page
  back_to_work: "Back to Work",
  fact_designer: "Designer", fact_category: "Category",
  keep_exploring: "Keep Exploring", other_projects: "Other Projects",
  start_your_project: "Start Your Project",

  // services page
  services_empty_title: "Services coming soon",
  services_empty_body: "The services list is being prepared. Please get in touch to discuss your project directly.",
  discuss_your_project: "Discuss Your Project",

  // about
  badge_years_craft: "{n} yrs of craft",
  about_stat_identity: "Identity", about_stat_identity_sub: "Brand Systems",
  about_stat_detail: "Detail", about_stat_detail_sub: "Typography-led Craft",
  read_more: "Read More", see_the_work: "See the Work",

  // CTA band
  cta_eyebrow: "Let's Work Together",
  cta_title_a: "Have a project", cta_title_b: "in mind?",
  cta_body: "Let's create something thoughtful together. Send a message or reach out directly on WhatsApp.",
  send_a_message: "Send a Message",

  // contact
  sent_title: "Message sent.",
  sent_body: "Thank you — your message has been received and will be read personally.",
  label_name: "Your name", label_email: "Email address", label_message: "Your message",
  ph_name: "Jane Doe", ph_email: "jane@example.com", ph_message: "Tell me about your project…",
  send_message: "Send Message",
  prefer_direct: "Prefer to reach out", prefer_direct_em: "directly?",
  wa_card_sub: "Chat directly — usually replies quickly",
  fb_card_sub: "Follow and message on Facebook",
  enquiry_note_title: "Every enquiry is read personally",
  enquiry_note_body: "No bots, no auto-replies — just a thoughtful response.",
  err_contact_required: "Please fill in your name, email and message.",
  err_contact_email: "That email address does not look valid.",

  // footer
  footer_studio: "Studio", footer_explore: "Explore", footer_more: "More", footer_connect: "Connect",
  footer_exp: "Graphic designer · 5 years of experience",
  footer_about_dana: "About Dana", footer_enquiries: "Enquiries", footer_admin: "Admin",
  footer_rights: "All rights reserved.", footer_care: "Designed with care.",

  // 404 / 500 / misc
  err_404_title: "Page Not Found",
  err_404_h: "This page wandered off",
  err_404_p: "The page you're looking for doesn't exist or has moved.",
  back_home: "Back Home",
  err_500_title: "Something Went Wrong",
  err_500_h: "Something went wrong",
  err_500_p: "An unexpected error occurred. Please try again in a moment.",
  err_413: "File too large (max 5MB).",
  err_unauthorized: "Unauthorized",
  err_not_found: "Not found",
  err_project_not_found: "Project not found",

  // language names (for dual-language fields)
  lang_name_en: "English", lang_name_ar: "Arabic",

  // ---------- ADMIN ----------
  admin_title_suffix: "Dana Jo Admin",
  admin_dashboard: "Dashboard", admin_projects: "Projects", admin_services: "Services",
  admin_announcements: "Announcements", admin_content: "Site Content", admin_messages: "Messages",
  admin_view_site: "View Site", admin_logout: "Log Out",

  login_title: "Admin Login",
  login_h: "Welcome back",
  login_p: "Sign in to manage the Dana Jo portfolio.",
  login_bad: "Invalid email or password.",
  login_email: "Email", login_password: "Password", login_btn: "Sign In",
  login_back: "Back to website",

  dash_sub: "Overview of your portfolio",
  stat_projects: "Projects", stat_published: "Published", stat_services: "Services",
  stat_announcements: "Announcements", stat_messages: "Messages", stat_unread: "Unread",
  recent_messages: "Recent messages", view_all: "View all",
  th_name: "Name", th_email: "Email", th_message: "Message", th_date: "Date", th_status: "Status",
  badge_read: "Read", badge_new: "New",
  dash_no_messages: "No messages yet. New contact-form submissions will appear here.",
  quick_actions: "Quick actions",
  qa_new_project: "+ New Project", qa_new_announcement: "+ New Announcement", qa_edit_content: "Edit Site Content",

  proj_sub: "Create, publish and organise portfolio work",
  proj_all: "All projects",
  th_title: "Title", th_category: "Category", th_order: "Order", th_actions: "Actions",
  badge_published: "Published", badge_draft: "Draft",
  btn_edit: "Edit", btn_publish: "Publish", btn_unpublish: "Unpublish", btn_delete: "Delete",
  confirm_title: "Are you sure?",
  confirm_delete_project: "Delete this project and all its images?",
  proj_empty: "No projects yet. Create your first project to start building the portfolio.",

  pf_edit: "Edit Project", pf_new: "New Project",
  pf_new_sub: "Add a new portfolio piece",
  pf_title_required: "Title is required.",
  file_too_large: "That image is too large — please use a file under 5MB.",
  upload_failed: "The upload failed. Please try again with a smaller image.",
  toast_saved: "Saved successfully.",
  toast_deleted: "Deleted successfully.",
  toast_published: "Published.",
  toast_unpublished: "Moved to drafts.",
  toast_sent: "Message sent.",
  too_many_attempts: "Too many attempts — please wait a few minutes and try again.",
  pf_details: "Details",
  pf_title: "Title", pf_title_req: "Title *",
  pf_category: "Category",
  pf_category_hint: "Used for the portfolio filters on the public site.",
  pf_description: "Description",
  pf_sort: "Sort order",
  pf_sort_hint: "Lower numbers appear first.",
  pf_published: "Published (visible on the public site)",
  pf_cover: "Cover image",
  pf_cover_replace: "Replace cover", pf_cover_upload: "Upload cover",
  pf_img_hint: "JPG, PNG, WebP or GIF · max 5MB.",
  pf_gallery: "Gallery images",
  pf_gallery_add: "Add images",
  pf_gallery_hint: "You can select multiple files. JPG, PNG, WebP or GIF · max 5MB each.",
  pf_gallery_empty: "No gallery images yet — add some above.",
  pf_save: "Save Changes", pf_create: "Create Project",
  btn_cancel: "Cancel",
  pf_remove_cover: "Remove Cover Image",
  confirm_remove_cover: "Remove the cover image?",
  confirm_delete_image: "Delete this image?",
  pf_caption_ph: "Caption…",
  ph_project_title: "e.g. Bloom Café Identity",
  ph_project_category: "e.g. Branding, Print, Digital",
  ph_project_desc: "Tell the story of this project…",

  svc_sub: "Manage the services shown on the public site",
  svc_edit: "Edit service", svc_add: "Add a service",
  svc_title_req: "Title *", svc_sort: "Sort order", svc_desc: "Description",
  svc_published: "Published",
  svc_save: "Save Changes", svc_add_btn: "Add Service",
  svc_all: "All services",
  confirm_delete_service: "Delete this service?",
  svc_empty: "No services yet.",
  ph_service_title: "e.g. Brand Identity",
  ph_service_desc: "What does this service include?",

  ann_sub: "News, offers and promotions",
  ann_edit: "Edit announcement", ann_new: "New announcement",
  ann_title_req: "Title *", ann_body: "Body", ann_image: "Image",
  ann_replace: "(replace)",
  ann_img_hint: "Optional · JPG, PNG, WebP or GIF · max 5MB.",
  ann_save: "Save Changes", ann_add_btn: "Add Announcement",
  ann_all: "All announcements",
  confirm_delete_announcement: "Delete this announcement?",
  ann_empty: "No announcements yet.",
  ph_ann_title: "e.g. 20% off branding packages this month",
  ph_ann_body: "Details of the announcement or offer…",

  content_sub: "Edit the text shown across the public website",
  content_saved: "Content saved — the public website now shows the updated text.",
  content_hero: "Hero", content_about: "About", content_sections: "Sections", content_links: "Links & footer",
  cf_kicker: "Kicker", cf_title: "Title", cf_subtitle: "Subtitle",
  cf_cta_primary: "Primary button", cf_cta_secondary: "Secondary button",
  cf_about_title: "Title", cf_about_body: "Body",
  cf_years: "Years of experience", cf_years_label: "Years label",
  cf_services_title: "Services title", cf_services_subtitle: "Services subtitle",
  cf_work_title: "Work title", cf_work_subtitle: "Work subtitle",
  cf_contact_title: "Contact title", cf_contact_subtitle: "Contact subtitle",
  cf_whatsapp: "WhatsApp URL", cf_facebook: "Facebook URL", cf_tagline: "Footer tagline",
  cf_para_hint: "Blank lines create paragraphs.",
  content_save_all: "Save All Content",

  msg_sub: "Contact-form submissions",
  msg_inbox: "Inbox",
  msg_mark_read: "Mark as Read",
  confirm_delete_message: "Delete this message?",
  msg_empty: "No messages yet. Submissions from the contact form will appear here.",
},
ar: {
  // brand / meta
  brand_name: "دانا جو",
  brand_first: "دانا",
  brand_last: "جو",
  meta_title_suffix: "دانا جو — مصممة جرافيك",
  meta_description: "دانا جو مصممة جرافيك بخبرة ٥ سنوات، تصمّم هويات بصرية مدروسة ومطبوعات وتصاميم رقمية.",

  // header / nav
  nav_home: "الرئيسية", nav_work: "الأعمال", nav_services: "الخدمات", nav_about: "عن دانا", nav_contact: "تواصل",
  nav_cta: "لنتحدث",
  open_menu: "فتح القائمة",
  lang_switch_label: "تبديل اللغة",
  lang_other: "English",

  // hero
  hero_tagline_line: "تصميم مدروس، يدوم",
  hero_stamp: "مصممة جرافيك · دانا جو · مصممة جرافيك ·",
  scroll_cue: "مرر للأسفل",
  stat_branding: "الهوية", stat_branding_sub: "الهوية والشعارات",
  stat_print: "المطبوعات", stat_print_sub: "التحرير والتغليف",
  stat_digital: "الرقمي", stat_digital_sub: "مرئيات السوشيال والويب",

  // marquee
  mq_1: "الهوية البصرية", mq_2: "تصميم المطبوعات", mq_3: "التصميم الرقمي",
  mq_4: "فن الحروف", mq_5: "السوشيال ميديا", mq_6: "التغليف",

  // section eyebrows / headings
  eyebrow_portfolio: "الأعمال", eyebrow_services: "ماذا أقدم", eyebrow_news: "الأخبار",
  eyebrow_about: "عن دانا", eyebrow_contact: "تواصل",
  announcements_heading: "إعلانات", announcement_label: "إعلان",

  // work cards / buttons
  view_project: "عرض المشروع",
  view_all_work: "عرض كل الأعمال",
  all_filter: "الكل",
  show_all: "عرض الكل",
  empty_work_title: "المعرض قيد التجهيز",
  empty_work_body: "ستظهر هنا مشاريع مختارة قريباً. وحتى ذلك الحين، لا تتردد في التواصل بخصوص مشروعك.",
  empty_work_filter_title: "لا توجد مشاريع هنا بعد",
  empty_work_filter_cat: "لا شيء منشور في «{cat}» بعد — جرّب فئة أخرى.",
  empty_work_filter_plain: "المعرض قيد التجهيز. ستظهر الأعمال المختارة هنا قريباً.",
  get_in_touch: "تواصل معي",

  // project page
  back_to_work: "عودة إلى الأعمال",
  fact_designer: "المصممة", fact_category: "الفئة",
  keep_exploring: "واصل الاستكشاف", other_projects: "مشاريع أخرى",
  start_your_project: "ابدأ مشروعك",

  // services page
  services_empty_title: "الخدمات قريباً",
  services_empty_body: "قائمة الخدمات قيد التجهيز. يرجى التواصل مباشرة لمناقشة مشروعك.",
  discuss_your_project: "ناقش مشروعك",

  // about
  badge_years_craft: "{n} سنوات من الحِرفة",
  about_stat_identity: "الهوية", about_stat_identity_sub: "أنظمة العلامات",
  about_stat_detail: "الدقة", about_stat_detail_sub: "حِرفة تقودها الحروف",
  read_more: "اقرأ المزيد", see_the_work: "شاهد الأعمال",

  // CTA band
  cta_eyebrow: "لنتعاون معاً",
  cta_title_a: "عندك مشروع", cta_title_b: "في بالك؟",
  cta_body: "لنصنع شيئاً مدروساً معاً. أرسل رسالة أو تواصل مباشرة عبر واتساب.",
  send_a_message: "أرسل رسالة",

  // contact
  sent_title: "تم إرسال الرسالة.",
  sent_body: "شكراً لك — تم استلام رسالتك وستُقرأ شخصياً.",
  label_name: "الاسم", label_email: "البريد الإلكتروني", label_message: "رسالتك",
  ph_name: "مثال: سارة أحمد", ph_email: "name@example.com", ph_message: "حدثني عن مشروعك…",
  send_message: "إرسال الرسالة",
  prefer_direct: "تفضل التواصل", prefer_direct_em: "مباشرة؟",
  wa_card_sub: "دردش مباشرة — عادةً يتم الرد بسرعة",
  fb_card_sub: "تابع وراسل على فيسبوك",
  enquiry_note_title: "كل استفسار يُقرأ شخصياً",
  enquiry_note_body: "لا روبوتات ولا ردود آلية — فقط رد مدروس.",
  err_contact_required: "يرجى تعبئة الاسم والبريد الإلكتروني والرسالة.",
  err_contact_email: "عنوان البريد الإلكتروني هذا لا يبدو صحيحاً.",

  // footer
  footer_studio: "الاستوديو", footer_explore: "استكشف", footer_more: "المزيد", footer_connect: "تواصل",
  footer_exp: "مصممة جرافيك · ٥ سنوات من الخبرة",
  footer_about_dana: "عن دانا", footer_enquiries: "استفسارات", footer_admin: "الإدارة",
  footer_rights: "جميع الحقوق محفوظة.", footer_care: "صُمم بعناية.",

  // 404 / 500 / misc
  err_404_title: "الصفحة غير موجودة",
  err_404_h: "هذه الصفحة تاهت عن الطريق",
  err_404_p: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
  back_home: "عودة للرئيسية",
  err_500_title: "حدث خطأ ما",
  err_500_h: "حدث خطأ ما",
  err_500_p: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى بعد قليل.",
  err_413: "الملف كبير جداً (الحد الأقصى 5MB).",
  err_unauthorized: "غير مصرّح",
  err_not_found: "غير موجود",
  err_project_not_found: "المشروع غير موجود",

  // language names (for dual-language fields)
  lang_name_en: "الإنجليزية", lang_name_ar: "العربية",

  // ---------- ADMIN ----------
  admin_title_suffix: "إدارة دانا جو",
  admin_dashboard: "لوحة التحكم", admin_projects: "المشاريع", admin_services: "الخدمات",
  admin_announcements: "الإعلانات", admin_content: "محتوى الموقع", admin_messages: "الرسائل",
  admin_view_site: "عرض الموقع", admin_logout: "تسجيل الخروج",

  login_title: "تسجيل دخول الإدارة",
  login_h: "مرحباً بعودتك",
  login_p: "سجّل الدخول لإدارة معرض دانا جو.",
  login_bad: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  login_email: "البريد الإلكتروني", login_password: "كلمة المرور", login_btn: "تسجيل الدخول",
  login_back: "عودة إلى الموقع",

  dash_sub: "نظرة عامة على معرض أعمالك",
  stat_projects: "المشاريع", stat_published: "المنشورة", stat_services: "الخدمات",
  stat_announcements: "الإعلانات", stat_messages: "الرسائل", stat_unread: "غير المقروءة",
  recent_messages: "أحدث الرسائل", view_all: "عرض الكل",
  th_name: "الاسم", th_email: "البريد الإلكتروني", th_message: "الرسالة", th_date: "التاريخ", th_status: "الحالة",
  badge_read: "مقروءة", badge_new: "جديدة",
  dash_no_messages: "لا توجد رسائل بعد. ستظهر هنا إرسالات نموذج التواصل الجديدة.",
  quick_actions: "إجراءات سريعة",
  qa_new_project: "+ مشروع جديد", qa_new_announcement: "+ إعلان جديد", qa_edit_content: "تحرير محتوى الموقع",

  proj_sub: "أنشئ أعمال المعرض وانشرها ونظّمها",
  proj_all: "كل المشاريع",
  th_title: "العنوان", th_category: "الفئة", th_order: "الترتيب", th_actions: "إجراءات",
  badge_published: "منشور", badge_draft: "مسودة",
  btn_edit: "تحرير", btn_publish: "نشر", btn_unpublish: "إلغاء النشر", btn_delete: "حذف",
  confirm_title: "هل أنت متأكد؟",
  confirm_delete_project: "حذف هذا المشروع وكل صوره؟",
  proj_empty: "لا توجد مشاريع بعد. أنشئ مشروعك الأول لبدء بناء المعرض.",

  pf_edit: "تحرير المشروع", pf_new: "مشروع جديد",
  pf_new_sub: "أضف قطعة جديدة للمعرض",
  pf_title_required: "العنوان مطلوب.",
  file_too_large: "الصورة كبيرة جدًا — الرجاء استخدام ملف أصغر من 5 ميجابايت.",
  upload_failed: "فشل الرفع. حاول مرة أخرى بصورة أصغر.",
  toast_saved: "تم الحفظ بنجاح.",
  toast_deleted: "تم الحذف بنجاح.",
  toast_published: "تم النشر.",
  toast_unpublished: "تم النقل إلى المسودات.",
  toast_sent: "تم إرسال الرسالة.",
  too_many_attempts: "محاولات كثيرة جدًا — الرجاء الانتظار بضع دقائق ثم المحاولة مجددًا.",
  pf_details: "التفاصيل",
  pf_title: "العنوان", pf_title_req: "العنوان *",
  pf_category: "الفئة",
  pf_category_hint: "تُستخدم لفلاتر المعرض في الموقع العام.",
  pf_description: "الوصف",
  pf_sort: "ترتيب العرض",
  pf_sort_hint: "الأرقام الأصغر تظهر أولاً.",
  pf_published: "منشور (ظاهر في الموقع العام)",
  pf_cover: "صورة الغلاف",
  pf_cover_replace: "استبدال الغلاف", pf_cover_upload: "رفع الغلاف",
  pf_img_hint: "بصيغة JPG أو PNG أو WebP أو GIF · بحد أقصى 5MB.",
  pf_gallery: "صور المعرض",
  pf_gallery_add: "إضافة صور",
  pf_gallery_hint: "يمكنك اختيار عدة ملفات. بصيغة JPG أو PNG أو WebP أو GIF · بحد أقصى 5MB لكل ملف.",
  pf_gallery_empty: "لا توجد صور معرض بعد — أضف بعضها أعلاه.",
  pf_save: "حفظ التغييرات", pf_create: "إنشاء المشروع",
  btn_cancel: "إلغاء",
  pf_remove_cover: "إزالة صورة الغلاف",
  confirm_remove_cover: "إزالة صورة الغلاف؟",
  confirm_delete_image: "حذف هذه الصورة؟",
  pf_caption_ph: "تعليق…",
  ph_project_title: "مثال: هوية مقهى بلوم",
  ph_project_category: "مثال: الهوية، المطبوعات، الرقمي",
  ph_project_desc: "احكِ قصة هذا المشروع…",

  svc_sub: "إدارة الخدمات الظاهرة في الموقع العام",
  svc_edit: "تحرير الخدمة", svc_add: "إضافة خدمة",
  svc_title_req: "العنوان *", svc_sort: "ترتيب العرض", svc_desc: "الوصف",
  svc_published: "منشور",
  svc_save: "حفظ التغييرات", svc_add_btn: "إضافة الخدمة",
  svc_all: "كل الخدمات",
  confirm_delete_service: "حذف هذه الخدمة؟",
  svc_empty: "لا توجد خدمات بعد.",
  ph_service_title: "مثال: الهوية البصرية",
  ph_service_desc: "ماذا تشمل هذه الخدمة؟",

  ann_sub: "الأخبار والعروض والترويجات",
  ann_edit: "تحرير الإعلان", ann_new: "إعلان جديد",
  ann_title_req: "العنوان *", ann_body: "المحتوى", ann_image: "الصورة",
  ann_replace: "(استبدال)",
  ann_img_hint: "اختياري · بصيغة JPG أو PNG أو WebP أو GIF · بحد أقصى 5MB.",
  ann_save: "حفظ التغييرات", ann_add_btn: "إضافة الإعلان",
  ann_all: "كل الإعلانات",
  confirm_delete_announcement: "حذف هذا الإعلان؟",
  ann_empty: "لا توجد إعلانات بعد.",
  ph_ann_title: "مثال: خصم 20% على باقات الهوية هذا الشهر",
  ph_ann_body: "تفاصيل الإعلان أو العرض…",

  content_sub: "تحرير النصوص الظاهرة في الموقع العام",
  content_saved: "تم حفظ المحتوى — الموقع العام يعرض الآن النص المحدّث.",
  content_hero: "الواجهة الرئيسية", content_about: "عن دانا", content_sections: "الأقسام", content_links: "الروابط والتذييل",
  cf_kicker: "السطر التعريفي", cf_title: "العنوان", cf_subtitle: "العنوان الفرعي",
  cf_cta_primary: "الزر الرئيسي", cf_cta_secondary: "الزر الثانوي",
  cf_about_title: "العنوان", cf_about_body: "المحتوى",
  cf_years: "سنوات الخبرة", cf_years_label: "تسمية السنوات",
  cf_services_title: "عنوان الخدمات", cf_services_subtitle: "العنوان الفرعي للخدمات",
  cf_work_title: "عنوان الأعمال", cf_work_subtitle: "العنوان الفرعي للأعمال",
  cf_contact_title: "عنوان التواصل", cf_contact_subtitle: "العنوان الفرعي للتواصل",
  cf_whatsapp: "رابط واتساب", cf_facebook: "رابط فيسبوك", cf_tagline: "سطر التذييل",
  cf_para_hint: "الأسطر الفارغة تُنشئ فقرات.",
  content_save_all: "حفظ كل المحتوى",

  msg_sub: "إرسالات نموذج التواصل",
  msg_inbox: "البريد الوارد",
  msg_mark_read: "تعليم كمقروءة",
  confirm_delete_message: "حذف هذه الرسالة؟",
  msg_empty: "لا توجد رسائل بعد. ستظهر هنا إرسالات نموذج التواصل.",
},
};

const LOCALES = ["en", "ar"];

function normalizeLocale(l) {
  return l === "ar" ? "ar" : "en";
}

/* t('nav_home', 'ar') -> "الرئيسية". Falls back to English, then the key. */
function t(key, locale) {
  const L = normalizeLocale(locale);
  if (STRINGS[L] && STRINGS[L][key] != null) return STRINGS[L][key];
  if (STRINGS.en[key] != null) return STRINGS.en[key];
  return key;
}

/* Simple {name} interpolation: tf('empty_work_filter_cat','ar',{cat:'X'}) */
function tf(key, locale, vars) {
  let s = t(key, locale);
  if (vars) for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
  return s;
}

/* Pick the localized value of a DB row field: L(row,'title','ar') -> row.title_ar || row.title */
function L(row, field, locale) {
  if (!row) return "";
  if (normalizeLocale(locale) === "ar") {
    const v = row[field + "_ar"];
    if (v != null && String(v).trim() !== "") return v;
  }
  const v = row[field];
  return v == null ? "" : v;
}

function dirOf(locale) {
  return normalizeLocale(locale) === "ar" ? "rtl" : "ltr";
}

/* Verify dictionaries stay in sync — every EN key must exist in AR. */
function missingKeys() {
  const enKeys = Object.keys(STRINGS.en);
  return enKeys.filter((k) => !(k in STRINGS.ar));
}

module.exports = { STRINGS, LOCALES, normalizeLocale, t, tf, L, dirOf, missingKeys };
