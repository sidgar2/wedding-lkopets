const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyD06ilCnakXiDM7MU6lwJ04ZN8ln9icsWeJBWwISuW5LZxiaWX6zdZAUXAcQKM73g7/exec';
const SECRET = 'weddingLK2026';

export async function onRequestPost(context) {
  try {
    const update = await context.request.json();
    const msg = update?.message;
    const cbq = update?.callback_query;

    if (msg?.text) {
      const params = new URLSearchParams({
        action:   'tg',
        secret:   SECRET,
        updateId: String(update.update_id),
        chatId:   String(msg.chat.id),
        text:     msg.text,
      });
      context.waitUntil(fetch(`${APPS_SCRIPT_URL}?${params}`));
    } else if (cbq) {
      const params = new URLSearchParams({
        action:   'tg_cb',
        secret:   SECRET,
        updateId: String(update.update_id),
        cbqId:    cbq.id,
        chatId:   String(cbq.message.chat.id),
        data:     cbq.data,
      });
      context.waitUntil(fetch(`${APPS_SCRIPT_URL}?${params}`));
    }
  } catch {}
  return new Response('ok');
}
