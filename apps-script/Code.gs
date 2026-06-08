// ── Заповніть ці константи перед деплоєм ──────────────────────────────────
var SPREADSHEET_ID   = 'YOUR_SPREADSHEET_ID_HERE';
var TELEGRAM_BOT_TOKEN = '';  // токен від @BotFather
var TELEGRAM_CHAT_ID   = '';  // chat_id для RSVP-сповіщень
var SITE_URL           = 'https://wedding-invitation-liubomyr-maryana.uk';
// ──────────────────────────────────────────────────────────────────────────

var CODE_REGEX = /^[a-z2-9]{4,8}$/i;

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET ?code=xxxxxx → повертає дані гостя або { found: false }
function doGet(e) {
  try {
    var code = String((e.parameter && e.parameter.code) || '').toLowerCase().trim();

    if (!CODE_REGEX.test(code)) {
      return jsonResponse({ found: false, error: 'invalid_code' });
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Guests');

    if (!sheet) {
      return jsonResponse({ found: false, error: 'sheet_not_found' });
    }

    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      var rowCode = String(data[i][0]).toLowerCase().trim();
      if (rowCode === code) {
        return jsonResponse({
          found: true,
          guest: {
            code:       String(data[i][0]),
            name:       String(data[i][1]),
            multiTrack: String(data[i][3]).trim().toLowerCase() === 'yes',
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

function handleTelegramUpdate(update) {
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

  var data    = sheet.getDataRange().getValues();
  var results = [];
  var search  = query.toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var rowCode = String(data[i][0]).toLowerCase().trim();
    var rowName = String(data[i][1]).toLowerCase().trim();
    var colF    = String(data[i][5]).trim(); // колонка F

    if (rowCode === search || rowName.indexOf(search) !== -1) {
      results.push({
        code:  String(data[i][0]).trim(),
        label: colF || String(data[i][1]).trim(),
      });
    }
  }

  if (results.length === 0) {
    sendTelegramMessage(chatId, 'Нікого не знайдено 🔍');
    return;
  }

  var lines = results.map(function(r) {
    var url = SITE_URL + '/?code=' + encodeURIComponent(r.code);
    return '<a href="' + url + '">' + escapeHtml(r.label) + '</a>';
  });

  sendTelegramMessage(chatId, lines.join('\n'), 'HTML');
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

// Викликати один раз для реєстрації webhook
function setWebhook() {
  var scriptUrl = ScriptApp.getService().getUrl();
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
