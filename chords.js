// ============================================================
//  MUSICIAN TOOLKIT — Chord Library
//  All voicings: [E2, A2, D3, G3, B3, e4] low to high
//  Values: -1=muted, 0=open, n=fret number (absolute)
// ============================================================

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTE_ENHARMONICS = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};
const CHORD_DISPLAY_NAMES = {
  'major':'maj','minor':'m','7':'7','maj7':'maj7','m7':'m7',
  'sus2':'sus2','sus4':'sus4','dim':'dim','aug':'aug','add9':'add9',
  '6':'6','m6':'m6','9':'9','dim7':'dim7','m7b5':'m7b5'
};

function normalizeNote(n) { return NOTE_ENHARMONICS[n] || n; }
function noteIndex(n) { return NOTES.indexOf(normalizeNote(n)); }
function noteAt(idx) { return NOTES[((idx % 12) + 12) % 12]; }

// Standard tuning open string MIDI: E2=40,A2=45,D3=50,G3=55,B3=59,e4=64
const OPEN_MIDI = [40, 45, 50, 55, 59, 64];

const CHORD_INTERVALS = {
  'major': [0,4,7], 'minor': [0,3,7],
  '7':     [0,4,7,10], 'maj7': [0,4,7,11],
  'm7':    [0,3,7,10], 'sus2': [0,2,7],
  'sus4':  [0,5,7],    'dim':  [0,3,6],
  'aug':   [0,4,8],    'add9': [0,4,7,14],
  '6':     [0,4,7,9],  'm6':   [0,3,7,9],
  '9':     [0,4,7,10,14], 'dim7': [0,3,6,9],
  'm7b5':  [0,3,6,10],
};

const CHORD_FORMULAS = {
  'major': ['1','3','5'],   'minor': ['1','b3','5'],
  '7':     ['1','3','5','b7'], 'maj7': ['1','3','5','7'],
  'm7':    ['1','b3','5','b7'], 'sus2': ['1','2','5'],
  'sus4':  ['1','4','5'],   'dim':   ['1','b3','b5'],
  'aug':   ['1','3','#5'],  'add9':  ['1','3','5','9'],
  '6':     ['1','3','5','6'], 'm6':  ['1','b3','5','6'],
  '9':     ['1','3','5','b7','9'], 'dim7': ['1','b3','b5','bb7'],
  'm7b5':  ['1','b3','b5','b7'],
};

// Root note fret position on each string
function rootFretOnString(rootName, stringIdx) {
  const rootMidi = noteIndex(normalizeNote(rootName)) + 48; // relative
  const openMidi = OPEN_MIDI[stringIdx];
  const openNote = openMidi % 12;
  const rootNote = noteIndex(normalizeNote(rootName));
  let fret = (rootNote - openNote + 12) % 12;
  return fret;
}

// E-shape barre patterns (root on string 0/E2 at fret r)
function eShape(r, type) {
  const shapes = {
    'major': [r,   r+2, r+2, r+1, r,   r  ],
    'minor': [r,   r+2, r+2, r,   r,   r  ],
    '7':     [r,   r+2, r,   r+1, r,   r  ],
    'maj7':  [r,   r+2, r+1, r+1, r,   r  ],
    'm7':    [r,   r+2, r,   r,   r,   r  ],
    'sus2':  [r,   r+2, r+4, r+4, r,   r  ],
    'sus4':  [r,   r+2, r+2, r+2, r,   r  ],
    'dim':   [-1,  r,   r+1, r+2, r+1, r>0?r-1:-1],
    'aug':   [r,   r+3, r+2, r+1, r+1, r  ],
    'add9':  [r,   r+2, r+4, r+1, r,   r  ],
    '6':     [r,   r+2, r+2, r+1, r+2, r  ],
    'm6':    [r,   r+2, r+2, r,   r+2, r  ],
    'dim7':  [-1,  r,   r+1, r+2, r+1, r+2],
    'm7b5':  [r,   r+1, r+2, r,   r,   r  ],
    '9':     [r,   r+2, r,   r+1, r,   r+2],
  };
  return shapes[type] || shapes['major'];
}

