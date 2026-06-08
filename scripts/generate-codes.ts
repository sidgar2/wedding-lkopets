/**
 * Генератор унікальних кодів для гостей.
 * Запуск: npx tsx scripts/generate-codes.ts
 *
 * Результат:
 *  - виводить посилання у консоль
 *  - зберігає guests-import.tsv для вставки у Google Таблицю
 */

import { randomBytes } from 'crypto'
import { writeFileSync } from 'fs'

// ── Алфавіт без неоднозначних символів (без 0/o/O/1/l/I) ──────────────────
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const CODE_LEN = 6

// ── ЗАПОВНІТЬ ЦЕЙ СПИСОК ВРУЧНУ ───────────────────────────────────────────
interface GuestEntry {
  name: string       // ім'я для привітання на сайті
  side: 'bride' | 'groom'
  notes?: string     // внутрішні нотатки (не показуються гостю)
}

const GUESTS: GuestEntry[] = [
  { name: 'Олег та Світлана Коваль',  side: 'groom' },
  { name: 'Родина Петренків',          side: 'bride', notes: '2 дітей' },
  { name: 'Марія Іваненко',            side: 'bride' },
  // ... додайте своїх гостей
]

// ── Генерація ──────────────────────────────────────────────────────────────
const SITE_URL = 'https://your-site.com' // замініть на реальний URL

function generateCode(used: Set<string>): string {
  for (;;) {
    const bytes = randomBytes(CODE_LEN)
    const code = Array.from(bytes)
      .map((b) => ALPHABET[b % ALPHABET.length])
      .join('')
    if (!used.has(code)) {
      used.add(code)
      return code
    }
  }
}

const used = new Set<string>()
const tsvRows = ['code\tname\tside\tnotes']
const links: string[] = []

for (const guest of GUESTS) {
  const code = generateCode(used)
  tsvRows.push(`${code}\t${guest.name}\t${guest.side}\t${guest.notes ?? ''}`)
  links.push(`${SITE_URL}/?guest=${code}  —  ${guest.name}`)
}

writeFileSync('guests-import.tsv', tsvRows.join('\n'), 'utf-8')

console.log('\n╔══════════════════════════════════════════════════════════╗')
console.log('║   Посилання для розсилки гостям                          ║')
console.log('╚══════════════════════════════════════════════════════════╝\n')
links.forEach((l) => console.log(l))
console.log('\n[✓] Файл guests-import.tsv збережено у корені проєкту')
console.log('[→] Відкрийте Google Таблицю → вкладка Guests → вставте вміст файлу\n')
