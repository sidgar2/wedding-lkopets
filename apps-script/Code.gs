// ── Заповніть ці константи перед деплоєм ──────────────────────────────────
var SPREADSHEET_ID   = '1vnq1qBfNckK1ZO22EM66DUPCvx34vzrCGzezyWzrf4M';
var TELEGRAM_BOT_TOKEN = '8974707455:AAHVKFqQgfyZ9Ge5-AqRU02GMASlQZtDHwY';  // токен від @BotFather
var TELEGRAM_CHAT_ID   = '391330540';  // chat_id для RSVP-сповіщень
var SITE_URL           = 'https://wedding-invitation-liubomyr-maryana.uk';
// ──────────────────────────────────────────────────────────────────────────

var CODE_REGEX = /^[a-z2-9]{4,8}$/i;

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET ?code=xxxxxx → повертає дані гостя
// GET ?search=NAME  → повертає список знайдених гостей
function doGet(e) {
  try {
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Guests');
    if (!sheet) return jsonResponse({ found: false, error: 'sheet_not_found' });
    var data = sheet.getDataRange().getValues();

    // Пошук по імені або коду для Telegram-бота
    var searchQuery = String((e.parameter && e.parameter.search) || '').toLowerCase().trim();
    if (searchQuery) {
      var results = [];
      for (var i = 1; i < data.length; i++) {
        var rowCode = String(data[i][0]).toLowerCase().trim();
        var rowName = String(data[i][1]).toLowerCase().trim();
        if (rowCode === searchQuery || rowName.indexOf(searchQuery) !== -1) {
          results.push({ code: String(data[i][0]).trim(), name: String(data[i][1]).trim() });
        }
      }
      return jsonResponse({ results: results });
    }

    // Пошук по коду для сайту
    var code = String((e.parameter && e.parameter.code) || '').toLowerCase().trim();
    if (!CODE_REGEX.test(code)) return jsonResponse({ found: false, error: 'invalid_code' });

    for (var j = 1; j < data.length; j++) {
      if (String(data[j][0]).toLowerCase().trim() === code) {
        return jsonResponse({
          found: true,
          guest: {
            code:       String(data[j][0]),
            name:       String(data[j][1]),
            multiTrack: String(data[j][3]).trim().toLowerCase() === 'yes',
          }
        });
      }
    }

    return jsonResponse({ found: false });

  } catch (err) {
    return jsonResponse({ found: false, error: String(err) });
  }
}

// POST → або Telegram webhook, або RSVP-відповідь
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // Telegram webhook
    if (body.message !== undefined) {
      handleTelegramUpdate(body);
      return jsonResponse({ ok: true });
    }

    // RSVP submission
    if (!body.name || !body.attendance) {
      return jsonResponse({ success: false, error: 'missing_fields' });
    }

    if (['yes', 'no', 'maybe'].indexOf(body.attendance) === -1) {
      return jsonResponse({ success: false, error: 'invalid_attendance' });
    }

    var code = body.guestCode ? String(body.guestCode).toLowerCase().trim() : '';
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    var resolvedName = String(body.name || '').substring(0, 200);
    if (code && CODE_REGEX.test(code)) {
      var guestsSheet = ss.getSheetByName('Guests');
      var guestsData  = guestsSheet.getDataRange().getValues();
      var statusMark  = body.attendance === 'yes' ? '+' : (body.attendance === 'no' ? '-' : '?');
      for (var i = 1; i < guestsData.length; i++) {
        if (String(guestsData[i][0]).toLowerCase().trim() === code) {
          resolvedName = String(guestsData[i][1]);
          guestsSheet.getRange(i + 1, 3).setValue(statusMark);
          break;
        }
      }
    }

    var rsvpSheet = ss.getSheetByName('RSVP');
    rsvpSheet.appendRow([
      new Date().toISOString(),
      code,
      resolvedName,
      Number(body.guestCount) || 1,
      body.attendance,
      String(body.wishes || '').substring(0, 500),
    ]);

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      var emoji      = body.attendance === 'yes' ? '✅' : (body.attendance === 'no' ? '❌' : '🤔');
      var statusText = body.attendance === 'yes' ? 'Буде' : (body.attendance === 'no' ? 'Не буде' : 'Ще вагається');
      var msg = [
        emoji + ' Нова відповідь RSVP',
        'Гість: ' + resolvedName,
        'Статус: ' + statusText,
        'Кількість: ' + (body.guestCount || 1),
        'Побажання: ' + (body.wishes || '—'),
      ].join('\n');

      sendTelegramMessage(TELEGRAM_CHAT_ID, msg);
    }

    return jsonResponse({ success: true });

  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

