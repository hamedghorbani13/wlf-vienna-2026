# Website versions

The root folder is the updated primary landing page. It keeps the conventional
page structure while using the new poster's vermilion, black, and warm-paper
palette.

Three additional, independently previewable projects live under `versions/`:

1. `01-fixed-poster` — the poster stays fixed across the entire page while
   translucent paper panels move over it.
2. `02-scroll-chapters` — each content section behaves like a full-screen
   chapter, with a subtle background drift tied to scroll progress.
3. `03-woven-path` — sections alternate around a braided vertical path while
   the poster remains full-screen behind the story.

Each project contains its own HTML, CSS, JavaScript, CSV files, font, poster,
and group logos. To preview all four from this directory, run:

```powershell
python -m http.server 8000
```

Then open:

- `http://localhost:8000/`
- `http://localhost:8000/versions/01-fixed-poster/`
- `http://localhost:8000/versions/02-scroll-chapters/`
- `http://localhost:8000/versions/03-woven-path/`

Every non-empty data row in a project's `groups.csv` creates exactly one group
card. Update the CSV inside the specific project being published. If the same
group list should appear in all versions, copy the finished `groups.csv` and
its referenced logo files into each project folder.

## Five storytelling concepts

Five further, independently previewable narrative projects live under
`story-versions/`. They are not visual reskins: each uses a different way of
moving through the material.

1. `01-her-name-was-jina` — an intimate, linear portrait that begins with one
   person before widening into the movement and the Vienna gathering.
2. `02-three-words` — three full-screen semantic chapters built around Woman,
   Life, and Freedom.
3. `03-echoes-archive` — a nonlinear field of six clickable story fragments,
   followed by an optional guided reading path.
4. `04-four-years` — a scroll-led chronology with a sticky year rail from the
   slogan's Kurdish roots through the 2026 anniversary.
5. `05-memory-to-meeting` — a braided route from remembrance to participation,
   ending with what visitors will encounter in Vienna.

After starting the local server, open the gallery at:

- `http://localhost:8000/story-versions/`

Each concept is self-contained and has its own `story.csv`, `groups.csv`,
poster, group logos, font, and calendar file. Text in `story.csv` is provided
in English, German, and Persian. As with the primary site, every non-empty row
of a concept's `groups.csv` automatically creates one card.
