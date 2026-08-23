# Updating the event program

The detailed timeline is temporarily disabled because only the confirmed event time (14:00–19:00) is known. The website does not currently load `program.csv`; keep it as a draft for when the detailed schedule is confirmed.

## Excel workflow

1. Open `program.csv` in Excel.
2. Keep the first row and use one row per program item.
3. In Excel, choose **Save As → CSV UTF-8 (Comma delimited)**.
4. Replace the existing `program.csv` in the website folder and publish it with the other site files.

Do not rename or remove the column headings:

- `time`: start time in 24-hour `HH:MM` format, such as `14:00`
- `title_english`, `title_german`, `title_farsi`: item title in each language
- `body_english`, `body_german`, `body_farsi`: item description in each language

If a German or Farsi cell is empty, the website falls back to the English value. Keep the file in UTF-8 so German and Persian characters display correctly.

The row order in the CSV is the display order on the website.

## Local preview

Browsers block CSV loading when `index.html` is opened directly as a file. From this folder, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000` and use the EN, DE, and FA buttons to verify every translation.