// A-shape barre patterns (root on string 1/A2 at fret r)
function aShape(r, type) {
  const shapes = {
    'major': [-1, r,   r+2, r+2, r+2, r  ],
    'minor': [-1, r,   r+2, r+2, r+1, r  ],
    '7':     [-1, r,   r+2, r,   r+2, r  ],
    'maj7':  [-1, r,   r+2, r+1, r+2, r  ],
    'm7':    [-1, r,   r+2, r,   r+1, r  ],
    'sus2':  [-1, r,   r+2, r+2, r,   r  ],
    'sus4':  [-1, r,   r+2, r+2, r+3, r  ],
    'dim':   [-1, r,   r+1, r+2, r+1, r>0?r-1:-1],
    'aug':   [-1, r,   r+3, r+2, r+2, r+1],
    'add9':  [-1, r,   r+2, r+2, r+2, r+2],
    '6':     [-1, r,   r+2, r+2, r+2, r+2],
    'm6':    [-1, r,   r+2, r+2, r+1, r+2],
    'dim7':  [-1, r,   r+1, r+2, r+1, r>0?r-1:-1],
    'm7b5':  [-1, r,   r+1, r+2, r+1, r  ],
    '9':     [-1, r,   r+2, r,   r+2, r+2],
  };
  return shapes[type] || shapes['major'];
}

// Finger assignments for E-shape
function eFingers(r, type) {
  if (r === 0) {
    const open = {
      'major':[0,2,3,1,0,0], 'minor':[0,2,3,0,0,0],
      '7':    [0,2,0,1,0,0], 'maj7': [0,2,1,1,0,0],
      'm7':   [0,2,0,0,0,0], 'sus2': [0,2,4,3,0,0],
      'sus4': [0,2,3,4,0,0], 'aug':  [0,3,2,1,1,0],
      'add9': [0,2,4,1,0,0],
    };
    return open[type] || [0,2,3,1,0,0];
  }
  const barre = {
    'major': [1,3,4,2,1,1], 'minor': [1,3,4,1,1,1],
    '7':     [1,3,0,2,1,1], 'maj7':  [1,3,2,2,1,1],
    'm7':    [1,3,0,0,1,1], 'sus2':  [1,2,4,3,1,1],
    'sus4':  [1,2,3,4,1,1], 'aug':   [1,4,3,2,2,1],
    'add9':  [1,3,4,2,1,1],
  };
  return barre[type] || [1,3,4,2,1,1];
}

// Finger assignments for A-shape
function aFingers(r, type) {
  if (r === 0) {
    const open = {
      'major':[0,0,2,2,2,0], 'minor':[0,0,2,2,1,0],
      '7':    [0,0,2,0,2,0], 'maj7': [0,0,2,1,2,0],
      'm7':   [0,0,2,0,1,0], 'sus2': [0,0,2,2,0,0],
      'sus4': [0,0,2,2,3,0], 'aug':  [0,0,3,2,2,1],
    };
    return open[type] || [0,0,2,2,2,0];
  }
  const barre = {
    'major': [0,1,3,3,3,1], 'minor': [0,1,3,3,2,1],
    '7':     [0,1,3,1,3,1], 'maj7':  [0,1,3,2,3,1],
    'm7':    [0,1,3,1,2,1], 'sus2':  [0,1,3,3,1,1],
    'sus4':  [0,1,3,3,4,1], 'aug':   [0,1,4,3,3,2],
  };
  return barre[type] || [0,1,3,3,3,1];
}

// Compute chord notes for a given root and type
function getChordNotes(rootName, type) {
  const rootIdx = noteIndex(rootName);
  if (rootIdx === -1) return [];
  const intervals = CHORD_INTERVALS[type] || CHORD_INTERVALS['major'];
  return intervals.map(i => noteAt(rootIdx + i));
}

// Build base_fret and validate a fret array
function buildVoicing(frets, type, rootName, barre) {
  const nonMuted = frets.filter(f => f > 0);
  if (nonMuted.length === 0) return null;
  const minFret = Math.min(...nonMuted);
  const baseFret = Math.max(1, barre ? barre.fret : minFret);
  return { frets, baseFret, barre: barre || null };
}

