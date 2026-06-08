const BOT_TOKEN       = '8974707455:AAHVKFqQgfyZ9Ge5-AqRU02GMASlQZtDHwY';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztt_nJyy_GN8zTikOfAItS8cfii8BDfvEXOQtLE7yjnR3f9roR8ljaNLwOPEp8Uzg9/exec';
const SITE_URL        = 'https://wedding-invitation-liubomyr-maryana.uk';

const FEMALE_NAMES = ['юля', 'оксана', 'лора', 'інна', 'софія'];
const MALE_NAMES   = ['саша'];

function getGreeting(name) {
  const words = name.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (FEMALE_NAMES.includes(word)) return 'Люба';
    if (MALE_NAMES.includes(word))   return 'Любий';
  }
  return 'Любі';
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const query  = msg.text.trim();

  if (query === '/start') {
    await sendMessage(chatId, "Введіть ім'я або код гостя для пошуку посилання.");
    return;
  }

  const res = await fetch(
    `${APPS_SCRIPT_URL}?search=${encodeURIComponent(query)}`,
    { redirect: 'follow' }
  );

  if (!res.ok) {
    await sendMessage(chatId, 'Помилка пошуку. Спробуйте пізніше.');
    return;
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    await sendMessage(chatId, 'Нікого не знайдено 🔍');
    return;
  }

  const messages = data.results.map(r => {
    const url      = `${SITE_URL}/?code=${encodeURIComponent(r.code)}`;
    const greeting = getGreeting(r.name);
    return `${greeting} ${r.name}!\n` +
      'З радістю запрошуємо вас стати частиною одного з важливих днів у нашому житті - нашого весілля💍\n' +
      'Нижче ви знайдете наше весільне запрошення з усією необхідною інформацією.\n' +
      'З нетерпінням чекаємо зустрічі та святкування разом з вами!\n\n' +
      `<a href="${url}">Посилання</a>`;
  });

  await sendMessage(chatId, messages.join('\n\n---\n\n'));
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/telegram' && request.method === 'POST') {
      try {
        const update = await request.json();
        ctx.waitUntil(handleUpdate(update));
      } catch {}
      return new Response('ok');
    }

    return env.ASSETS.fetch(request);
  },
};
