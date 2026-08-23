# Updating participating groups

The participating-group cards use `groups.csv` for their logo and contact URL. Their visible text and translations are stored in `content.csv`; see `CONTENT.md`.

## Excel workflow

1. Open `groups.csv` in Excel.
2. Keep the first row and add one group per row.
3. In Excel, choose **Save As → CSV UTF-8 (Comma delimited)**.
4. Replace the existing `groups.csv` in the website folder and publish the updated file.

Do not rename or remove the column headings:

- `name`: English fallback name; edit the displayed translations in the matching `group.XX.name` row of `content.csv`
- `logo`: local image path, such as `images/group-name.png` (optional). The file must exist at that exact path, including matching capitalization.
- `address`: fallback address; edit the displayed translations in `content.csv`
- `english`, `german`, `farsi`: the group's description in each language; English is the fallback when a translation is empty
- `contact_label`: fallback link text; edit the displayed translations in `content.csv`
- `contact_url`: full `https://` URL or a `mailto:` address

Excel automatically handles descriptions that contain commas. Keep the file in UTF-8 so German, Persian, and other international characters display correctly.

Logo paths should use forward slashes and be relative to `index.html`. For example, `images/khane_ketab.png` means the file must be stored at `Landing Page/images/khane_ketab.png`. Do not paste a Windows path such as `C:\Users\...`; local absolute paths will not work after the site is published.

## Local preview

Browsers block CSV loading when `index.html` is opened directly as a file. From this folder, run:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. This restriction does not apply when the landing page is hosted normally.
