// Constants for MIDI note numbers
const MIDI_NOTES = {
  C2: 36,
  D2: 38,
  E2: 40,
  F2: 41,
  G2: 43,
  A2: 45,
  B2: 47,
  C3: 48,
  D3: 50,
  E3: 52,
  F3: 53,
  G3: 55,
  A3: 57,
  B3: 59,
};

const BASS_GENRE_TEMPLATES = {
  edm: {
    basePattern: [1, 0, 0, 0, 1, 0, 0, 0], // Basic four-on-the-floor
    noteLength: 6, // Default note length in ticks
    octaveJumpProb: 0.3,
    defaultComplexity: 0.4,
  },
  synthwave: {
    basePattern: [1, 0, 0, 1, 1, 0, 0, 0],
    noteLength: 12,
    octaveJumpProb: 0.2,
    defaultComplexity: 0.3,
  },
  hiphop: {
    basePattern: [1, 0, 0, 1, 0, 1, 0, 0],
    noteLength: 6,
    octaveJumpProb: 0.15,
    defaultComplexity: 0.6,
  },
  ambient: {
    basePattern: [1, 0, 0, 0, 0, 0, 0, 0],
    noteLength: 24,
    octaveJumpProb: 0.1,
    defaultComplexity: 0.2,
  },
  house: {
    basePattern: [1, 0, 1, 0, 1, 0, 1, 0],
    noteLength: 6,
    octaveJumpProb: 0.25,
    defaultComplexity: 0.5,
  },
  experimental: {
    basePattern: [1, 1, 0, 1, 0, 0, 1, 1],
    noteLength: 3,
    octaveJumpProb: 0.4,
    defaultComplexity: 0.8,
  },
};

// Scale patterns for different modes
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
};

function generateBassLine(params) {
  const {
    genre = "edm",
    phraseEvolution = 40,
    rhythmicComplexity = 70,
    grooveTightness = 80,
    bassMovement = 60,
    key = "C",
    scale = "major",
    drumPattern = [],
  } = params;

  const template = BASS_GENRE_TEMPLATES[genre.toLowerCase()];
  const notes = [];
  const patternLength = 32; // Total steps in pattern

  // Convert parameter values to normalized values (0-1)
  const evolution = phraseEvolution / 100;
  const complexity = rhythmicComplexity / 100;
  const tightness = grooveTightness / 100;
  const movement = bassMovement / 100;

  // Get root note based on key
  const rootNote = MIDI_NOTES[`${key}2`];

  // Generate base rhythm pattern
  const rhythmPattern = generateRhythmPattern(
    template,
    complexity,
    drumPattern
  );

  // Generate pitch sequence
  const pitchSequence = generatePitchSequence(
    rootNote,
    SCALES[scale],
    movement,
    evolution,
    patternLength
  );

  // Create note events ensuring monophony
  let lastNoteEnd = 0; // Keep track of the last note's end position
  for (let step = 0; step < patternLength; step++) {
    if (rhythmPattern[step]) {
      const noteLength = calculateNoteLength(template.noteLength, tightness);
      const velocity = calculateVelocity(step, drumPattern, complexity);

      // Ensure monophony by not starting a new note before the last one ends
      const start = Math.max(step, lastNoteEnd);
      const end = Math.min(start + noteLength, patternLength);

      notes.push({
        note: pitchSequence[step],
        velocity,
        start,
        end,
      });

      lastNoteEnd = end; // Update last note's end position
    }
  }

  return notes;
}

function generateRhythmPattern(template, complexity, drumPattern) {
  const pattern = new Array(32).fill(0);
  const kickSteps = drumPattern
    .filter(
      (event) => event.note === DRUMS.KICK || event.note === DRUMS.KICK_ALT
    )
    .map((event) => event.start);

  // Start with template pattern
  for (let i = 0; i < 32; i += 8) {
    template.basePattern.forEach((val, j) => {
      if (val) pattern[i + j] = 1;
    });
  }

  // Add complexity based on kicks
  kickSteps.forEach((step) => {
    if (Math.random() < complexity) {
      pattern[step] = 1;
    }
  });

  // Add additional notes based on complexity
  for (let i = 0; i < 32; i++) {
    if (!pattern[i] && Math.random() < complexity * 0.3) {
      pattern[i] = 1;
    }
  }

  return pattern;
}

function generatePitchSequence(rootNote, scale, movement, evolution, length) {
  const sequence = new Array(length);
  const scaleNotes = scale.map((interval) => rootNote + interval);

  // Start with root note
  sequence[0] = rootNote;

  for (let i = 1; i < length; i++) {
    const previousNote = sequence[i - 1];

    // Determine if we should evolve the pattern
    const shouldEvolve = Math.random() < evolution;

    if (shouldEvolve) {
      // Generate new note based on movement parameter
      const maxInterval = Math.floor(movement * 7); // Max scale degrees to move
      const direction = Math.random() > 0.5 ? 1 : -1;
      const interval = Math.floor(Math.random() * maxInterval) * direction;

      const currentIndex = scaleNotes.indexOf((previousNote % 12) + rootNote);
      let newIndex = currentIndex + interval;

      // Keep within scale bounds
      newIndex =
        ((newIndex % scaleNotes.length) + scaleNotes.length) %
        scaleNotes.length;

      sequence[i] = scaleNotes[newIndex];
    } else {
      // Repeat previous note
      sequence[i] = previousNote;
    }
  }

  return sequence;
}

function calculateNoteLength(baseLength, tightness) {
  // Adjust note length based on tightness
  const variation = (1 - tightness) * 2; // More variation for lower tightness
  const randomFactor = 1 + (Math.random() * 2 - 1) * variation;
  return Math.max(1, Math.round(baseLength * randomFactor));
}

function calculateVelocity(step, drumPattern, complexity) {
  // Base velocity
  let velocity = 100;

  // Reduce velocity for off-beat notes
  if (step % 8 !== 0) {
    velocity -= 20;
  }

  // Add slight random variation based on complexity
  const variation = Math.floor(complexity * 20);
  velocity += Math.floor(Math.random() * variation) - variation / 2;

  // Ensure velocity stays within MIDI bounds
  return Math.max(1, Math.min(127, velocity));
}

// Function to handle parameter changes and regenerate bass line
function regenerateBassLine() {
  const params = {
    genre: document.getElementById("genre-select").value,
    phraseEvolution: parseInt(document.getElementById("bass-phrase").value),
    rhythmicComplexity: parseInt(document.getElementById("bass-rhythm").value),
    grooveTightness: parseInt(document.getElementById("bass-groove").value),
    bassMovement: parseInt(document.getElementById("bass-movement").value),
    key: document.getElementById("key-select").value,
    scale: document.getElementById("scale-select").value,
    drumPattern: generationState.tracks.drums || [],
  };

  const bassLine = generateBassLine(params);

  // Update visualization if needed
  if (typeof renderTrackVisualization === "function") {
    renderTrackVisualization("bass");
  }

  return bassLine;
}

window.regenerateBassLine = regenerateBassLine;
