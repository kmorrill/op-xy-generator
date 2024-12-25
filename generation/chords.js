// Constants for MIDI channels
const CHORD_CHANNEL = 7;
const EXTENSIONS_CHANNEL = 6;
const DRONE_CHANNEL = 8;

// Musical constants
const CHORD_SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

const CHORD_TYPES = {
  triad: [0, 4, 7],
  seventh: [0, 4, 7, 10],
  ninth: [0, 4, 7, 10, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const CHORD_GENRE_TEMPLATES = {
  edm: {
    progressions: [
      [0, 5, 3, 4], // I-VI-IV-V
      [0, 4, 5, 3], // I-V-VI-IV
      [0, 2, 4, 5], // I-III-V-IV
      [0, 3, 4, 5], // I-IV-V
      [0, 5, 4, 3], // I-VI-V-IV
    ],
    rhythmPatterns: [
      [1, 0, 0, 0, 1, 0, 0, 0], // Basic 4/4
      [1, 0, 1, 0, 1, 0, 1, 0], // Rhythmic stabs
      [1, 1, 0, 1, 0, 1, 0, 1], // Dense
      [1, 0, 1, 1, 0, 1, 0, 1], // Syncopated
    ],
  },
  synthwave: {
    progressions: [
      [0, 5, 2, 3], // I-VI-III-IV
      [0, 4, 2, 5], // I-V-III-VI
      [0, 3, 2, 4], // I-IV-III-V
      [0, 2, 3, 5], // I-III-IV-VI
    ],
    rhythmPatterns: [
      [1, 0, 0, 1, 0, 0, 1, 0], // Syncopated
      [1, 1, 0, 1, 1, 0, 1, 0], // Dense
      [1, 0, 1, 0, 1, 1, 0, 1], // Complex
    ],
  },
  hiphop: {
    progressions: [
      [0, 3, 4, 3], // I-IV-V-IV
      [0, 5, 3, 4], // I-VI-IV-V
      [0, 4, 3, 5], // I-V-IV-VI
      [0, 2, 3, 4], // I-III-IV-V
    ],
    rhythmPatterns: [
      [1, 0, 1, 0, 0, 1, 0, 0], // Swung feel
      [1, 0, 0, 1, 0, 0, 1, 1], // Syncopated
      [1, 1, 0, 1, 0, 1, 0, 1], // Dense
    ],
  },
};

function generateChords() {
  const params = {
    genre: document.getElementById("genre-select").value,
    complexity: parseInt(document.getElementById("chord-complexity").value),
    variation: parseInt(document.getElementById("chord-variation").value),
    voicingSpread: parseInt(document.getElementById("chord-voicing").value),
    rhythmicPlacement: parseInt(document.getElementById("chord-rhythm").value),
    drones: document.getElementById("chord-drones").checked,
    separateExtensions: document.getElementById("chord-extensions").checked,
    key: document.getElementById("key-select").value,
    scale: document.getElementById("scale-select").value,
  };

  const chordNotes = [];
  const template =
    CHORD_GENRE_TEMPLATES[params.genre] || CHORD_GENRE_TEMPLATES.edm;

  // Randomly select progression and rhythm pattern
  const progression =
    template.progressions[
      Math.floor(Math.random() * template.progressions.length)
    ];
  const rhythmPattern =
    template.rhythmPatterns[
      Math.floor(Math.random() * template.rhythmPatterns.length)
    ];

  // Generate notes for each chord in the progression
  progression.forEach((degreeIndex, index) => {
    const rootNote = getScaleNoteAtDegree(
      params.key,
      CHORD_SCALES[params.scale],
      degreeIndex
    );

    // Choose chord type based on complexity
    const chordType = getChordType(params.complexity);
    const chord = buildChord(rootNote, chordType, params.voicingSpread);

    // Apply rhythm pattern
    const stepOffset = index * 8; // 8 steps per chord
    rhythmPattern.forEach((hit, stepIndex) => {
      if (hit) {
        const startStep = stepOffset + stepIndex + 1;
        const duration = getDuration(params.rhythmicPlacement);

        // Add main chord tones
        chord.main.forEach((note) => {
          chordNotes.push({
            note,
            velocity: 100,
            start: startStep,
            end: startStep + duration,
            channel: CHORD_CHANNEL,
          });
        });

        // Add extensions if enabled
        if (params.separateExtensions && chord.extensions) {
          chord.extensions.forEach((note) => {
            chordNotes.push({
              note,
              velocity: 80,
              start: startStep,
              end: startStep + duration,
              channel: EXTENSIONS_CHANNEL,
            });
          });
        }
      }
    });
  });

  // Add drone if enabled
  if (params.drones) {
    const rootNote = getNoteNumber(params.key);
    chordNotes.push({
      note: rootNote,
      velocity: 64,
      start: 1,
      end: 33, // Full pattern length
      channel: DRONE_CHANNEL,
    });
  }

  return chordNotes; // Return the generated chord notes
}

// Helper functions
function getChordType(complexity) {
  if (complexity < 30) return CHORD_TYPES.triad;
  if (complexity < 70) return CHORD_TYPES.seventh;
  return CHORD_TYPES.ninth;
}

function buildChord(rootNote, chordType, spread) {
  const result = {
    main: [],
    extensions: [],
  };

  chordType.forEach((interval, index) => {
    const note = rootNote + interval;
    // Add octave shifts based on spread
    const octaveShift = Math.floor(spread / 33) * Math.floor(index / 2) * 12;

    if (index < 3) {
      result.main.push(note + octaveShift);
    } else {
      result.extensions.push(note + octaveShift);
    }
  });

  return result;
}

function getDuration(rhythmicPlacement) {
  if (rhythmicPlacement < 30) return 6; // Quarter note
  if (rhythmicPlacement < 70) return 4; // Eighth note
  return 2; // Sixteenth note
}

function getScaleNoteAtDegree(key, scale, degree) {
  const rootNote = getNoteNumber(key);
  const scalePosition = degree % scale.length;
  const octaves = Math.floor(degree / scale.length);
  return rootNote + scale[scalePosition] + octaves * 12;
}

function getNoteNumber(noteName) {
  const noteMap = {
    C: 60,
    "C#": 61,
    Db: 61,
    D: 62,
    "D#": 63,
    Eb: 63,
    E: 64,
    F: 65,
    "F#": 66,
    Gb: 66,
    G: 67,
    "G#": 68,
    Ab: 68,
    A: 69,
    "A#": 70,
    Bb: 70,
    B: 71,
  };
  return noteMap[noteName] || 60;
}

// Add chord generation to the global generation state
if (typeof generationState === "undefined") {
  generationState = {};
}

generationState.generateChords = generateChords;
