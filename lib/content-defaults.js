"use strict";
/* Default site content + seed services in both languages. */

const DEFAULT_CONTENT = {
  hero_kicker: "Graphic Designer · Portfolio",
  hero_title: "Dana Jo",
  hero_subtitle:
    "Graphic designer with 5 years of experience crafting thoughtful identities, print and digital design — where every detail earns its place.",
  hero_cta_primary: "View Work",
  hero_cta_secondary: "Get in Touch",
  about_title: "About Dana",
  about_body:
    "Dana Jo is a graphic designer with five years of experience. Her work focuses on clear, considered design — from brand identities to print and digital pieces — built around the client's story and made to last.\n\nThis portfolio collects selected work. New pieces are added as they are completed.",
  about_years: "5",
  about_projects_label: "Years of experience",
  services_title: "Services",
  services_subtitle: "Design services, tailored to each project.",
  work_title: "Selected Work",
  work_subtitle: "A curated collection of projects. Filter by category.",
  contact_title: "Get in Touch",
  contact_subtitle: "Have a project in mind? Send a message — every enquiry is read personally.",
  whatsapp_url: "https://wa.me/962798061352",
  facebook_url: "https://www.facebook.com/share/1UNyRxe3nU/?mibextid=wwXIfr",
  footer_tagline: "Thoughtful design, made to last.",
};

const DEFAULT_CONTENT_AR = {
  hero_kicker: "مصممة جرافيك · معرض أعمال",
  hero_title: "دانا جو",
  hero_subtitle:
    "مصممة جرافيك بخبرة خمس سنوات، أصمّم هويات مدروسة ومطبوعات وتصاميم رقمية — حيث كل تفصيلة تستحق مكانها.",
  hero_cta_primary: "شاهد الأعمال",
  hero_cta_secondary: "تواصل معي",
  about_title: "عن دانا",
  about_body:
    "دانا جو مصممة جرافيك بخبرة خمس سنوات. يركّز عملها على التصميم الواضح والمدروس — من الهويات البصرية إلى المطبوعات والقطع الرقمية — المبني حول قصة العميل والمصمّم ليدوم.\n\nيجمع هذا المعرض أعمالاً مختارة، وتُضاف قطع جديدة كلما اكتملت.",
  about_years: "5",
  about_projects_label: "سنوات من الخبرة",
  services_title: "الخدمات",
  services_subtitle: "خدمات تصميم مصمّمة خصيصاً لكل مشروع.",
  work_title: "أعمال مختارة",
  work_subtitle: "مجموعة منتقاة من المشاريع. صفّ حسب الفئة.",
  contact_title: "تواصل معي",
  contact_subtitle: "عندك مشروع في بالك؟ أرسل رسالة — كل استفسار يُقرأ شخصياً.",
  footer_tagline: "تصميم مدروس، مصمّم ليدوم.",
};

const DEFAULT_SERVICES = [
  { title: "Brand Identity", description: "Logos and visual identity systems designed around your story — refined, consistent and built to last.", sort_order: 0 },
  { title: "Social Media & Marketing Design", description: "Scroll-stopping visuals for campaigns, launches and everyday content across platforms.", sort_order: 1 },
  { title: "Print & Editorial Design", description: "Brochures, packaging, stationery and layouts with careful typography and craft.", sort_order: 2 },
];

const DEFAULT_SERVICES_AR = [
  { title: "هوية العلامة التجارية", description: "شعارات وأنظمة هوية بصرية مصمّمة حول قصتك — راقية ومتسقة ومبنية لتدوم." },
  { title: "تصميم السوشيال ميديا والتسويق", description: "مرئيات لافتة للحملات والإطلاقات والمحتوى اليومي عبر المنصات." },
  { title: "تصميم المطبوعات والتحرير", description: "بروشورات وتغليف وقرطاسية وتخطيطات بعناية طباعية وحرفية." },
];

module.exports = { DEFAULT_CONTENT, DEFAULT_CONTENT_AR, DEFAULT_SERVICES, DEFAULT_SERVICES_AR };