// Manually curated open chord voicings (overrides generated shapes)
const OPEN_OVERRIDES = {
  'C_major':  { frets:[-1,3,2,0,1,0], fingers:[0,3,2,0,1,0], baseFret:1, barre:null },
  'D_major':  { frets:[-1,-1,0,2,3,2], fingers:[0,0,0,1,3,2], baseFret:1, barre:null },
  'E_major':  { frets:[0,2,2,1,0,0], fingers:[0,2,3,1,0,0], baseFret:1, barre:null },
  'F_major':  { frets:[1,3,3,2,1,1], fingers:[1,3,4,2,1,1], baseFret:1, barre:{fret:1,strings:[0,5]} },
  'G_major':  { frets:[3,2,0,0,0,3], fingers:[2,1,0,0,0,3], baseFret:1, barre:null },
  'A_major':  { frets:[-1,0,2,2,2,0], fingers:[0,0,1,2,3,0], baseFret:1, barre:null },
  'B_major':  { frets:[-1,2,4,4,4,2], fingers:[0,1,2,3,4,1], baseFret:2, barre:{fret:2,strings:[1,5]} },
  'Am_minor': { frets:[-1,0,2,2,1,0], fingers:[0,0,2,3,1,0], baseFret:1, barre:null },
  'Em_minor': { frets:[0,2,2,0,0,0], fingers:[0,2,3,0,0,0], baseFret:1, barre:null },
  'Dm_minor': { frets:[-1,-1,0,2,3,1], fingers:[0,0,0,2,3,1], baseFret:1, barre:null },
  'Bm_minor': { frets:[-1,2,4,4,3,2], fingers:[0,1,3,4,2,1], baseFret:2, barre:{fret:2,strings:[1,5]} },
  'E_7':      { frets:[0,2,0,1,0,0], fingers:[0,2,0,1,0,0], baseFret:1, barre:null },
  'A_7':      { frets:[-1,0,2,0,2,0], fingers:[0,0,2,0,3,0], baseFret:1, barre:null },
  'D_7':      { frets:[-1,-1,0,2,1,2], fingers:[0,0,0,2,1,3], baseFret:1, barre:null },
  'G_7':      { frets:[3,2,0,0,0,1], fingers:[3,2,0,0,0,1], baseFret:1, barre:null },
  'C_7':      { frets:[-1,3,2,3,1,0], fingers:[0,3,2,4,1,0], baseFret:1, barre:null },
  'B_7':      { frets:[-1,2,1,2,0,2], fingers:[0,2,1,3,0,4], baseFret:1, barre:null },
  'E_maj7':   { frets:[0,2,1,1,0,0], fingers:[0,3,1,2,0,0], baseFret:1, barre:null },
  'A_maj7':   { frets:[-1,0,2,1,2,0], fingers:[0,0,2,1,3,0], baseFret:1, barre:null },
  'D_maj7':   { frets:[-1,-1,0,2,2,2], fingers:[0,0,0,1,2,3], baseFret:1, barre:null },
  'G_maj7':   { frets:[3,2,0,0,0,2], fingers:[3,2,0,0,0,1], baseFret:1, barre:null },
  'C_maj7':   { frets:[-1,3,2,0,0,0], fingers:[0,3,2,0,0,0], baseFret:1, barre:null },
  'Am_m7':    { frets:[-1,0,2,0,1,0], fingers:[0,0,2,0,1,0], baseFret:1, barre:null },
  'Em_m7':    { frets:[0,2,0,0,0,0], fingers:[0,1,0,0,0,0], baseFret:1, barre:null },
  'Dm_m7':    { frets:[-1,-1,0,2,1,1], fingers:[0,0,0,3,1,1], baseFret:1, barre:{fret:1,strings:[4,5]} },
  'E_sus2':   { frets:[0,2,4,4,0,0], fingers:[0,1,3,4,0,0], baseFret:1, barre:null },
  'A_sus2':   { frets:[-1,0,2,2,0,0], fingers:[0,0,1,2,0,0], baseFret:1, barre:null },
  'D_sus2':   { frets:[-1,-1,0,2,3,0], fingers:[0,0,0,1,2,0], baseFret:1, barre:null },
  'G_sus2':   { frets:[3,2,0,0,3,3], fingers:[2,1,0,0,3,4], baseFret:1, barre:null },
  'E_sus4':   { frets:[0,2,2,2,0,0], fingers:[0,1,2,3,0,0], baseFret:1, barre:null },
  'A_sus4':   { frets:[-1,0,2,2,3,0], fingers:[0,0,1,2,3,0], baseFret:1, barre:null },
  'D_sus4':   { frets:[-1,-1,0,2,3,3], fingers:[0,0,0,1,2,3], baseFret:1, barre:null },
  'G_sus4':   { frets:[3,3,0,0,1,3], fingers:[2,3,0,0,1,4], baseFret:1, barre:null },
  'E_aug':    { frets:[0,3,2,1,1,0], fingers:[0,3,2,1,1,0], baseFret:1, barre:null },
  'A_aug':    { frets:[-1,0,3,2,2,1], fingers:[0,0,3,2,1,4], baseFret:1, barre:null },
  'C_dim':    { frets:[-1,3,4,5,4,-1], fingers:[0,1,2,4,3,0], baseFret:3, barre:null },
  'D_dim':    { frets:[-1,-1,0,1,0,1], fingers:[0,0,0,2,0,3], baseFret:1, barre:null },
  'E_dim':    { frets:[0,1,2,3,2,-1], fingers:[0,1,2,4,3,0], baseFret:1, barre:null },
  'G_dim':    { frets:[3,4,5,3,-1,-1], fingers:[1,2,3,4,0,0], baseFret:3, barre:null },
  'B_dim':    { frets:[-1,2,3,4,3,-1], fingers:[0,1,2,4,3,0], baseFret:2, barre:null },
};

