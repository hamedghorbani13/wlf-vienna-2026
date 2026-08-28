# Editing website text and translations

Site-wide interface text is stored in `content.csv`. Open it in Excel and save changes using **CSV UTF-8 (Comma delimited)** so German and Farsi characters remain intact.

The file has four columns:

- `location`: the stable identifier that tells the page where the text appears
- `english`: English text
- `german`: German text
- `farsi`: Farsi text

Keep every `location` value unchanged and unique. You may freely edit the three language columns. If a translation is empty, the page falls back to English.

## Contact placeholders

The public contact placeholders live in these rows:

- `contact.email.value`
- `contact.instagram.value`

Replace the bracketed values in all three language columns when the final email
address and Instagram handle are available. The former volunteer and booth
request buttons have been removed.

## Group-card text

Group text uses three rows per group:

- `group.01.name`
- `group.01.address`
- `group.01.contact`

The number corresponds to the row order in `groups.csv`. For example, the second group uses the `group.02.*` rows. These translation rows are optional: every non-empty row in `groups.csv` still creates one card and falls back to the values in that row. The three translated descriptions, logos, and contact URLs remain in `groups.csv`.

## Program

The site currently shows only the confirmed event time, 14:00–19:00. `program.csv` is reserved for a future detailed timeline and is not loaded by the page yet.

## Local preview

The website automatically adds a fresh cache-busting query to every active CSV request (`content.csv`, `groups.csv`, and `links.csv`) so published content updates are not hidden by an older CDN copy.

Browsers block CSV loading when `index.html` is opened directly. From the landing-page folder, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` and use the EN, DE, and FA buttons in the header.
