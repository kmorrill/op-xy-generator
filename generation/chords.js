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
    chordsLength: parseInt(document.getElementById("chords-length").value),
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

  // Calculate the total number of steps based on chordsLength
  const totalSteps = params.chordsLength * 8; // Each chord section is 8 steps

  // Generate notes for each chord in the progression
  for (let i = 0; i < params.chordsLength; i++) {
    const degreeIndex = progression[i % progression.length];
    const rootNote = getScaleNoteAtDegree(
      params.key,
      CHORD_SCALES[params.scale],
      degreeIndex
    );

    const chordType = getChordType(params.complexity);
    const chord = buildChord(rootNote, chordType, params.voicingSpread);

    // Scale the rhythm pattern to the total length
    const sectionLength = totalSteps / params.chordsLength;
    const stepOffset = i * sectionLength;

    rhythmPattern.forEach((hit, stepIndex) => {
      if (hit) {
        // Scale the step index to the section length
        const scaledStepIndex = (stepIndex * sectionLength) / 8;
        const startStep = stepOffset + scaledStepIndex + 1;
        const duration = getDuration(params.rhythmicPlacement);

        // Add main chord tones
        chord.main.forEach((note) => {
          chordNotes.push({
            note,
            velocity: 100,
            start: startStep,
            end: startStep + duration,
            channel: CHORD_CHANNEL,
            type: "main",
          });
        });

        // Add extensions if enabled and they exist
        if (
          params.separateExtensions &&
          chord.extensions &&
          chord.extensions.length > 0
        ) {
          chord.extensions.forEach((note) => {
            chordNotes.push({
              note,
              velocity: 80,
              start: startStep,
              end: startStep + duration,
              channel: document.getElementById("chord-send-channel").value,
              type: "extension",
            });
          });
        }
      }
    });
  }

  // Add drone if enabled
  if (params.drones) {
    console.log("Adding drones");

    const rootNote = getScaleNoteAtDegree(
      params.key,
      CHORD_SCALES[params.scale],
      0
    );
    // Add both root and fifth for a richer drone
    const fifthNote = rootNote + 7;

    chordNotes.push({
      note: rootNote,
      velocity: 64,
      start: 1,
      end: totalSteps + 1,
      channel: document.getElementById("drones-send-channel").value,
      type: "drone",
    });

    chordNotes.push({
      note: fifthNote,
      velocity: 48, // Slightly quieter fifth
      start: 1,
      end: totalSteps + 1,
      channel: DRONE_CHANNEL,
      type: "drone",
    });
  }

  return chordNotes;
}

// Helper functions
function getChordType(complexity) {
  if (complexity < 25) return CHORD_TYPES.triad;
  if (complexity < 60) return CHORD_TYPES.seventh;
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
if (!window.generationState) {
  window.generationState = { tracks: {} };
}
if (!window.generationState.tracks.chords) {
  window.generationState.tracks.chords = [];
}

window.generationState.generateChords = generateChords;
