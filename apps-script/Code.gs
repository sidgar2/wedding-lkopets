// ── Заповніть ці константи перед деплоєм ──────────────────────────────────
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
var TELEGRAM_BOT_TOKEN = ''; // залиш порожнім якщо не потрібен Telegram
var TELEGRAM_CHAT_ID    = ''; // залиш порожнім якщо не потрібен Telegram
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
      return jsonResponse({ found: false, error: 'sheet_not_found', sheets: ss.getSheets().map(function(s){ return s.getName(); }) });
    }

    var data  = sheet.getDataRange().getValues();

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

    return jsonResponse({ found: false, debug: { searched: code, rows: data.length - 1, first_codes: data.slice(1, 4).map(function(r){ return String(r[0]).toLowerCase().trim(); }) } });

  } catch (err) {
    return jsonResponse({ found: false, error: String(err) });
  }
}

// POST з JSON-тілом → зберігає RSVP, надсилає Telegram-сповіщення
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    // Валідація обов'язкових полів
    if (!body.name || !body.attendance) {
      return jsonResponse({ success: false, error: 'missing_fields' });
    }

    if (['yes', 'no', 'maybe'].indexOf(body.attendance) === -1) {
      return jsonResponse({ success: false, error: 'invalid_attendance' });
    }

    var code = body.guestCode ? String(body.guestCode).toLowerCase().trim() : '';

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Витягуємо ім'я з таблиці Guests і оновлюємо колонку C (статус присутності)
    var resolvedName = String(body.name || '').substring(0, 200);
    if (code && CODE_REGEX.test(code)) {
      var guestsSheet = ss.getSheetByName('Guests');
      var guestsData  = guestsSheet.getDataRange().getValues();
      var statusMark  = body.attendance === 'yes' ? '+' : (body.attendance === 'no' ? '-' : '?');
      for (var i = 1; i < guestsData.length; i++) {
        if (String(guestsData[i][0]).toLowerCase().trim() === code) {
          resolvedName = String(guestsData[i][1]);
          guestsSheet.getRange(i + 1, 3).setValue(statusMark); // колонка C
          break;
        }
      }
    }

    // Записуємо відповідь у вкладку RSVP
    var rsvpSheet = ss.getSheetByName('RSVP');
    rsvpSheet.appendRow([
      new Date().toISOString(),
      code,
      resolvedName,
      Number(body.guestCount) || 1,
      body.attendance,
      String(body.wishes || '').substring(0, 500),
    ]);

    // Telegram-сповіщення (опціонально)
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

      try {
        UrlFetchApp.fetch(
          'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
          {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: msg }),
            muteHttpExceptions: true,
          }
        );
      } catch (_) {
        // Telegram-помилка не впливає на основну відповідь
      }
    }

    return jsonResponse({ success: true });

  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}