// ── Telegram bot ───────────────────────────────────────────────────────────

function getGreeting(name) {
  var words = name.toLowerCase().split(/\s+/);
  var femaleNames = ['юля', 'оксана', 'лора', 'інна', 'софія'];
  var maleNames   = ['саша'];
  for (var i = 0; i < words.length; i++) {
    if (femaleNames.indexOf(words[i]) !== -1) return 'Люба';
    if (maleNames.indexOf(words[i])   !== -1) return 'Любий';
  }
  return 'Любі';
}

function handleTelegramUpdate(update) {
  var props    = PropertiesService.getScriptProperties();
  var lastId   = parseInt(props.getProperty('last_update_id') || '0');
  if (update.update_id <= lastId) return;
  props.setProperty('last_update_id', String(update.update_id));

  var msg = update.message;
  if (!msg || !msg.text) return;

  var chatId = String(msg.chat.id);
  var query  = msg.text.trim();

  if (query === '/start') {
    sendTelegramMessage(chatId, 'Введіть ім\'я або код гостя для пошуку посилання.');
    return;
  }

  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('Guests');
  if (!sheet) {
    sendTelegramMessage(chatId, 'Таблиця Guests не знайдена.');
    return;
  }

  var data   = sheet.getDataRange().getValues();
  var results = [];
  var search  = query.toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var rowCode = String(data[i][0]).toLowerCase().trim();
    var rowName = String(data[i][1]).toLowerCase().trim();

    if (rowCode === search || rowName.indexOf(search) !== -1) {
      results.push({
        code: String(data[i][0]).trim(),
        name: String(data[i][1]).trim(),
      });
    }
  }

  if (results.length === 0) {
    sendTelegramMessage(chatId, 'Нікого не знайдено 🔍');
    return;
  }

  var messages = results.map(function(r) {
    var url      = SITE_URL + '/?code=' + encodeURIComponent(r.code);
    var greeting = getGreeting(r.name);
    return greeting + ' ' + escapeHtml(r.name) + '!\n' +
      'З радістю запрошуємо вас стати частиною одного з важливих днів у нашому житті - нашого весілля💍\n' +
      'Нижче ви знайдете наше весільне запрошення з усією необхідною інформацією.\n' +
      'З нетерпінням чекаємо зустрічі та святкування разом з вами!\n\n' +
      '<a href="' + url + '">Посилання</a>';
  });

  sendTelegramMessage(chatId, messages.join('\n\n---\n\n'), 'HTML');
}

function sendTelegramMessage(chatId, text, parseMode) {
  if (!TELEGRAM_BOT_TOKEN) return;
  var payload = { chat_id: chatId, text: text };
  if (parseMode) payload.parse_mode = parseMode;

  UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function keepWarm() {
  // тримає скрипт активним щоб уникнути cold start затримок
}

// Викликати один раз для реєстрації webhook
function setWebhook() {
  var scriptUrl = ScriptApp.getService().getUrl().replace('/dev', '/exec');
  var res = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/setWebhook',
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ url: scriptUrl }),
      muteHttpExceptions: true,
    }
  );
  Logger.log(res.getContentText());
}
