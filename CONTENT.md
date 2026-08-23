# Editing website text and translations

Site-wide interface text is stored in `content.csv`. Open it in Excel and save changes using **CSV UTF-8 (Comma delimited)** so German and Farsi characters remain intact.

The file has four columns:

- `location`: the stable identifier that tells the page where the text appears
- `english`: English text
- `german`: German text
- `farsi`: Farsi text

Keep every `location` value unchanged and unique. You may freely edit the three language columns. If a translation is empty, the page falls back to English.

## External links

External destinations are stored separately in `links.csv`. To activate the
volunteer button, paste the complete Google Form URL into the `url` column for
`participate.volunteer`. Leave it blank until the form is ready; the button
will remain disabled instead of sending visitors to a broken page.

## Group-card text

Group text uses three rows per group:

- `group.01.name`
- `group.01.address`
- `group.01.contact`

The number corresponds to the row order in `groups.csv`. For example, the second group uses the `group.02.*` rows. The three translated descriptions, logos, and contact URLs remain in `groups.csv`.

## Program

The site currently shows only the confirmed event time, 14:00–19:00. `program.csv` is reserved for a future detailed timeline and is not loaded by the page yet.

## Local preview

Browsers block CSV loading when `index.html` is opened directly. From the landing-page folder, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` and use the EN, DE, and FA buttons in the header.
