/** Landing pastki bo'limlari — barcha variantlar (/l, /1–/5) uchun umumiy matnlar */

export const LIVE_STATS = [
  { num: '0', lab: 'Ovoz berildi' },
  { num: '0', lab: "So'm to'landi" },
  { num: '0', lab: 'Qatnashuvchi' },
  { num: '0%', lab: "To'lovni oldi" },
] as const;

export const LANDING_TRUST = [
  "To'lovlar himoyalangan",
  'Bir necha daqiqada',
  'Istalgan karta',
  '97% muvaffaqiyat',
] as const;

export const LANDING_STEPS = [
  {
    n: '1',
    title: "Telegram'ga kiring",
    text: "Pastdagi tugmani bosing — to'g'ri botga o'tasiz. Parol, email, hech narsa so'ralmaydi.",
  },
  {
    n: '2',
    title: '/start bosing',
    text: 'Botni ochib /start bosing. Keyin u o\'zi yo\'l-yo\'riq beradi.',
  },
  {
    n: '3',
    title: 'Ovoz bering, mukofot oling',
    text: 'Ovoz bergach, to\'lov bir necha daqiqada tushadi. Hisob ko\'tarila boshlaydi.',
  },
] as const;

export const LANDING_REWARDS = [
  {
    tag: 'Asosiy',
    title: 'Har bir ovoz',
    amount: '35 000',
    unit: "so'm",
    desc: 'Har bir ovoz berganda avtomatik hisobingizga tushadi.',
  },
  {
    tag: 'Bonus',
    title: 'Faol ishtirokchi',
    amount: '25 000',
    unit: "so'm",
    desc: "10 ta ovoz bergan foydalanuvchilarga qo'shimcha bonus.",
  },
  {
    tag: 'Grand sovrin',
    title: 'Top ishtirokchi',
    amount: 'iPhone 17',
    unit: '',
    desc: "Oylik eng faol ishtirokchi maxsus sovg'a oladi.",
  },
] as const;

export const FINALE_BULLETS = [
  "Ro'yxatdan o'tish kerak emas",
  "To'lov bir necha daqiqada",
  'Istalgan Uzcard yoki Humo kartaga',
] as const;

type FaqSettings = { reviews_count: string; support_username: string };

export function landingFaqItems(s: FaqSettings) {
  return [
    {
      q: "To'lov rostdan tushadi?",
      a: `Ha. Har bir tasdiqlangan ovoz uchun avtomatik tarzda to'lov amalga oshiriladi. ${s.reviews_count} odam allaqachon oldi.`,
    },
    {
      q: 'Qaysi kartaga tushadi?',
      a: 'Istalgan Uzcard yoki Humo kartaga. Botda karta raqamingizni kiritasiz — pul shu kartaga tushadi.',
    },
    {
      q: "Ro'yxatdan o'tish kerakmi?",
      a: "Yo'q. Telegram hisobingiz yetarli — parol, email yoki hujjat so'ralmaydi.",
    },
    {
      q: 'Bir kishi necha marta ovoz bera oladi?',
      a: "Har bir tashabbus bo'yicha bir marta ovoz berish mumkin. Yangi tashabbuslar ochilganda yana ishtirok etishingiz mumkin.",
    },
    {
      q: "To'lov kechiksa nima qilaman?",
      a: `@${s.support_username} ga yozing — holatingizni tekshirib, tez yordam beramiz.`,
      supportLink: true,
    },
  ] as const;
}
