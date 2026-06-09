<p align="center">
  <img src="image.png" alt="Musician Toolkit" width="200">
</p>

# Musician Toolkit

**v0.3.1** — A complete browser-based toolkit for guitarists, songwriters, and bands. No installation, no account, no server — everything runs locally in your browser with `localStorage` and `IndexedDB` for persistence.

---

## Tabs

| Tab                 | Description                                                              |
| ------------------- | ------------------------------------------------------------------------ |
| 🎸 Tuner            | Chromatic tuner via microphone — cents meter, per-string reference panel |
| 🥁 Metronome        | Tap tempo, time signatures 2/4–7/8, BPM 40–240; includes Speed Trainer for auto-ramping |
| 🎵 Chords           | SVG chord diagrams with multiple voicings, search any chord              |
| 🎼 Scales           | Interactive fretboard for 12 scale types, click to hear notes            |
| ⭕ Circle of Fifths | Interactive major/minor rings, diatonic chord display, jump-to-chord     |
| 📓 Song Vault       | Full song management — originals & covers, audio files, sections, gear notes, GitHub audio sync |
| 🔧 Tools            | Chord transposer, capo calculator, rhyme finder                          |
| 📋 Setlist Builder  | Drag-and-drop setlists with runtime stats and print export               |
| 👂 Ear Training     | Play random intervals or chords via Web Audio — guess and score          |
| 💸 Expense Splitter | Track shared band costs; calculates who owes who                         |
| 📞 Band Contacts    | Names, roles, phones, emergency contacts for every member                |
| ⚙️ Settings         | GitHub backup/restore — metadata + audio files                           |

---

## Opening the App

Open `index.html` directly in a modern browser. No build step, no dependencies, no server required.

**Chrome/Edge:** The microphone (Tuner tab) requires a secure context. A plain `file:///` URL may be blocked. Serve locally instead:

```bash
# Node
npx serve .

# Python
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

**Firefox / Safari:** Microphone works from `file:///` by default.

---

## Song Vault (v0.3)

The Song Vault is a full-featured song management system for originals and covers.

### Song types

| Type | Statuses |
|---|---|
| ⭐ **Original** | 🧩 Fragment → 💡 Idea → 🔨 In Progress → ✅ Finished → 🎤 Performing |
| 🎵 **Cover** | 📚 Learning → ✅ Ready → 🎤 Performing |

### Filter bar

Two-row filter: type toggle (All / My Creations / Covers) + status chips that update based on the selected type. Combined with a free-text search and sort (last edited, A-Z, BPM, key).

### Quick Idea

Press **+ Quick Idea** for a minimal capture overlay: title, freeform notes, type + status. Saves immediately with a timestamp. Build it out fully later in the editor.

### Song editor

Click any song card to open the slide-in editor. Four inner tabs:

**📝 Song**
- Originals: Key, BPM, Time Sig, Capo, Tags, Co-writers
- Covers: Original Artist, Key, BPM, Capo, Tags, Reference URL (with live link preview), Reference Notes
- **Drag-and-drop sections** (Intro / Verse / Chorus / Bridge / Solo / Outro / Custom) — each has Chords, Lyrics, Notes, and Repeat Count
- **Scratchpad** — private braindump, never exported

**🎙️ Audio**
- Drop zone for MP3, WAV, M4A, OGG, WebM, FLAC (max 50 MB per file)
- Files stored in **IndexedDB** (binary, not localStorage)
- Inline playback via Blob URL — no re-upload needed
- Editable labels per file
- Sync status per file: ⏳ Not synced / ✅ Synced to GitHub

**ℹ️ Details**
- Description / story, Copyright year, PRO registration, ISRC code
- Auto timestamps (Created / Last Edited)

**🔧 Gear & Performance**
- Strumming / picking pattern, Amp settings, Pedals / signal chain, Live arrangement notes, Tempo feel (Straight / Swing / Shuffle / Rubato)

### Export

Press **📄 Export** in the editor to download a `.txt` chord sheet (title, key info, sections with chords + lyrics). The scratchpad is never included.

---

## GitHub Backup (optional)

Backs up all songs and setlists to a GitHub repository. v0.3 extends this to include audio files.

### Setup

1. Create a repository on GitHub (public or private).
2. Generate a **Personal Access Token (PAT)** with `repo` scope at [github.com/settings/tokens](https://github.com/settings/tokens).
3. In ⚙️ Settings → GitHub Backup, fill in Owner, Repository, Token, and File path (default: `musician-toolkit/data.json`).
4. Click **Save Settings**.

### Push

- Uploads `musician-toolkit/data.json` (all song metadata + setlists, version 2 format).
- Then uploads each pending audio file to `musician-toolkit/audio/{uuid}.{ext}`.
- Progress bar shown during audio uploads.
- Any audio files queued for deletion are also removed from the repo.

### Pull

- Downloads `data.json` and restores all songs and setlists.
- Compares audio file IDs in the pulled data against what's already in IndexedDB.
- Downloads only **missing** audio files — never re-downloads files you already have.
- Progress bar shown during audio downloads.

### Repo layout

```
musician-toolkit/
├── data.json          ← all metadata (songs + setlists)
└── audio/
    ├── {uuid}.mp3
    ├── {uuid}.wav
    └── ...
```

> The token is transmitted only to `api.github.com` via `Authorization: Bearer`. It is never written to console logs, URLs, or any third-party service.

---

## MusicBrainz Lookup

Auto-fill artist, duration, and genre when adding songs.

**No API key or account needed.** Available from the old-style song modal (use the song editor's Save flow for new songs). Rate limit: 1 request/second.

---

## Microphone Permissions (Tuner)

- Microphone is only requested when you press **START TUNER**.
- The audio stream is closed automatically when you stop the tuner or switch tabs.
- No audio is stored or transmitted anywhere.

---

## Tools

### Transposer

Paste any chord chart (plain text, with or without lyrics). Use **−1 / +1** to shift by semitones or **−6 / +6** to jump a tritone. **↕ Swap** uses the transposed output as new input. **Copy** copies the result.

### Capo Calculator

Select your target key. The table shows which open-chord shapes to play at each capo position (0–7). Positions marked ★ use common open shapes (C, D, E, G, A).

### Rhyme Finder

Enter a word and press **Find Rhymes** or Enter. Results fetched from [Datamuse API](https://www.datamuse.com/api/) (free, no API key). Click any chip to copy it.

---

## Ear Training

Choose **Intervals** or **Chords** mode. Press ♪ to hear the audio, then pick from four options. Your score is tracked for the session.

## Speed Trainer

Set start BPM, target BPM, step size, and interval in seconds. The click track starts slow and auto-increases until the target is reached.

## Expense Splitter

Log shared costs (rehearsal space, gear, van fuel) with who paid and who participates. The settlement panel shows the minimum payments to clear all balances. Data persists in localStorage.

## Band Contacts

Store name, role, phone, email, and emergency contact for every band member. Data persists in localStorage.

---

## Browser Support

Chrome 90+, Firefox 88+, Edge 90+, Safari 15+. Requires Web Audio API and IndexedDB support (all modern browsers).

## Data Storage

| Data | Storage |
|---|---|
| Songs & setlists metadata | `localStorage` (`musician_*` namespace) |
| Audio file binaries | `IndexedDB` (`MusicianToolkitDB / audioFiles`) |
| Sync state (pending/synced IDs) | `localStorage` |

Nothing is sent to any server unless you explicitly use GitHub sync.
