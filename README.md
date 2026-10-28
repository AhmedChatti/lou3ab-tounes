# Lou3ab Tunisia · لعب تونس

**Daily trivia games to discover Tunisia: its 24 governorates and 279 delegations, its personalities, history, food, festivals and football.**
Playable in French, English and Arabic, on phone or computer, free and without an account.

### ▶ Play: **https://lou3ab-tounes.vercel.app**

![Lou3ab Tunisia](assets/og.png)

---

## Why this project

Most Tunisians can name their own governorate and a few big cities, but far fewer could place Siliana on a map,
say who was born in Nebeur, or tell when the Hafsid sultan al-Mustansir faced the crusade of Louis IX.
And for people outside Tunisia, the country often stops at Carthage, Djerba and the beaches.

**Lou3ab Tunisia wants Tunisians and foreigners alike to learn more about the country, one short game a day.**
Every puzzle is built on verified data: official census figures (INS 2024), precise open-source maps, and facts
checked against reliable sources. Lose or win, every round ends with something new learned.

## The games

| Game | Mode | How it works |
|---|---|---|
| 🗺️ **Wilayadle** | Daily | Guess the governorate of the day. Each guess is compared column by column, Loldle-style: region, coast, borders, population, area, number of delegations, distance and direction (green = right, orange = close, red = wrong, ↑↓ = higher/lower). Bonus round: tap its neighbours. |
| 👤 **Persondle** | Daily | Guess the Tunisian personality of the day: field, gender, governorate and region of birth, birth year, living or not. |
| 🕵️ **Chkoun?** | Daily | A mystery person or place. One clue to start, one more after each wrong guess on the map (5 clues). Where does it come from? |
| 🤿 **Ghouss** | Daily | Seven prompts about Tunisian food, festivals, holidays, footballers and clubs. Answers few players give take you deeper (Krillion-style). Typo-tolerant with "Did you mean…?". |
| 📜 **Tarikh** | Daily + endless | Place historical events on a timeline, from the founding of Carthage to the Nobel Peace Prize of 2015, with many lesser-known episodes in between. |
| 📍 **Mnin?** | Endless | Singers, clubs, dishes, monuments: tap the governorate each one comes from. |
| ⚡ **Blitz** | Endless | Find all 24 governorates in 60 s, or 15 delegations in 90 s. |
| 📊 **Akthar walla Aqal** | Endless | Higher or lower: population, area, growth (INS 2024), plus a new theme every day. |
| 🎉 **Party** | Local / link | Pass the phone around (3 lives each), or send a 10-question challenge link to friends. |

Daily puzzles change at midnight (player's local time). Players see a countdown to the next one, and shared statistics
("2,481 people already found it", "you did better than 63% of players").

## How it works

```
                ┌─────────────────────────────┐
  every night   │ Scheduled task (Claude)     │  researches & verifies tomorrow's content,
  20:22 Tunis → │ writes assets/daily.js      │  runs tools/content.js validate, pushes
                └──────────────┬──────────────┘
                               │ git push
                ┌──────────────▼──────────────┐
                │ GitHub: this repository     │
                └──────────────┬──────────────┘
                               │ auto-deploy
                ┌──────────────▼──────────────┐      ┌─────────────────────────┐
                │ Vercel: static site + /api  │ ───► │ Upstash Redis           │
                │ lou3ab-tounes.vercel.app    │      │ shared stats & answers  │
                └─────────────────────────────┘      └─────────────────────────┘
```

- **No build step.** The site is plain HTML, CSS and JavaScript; it opens straight from `index.html`.
- **Daily content.** `assets/daily.js` holds content keyed by date (`YYYY-MM-DD`): the governorate and person of the day, a new Chkoun mystery, Ghouss prompts and answers, history events, Mnin cards and an Akthar theme. A nightly scheduled task adds the next day and checks it with `node tools/content.js validate` before pushing.
- **Player progress** stays in each player's browser (`localStorage`). There are no accounts.
- **Shared statistics** go through one serverless function, `api/stats.js`, backed by Upstash Redis. Each player is counted once per puzzle through an anonymous random ID.
- **Accuracy policy.** Every birthplace, date and figure is checked against at least one reliable source (Wikipedia in several languages, INS, official sites). When sources disagree, the item is left out.

## Project structure

```
lou3ab-tounes/
├── index.html              Page shell, meta tags, script includes
├── vercel.json             Caching headers
├── api/
│   └── stats.js            Shared statistics (Vercel function → Upstash Redis)
├── assets/
│   ├── app.js              The whole game engine (router, 9 games, maps, i18n, stats)
│   ├── style.css           Styles, light & dark themes
│   ├── data.js             Map data: 24 governorates, 279 delegations, borders, coast (generated)
│   ├── facts.js            Mnin? origin cards and Chkoun? mysteries
│   ├── history.js          Tarikh timeline events (en/fr/ar)
│   ├── people.js           Persondle roster
│   ├── ghouss.js           Ghouss answer bank (food, events, players, clubs)
│   ├── daily.js            Content added day by day
│   ├── people/             Optional photos for Persondle (see its README)
│   ├── og.png, icon.svg    Share image and favicon
├── tools/
│   └── content.js          Validate daily content, list ids, find unused items
├── prep_data.py            Regenerates assets/data.js from Map Tunisia
├── LICENSE                 MIT (code)
└── LICENSE-CONTENT.md      Licences for content and map data
```

## Run it locally

```bash
git clone https://github.com/AhmedChatti/lou3ab-tounes.git
cd lou3ab-tounes
python3 -m http.server 8000      # or any static server
# open http://localhost:8000
```

Everything works locally except shared statistics, which need the API (`vercel dev` with the Upstash variables).

## Deploy your own copy

1. Import the repository on [Vercel](https://vercel.com/new) (framework: *Other*, no build command).
2. Optional, for shared stats: add **Upstash for Redis** from the Vercel Marketplace and connect it to the project. The API reads `KV_REST_API_URL` / `KV_REST_API_TOKEN` (prefixed names work too).

## Content toolbox

```bash
node tools/content.js validate        # check assets/daily.js
node tools/content.js next            # first date without content
node tools/content.js used            # everything already used (avoid repeats)
node tools/content.js govs            # governorate ids, population, area, neighbours
node tools/content.js dels TN-41      # delegations of a governorate
node tools/content.js ghouss food     # Ghouss answer bank by category
```

To regenerate the map data from a fresh copy of Map Tunisia: clone it next to this repo and run `python3 prep_data.py`.

## Contributing

Found a wrong fact, a missing spelling, a dish or a footballer we forgot?

- **Open an issue** with the correction and a source link, or
- **Send a pull request** editing the relevant file in `assets/` (run `node tools/content.js validate` first).

Please keep the accuracy policy: one reliable source per fact, no song lyrics, no photos you do not have the rights to.

## Credits

- **Map data:** [Map Tunisia](https://github.com/Alaa-Taieb/map-tunisia) by [Alaa Taieb](https://www.linkedin.com/in/alaa-taieb/), built from © OpenStreetMap contributors (ODbL). Thank you Alaa for making such precise maps open to everyone.
- **Census figures:** Institut National de la Statistique (INS), RGPH 2014 and 2024.
- **Inspiration:** Worldle, Loldle, Originle and Krillion.

## License

- Code: [MIT](LICENSE)
- Game content: CC BY 4.0
- Map data: ODbL 1.0

Details in [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

## Author

**Ahmed Chatti**
[LinkedIn](https://www.linkedin.com/in/ahmedchatti/) · If you enjoy the games, connect with me and ⭐ the repository!