// Alt voicings for common chords (second voicing)
const ALT_OVERRIDES = {
  'C_major':  { frets:[8,10,10,9,8,8], fingers:[1,3,4,2,1,1], baseFret:8, barre:{fret:8,strings:[0,5]} },
  'D_major':  { frets:[5,5,7,7,7,5], fingers:[1,1,3,3,3,1], baseFret:5, barre:{fret:5,strings:[0,5]} },
  'G_major':  { frets:[3,2,0,0,3,3], fingers:[2,1,0,0,3,4], baseFret:1, barre:null },
  'Am_minor': { frets:[5,7,7,5,5,5], fingers:[1,3,4,1,1,1], baseFret:5, barre:{fret:5,strings:[0,5]} },
  'Em_minor': { frets:[0,2,2,0,0,0], fingers:[0,2,3,0,0,0], baseFret:1, barre:null },
};

// Generate all chord voicings
function generateVoicings(rootName, type) {
  const key = `${rootName}_${type}`;
  const voicings = [];

  // 1. Check open override (primary)
  const openKey = key in OPEN_OVERRIDES ? key : null;
  // normalize for minors
  const minorKey = `${rootName}m_${type}` in OPEN_OVERRIDES ? `${rootName}m_${type}` : null;
  const override = OPEN_OVERRIDES[openKey] || OPEN_OVERRIDES[minorKey];
  if (override) {
    voicings.push({ ...override });
  }

  // 2. Generate E-shape voicing
  const rootOnE = rootFretOnString(rootName, 0);
  const rootOnEHigh = rootOnE <= 4 ? rootOnE : (rootOnE <= 12 ? rootOnE : null);
  if (rootOnEHigh !== null && !override) {
    const frets = eShape(rootOnEHigh, type);
    const barre = rootOnEHigh > 0 ? { fret: rootOnEHigh, strings: [0, 5] } : null;
    const baseFret = rootOnEHigh > 0 ? rootOnEHigh : 1;
    voicings.push({ frets, fingers: eFingers(rootOnEHigh, type), baseFret, barre });
  } else if (rootOnEHigh !== null && override) {
    // Add as alt if different from override
    const eFrets = eShape(rootOnEHigh, type);
    const eBaseFret = rootOnEHigh > 0 ? rootOnEHigh : 1;
    if (JSON.stringify(eFrets) !== JSON.stringify(override.frets)) {
      const altKey = `${rootName}_${type}`;
      if (ALT_OVERRIDES[altKey]) {
        voicings.push({ ...ALT_OVERRIDES[altKey] });
      } else {
        voicings.push({ frets: eFrets, fingers: eFingers(rootOnEHigh, type), baseFret: eBaseFret, barre: rootOnEHigh > 0 ? { fret: rootOnEHigh, strings: [0,5] } : null });
      }
    }
  }

  // 3. Generate A-shape voicing as alt
  const rootOnA = rootFretOnString(rootName, 1);
  const aFrets = aShape(rootOnA, type);
  const aBaseFret = rootOnA > 0 ? rootOnA : 1;
  const aBarre = rootOnA > 0 ? { fret: rootOnA, strings: [1, 5] } : null;
  if (voicings.length < 2) {
    voicings.push({ frets: aFrets, fingers: aFingers(rootOnA, type), baseFret: aBaseFret, barre: aBarre });
  } else if (voicings.length < 3) {
    // Add A-shape as 3rd voicing if not duplicate
    if (JSON.stringify(aFrets) !== JSON.stringify(voicings[0].frets) &&
        JSON.stringify(aFrets) !== JSON.stringify(voicings[1].frets)) {
      voicings.push({ frets: aFrets, fingers: aFingers(rootOnA, type), baseFret: aBaseFret, barre: aBarre });
    }
  }

  // 4. Add E-shape higher up the neck as 3rd voicing
  if (voicings.length < 3) {
    const highR = rootOnE + 12 > 12 ? rootOnE : rootOnE + 12;
    if (highR <= 12) {
      const hFrets = eShape(highR, type);
      voicings.push({ frets: hFrets, fingers: eFingers(highR, type), baseFret: highR, barre: { fret: highR, strings: [0,5] } });
    }
  }

  return voicings;
}

