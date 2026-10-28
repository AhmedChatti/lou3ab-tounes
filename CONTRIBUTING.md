# Contributing to Lou3ab Tunisia

Thanks for helping Tunisians and visitors learn more about the country!

## Report an error

Open an issue with:
1. the game and the date of the puzzle (or the card),
2. what is wrong,
3. a link to a reliable source showing the correct information.

## Add or fix content

| You want to… | Edit |
|---|---|
| Fix a Mnin? card or a Chkoun? mystery | `assets/facts.js` |
| Add a history event | `assets/history.js` (fields `y`, `en`, `fr`, `ar`, `d_en`, `d_fr`, `d_ar`) |
| Add a personality | `assets/people.js` (birthplace and birth year must be sourced) |
| Add a dish, festival, player or club, or a spelling | `assets/ghouss.js` (`alt` holds alternative spellings) |
| Add content for a specific day | `assets/daily.js`, then `node tools/content.js validate` |

Rules:
- One reliable source per fact. If sources disagree, leave the item out.
- All texts in English, French and Arabic (correct MSA, standard Unicode).
- Song titles only, never lyrics. No photos without the right to use them.
- Keep clues short (≤ 110 characters).

## Code

The engine is a single file, `assets/app.js`, written in plain JavaScript with no dependencies.
Test locally with `python3 -m http.server`, in the three languages and at phone width, before opening a pull request.
