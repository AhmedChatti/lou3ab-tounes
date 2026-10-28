# Lou3ab Tounes · لعب تونس

Trivia games about Tunisia, in French, English and Arabic.

**Live: https://lou3ab-tounes.vercel.app** (Vercel redeploys on every push to `main`).

| Game | Type | What you do |
|---|---|---|
| Wilayadle | daily | Loldle-style: guess the governorate; each column (region, coast, borders, population, area, delegations, distance) turns green, orange or red with ↑↓ arrows. Bonus: tap its neighbours |
| Persondle | daily | Loldle-style: guess the Tunisian personality (field, gender, birthplace, region, birth year, living). Roster in `assets/people.js`, plus one new person per day |
| Chkoun? | daily | Mystery person or place told in clues, 3 guesses on the map to find where they come from |
| Ghouss | daily | 7 prompts; rarer (less populated) answers dive deeper |
| Tarikh | daily + endless | Place historical events (814 BC → 2015) on a timeline |
| Mnin? | endless | Singers, clubs, dishes, monuments: tap their governorate |
| Blitz | endless | 60 s to find governorates, or 90 s for delegations |
| Akthar walla Aqal | endless | Higher or lower: population, area, growth (INS 2024) |
| Party | local | Pass-and-play with 3 lives each, or a 10-question challenge link (`#defi-CODE`) |

Daily puzzles start on 28 Oct 2026 (#1). Old puzzles: `#wilayadle-3`, `#chkoun-3`, etc.

## Deploy on Vercel (free)

It is a static site: no build step.

1. Install Node.js, then in this folder run:
   ```
   npx vercel --prod
   ```
   Log in when asked, accept the defaults ("Other" framework, no build command, output = `.`).
2. Or: push this folder to a GitHub repo, then on vercel.com → Add New Project → import the repo → Deploy.

Netlify Drop (app.netlify.com/drop) also works: drag this folder onto the page.

Open `index.html` directly in a browser to play locally.

## Daily content

`assets/daily.js` holds extra content keyed by date (`YYYY-MM-DD`). For each date it can set:

- `wilayadle`: the day's governorate (`g`) and a fun fact shown after the game
- `chkoun`: a new mystery (4 clues in en/fr/ar, birthplace text)
- `ghouss`: up to 7 custom prompts with their list of valid ids
- `tarikh`: new events (they are dealt first in that day's timeline, then join the deck)
- `mnin`: new origin cards (shown under "New" for 7 days, then join the pool)
- `akthar`: a themed higher/lower deck (at least 6 items with a numeric `value` and a `source`)

A scheduled task fills the next day every night and runs `node tools/content.js validate` before pushing.
Helper commands: `node tools/content.js govs`, `dels TN-41`, `used`, `next`.

## Editing content

- `assets/facts.js`: origin cards (Mnin?, Party) and daily mysteries (Chkoun?)
- `assets/history.js`: timeline events (Tarikh), with Arabic text
- `assets/data.js`: generated from Map Tunisia (governorates, delegations, borders). Don't edit by hand.

## Credits

Map data © OpenStreetMap contributors (ODbL) · [Map Tunisia](https://github.com/Alaa-Taieb/map-tunisia) by Alaa Taieb · Census figures INS 2024.