// Build the full chord database
const CHORD_DB = {};

function buildChordDB() {
  const types = ['major','minor','7','maj7','m7','sus2','sus4','dim','aug','add9'];
  for (const root of NOTES) {
    CHORD_DB[root] = {};
    for (const type of types) {
      const notes = getChordNotes(root, type);
      const voicings = generateVoicings(root, type);
      CHORD_DB[root][type] = {
        root,
        type,
        notes,
        formula: CHORD_FORMULAS[type] || [],
        voicings,
      };
    }
  }
}

buildChordDB();

// Search/parse chord queries
function parseChordQuery(query) {
  query = query.trim();
  if (!query) return null;

  const typeMap = {
    'major': 'major', 'maj': 'major', 'M': 'major',
    'minor': 'minor', 'min': 'minor', 'm': 'minor',
    'maj7': 'maj7', 'M7': 'maj7', 'Δ7': 'maj7', 'Δ': 'maj7',
    'm7': 'm7', 'min7': 'm7',
    '7': '7', 'dom7': '7', 'dom': '7',
    'sus2': 'sus2', 'sus4': 'sus4',
    'dim': 'dim', '°': 'dim', 'dim7': 'dim7',
    'aug': 'aug', '+': 'aug',
    'add9': 'add9', 'add2': 'add9',
    '6': '6', 'm6': 'm6',
    'm7b5': 'm7b5', 'ø': 'm7b5', 'ø7': 'm7b5',
  };

  // Try to match root + type
  const notePattern = /^([A-G][b#]?)/;
  const match = query.match(notePattern);
  if (!match) return null;

  let rootRaw = match[1];
  let root = normalizeNote(rootRaw);
  if (!NOTES.includes(root)) return null;

  let typeStr = query.slice(rootRaw.length).trim().toLowerCase();
  // try to find type
  let type = 'major';
  if (typeStr === '' || typeStr === 'maj' || typeStr === 'major') {
    type = 'major';
  } else if (typeStr === 'm' || typeStr === 'min' || typeStr === 'minor') {
    type = 'minor';
  } else {
    // Try matching from longest to shortest
    const sortedKeys = Object.keys(typeMap).sort((a,b) => b.length - a.length);
    for (const k of sortedKeys) {
      if (typeStr === k.toLowerCase() || typeStr === k) {
        type = typeMap[k];
        break;
      }
    }
    if (!CHORD_DB['C'][type]) type = 'major';
  }

  return { root, type };
}

// Get chord by name string
function getChord(rootName, type) {
  const root = normalizeNote(rootName);
  if (!CHORD_DB[root]) return null;
  return CHORD_DB[root][type] || null;
}

// Chord name display
function chordDisplayName(root, type) {
  const suffixes = {
    'major':'', 'minor':'m', '7':'7', 'maj7':'maj7', 'm7':'m7',
    'sus2':'sus2', 'sus4':'sus4', 'dim':'°', 'aug':'+',
    'add9':'add9', '6':'6', 'm6':'m6', '9':'9',
    'dim7':'°7', 'm7b5':'ø7',
  };
  return root + (suffixes[type] !== undefined ? suffixes[type] : type);
}
