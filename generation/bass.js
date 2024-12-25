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

// Define rhythmic motifs for different genres
const RHYTHMIC_MOTIFS = {
  edm: [
    // Four-on-the-floor
    [1, 0, 0, 0, 1, 0, 0, 0],
    // Syncopated EDM motif
    [1, 0, 1, 0, 0, 1, 0, 0],
    // Rolling EDM motif
    [1, 0, 0, 1, 0, 0, 1, 0],
  ],
  hiphop: [
    // Standard hip-hop groove
    [1, 0, 0, 1, 0, 1, 0, 0],
    // Syncopated hip-hop motif
    [1, 0, 1, 0, 1, 0, 0, 1],
    // Triplet-based hip-hop motif
    [1, 0, 1, 1, 0, 1, 0, 1],
  ],
  synthwave: [
    // Classic synthwave motif
    [1, 0, 0, 1, 1, 0, 0, 0],
    // Melodic synthwave motif
    [1, 1, 0, 0, 1, 0, 1, 0],
    // Driving synthwave motif
    [1, 0, 1, 0, 1, 0, 1, 0],
  ],
  ambient: [
    // Sparse ambient motif
    [1, 0, 0, 0, 0, 0, 0, 0],
    // Minimalist ambient motif
    [0, 0, 1, 0, 0, 0, 1, 0],
    // Flowing ambient motif
    [1, 0, 0, 1, 0, 0, 0, 1],
  ],
  house: [
    // Classic house motif
    [1, 0, 1, 0, 1, 0, 1, 0],
    // Bouncy house motif
    [1, 0, 1, 1, 0, 1, 0, 1],
    // Groovy house motif
    [1, 1, 0, 1, 0, 1, 1, 0],
  ],
  experimental: [
    // Complex experimental motif
    [1, 1, 0, 1, 0, 0, 1, 1],
    // Asymmetric experimental motif
    [1, 0, 1, 1, 0, 1, 0, 1],
    // Polyrhythmic experimental motif
    [1, 0, 0, 1, 1, 0, 1, 0],
  ],
};

const BASS_GENRE_TEMPLATES = {
  edm: {
    motifs: RHYTHMIC_MOTIFS.edm,
    noteLength: 6, // Default note length in ticks
    octaveJumpProb: 0.3,
    defaultComplexity: 0.4,
  },
  synthwave: {
    motifs: RHYTHMIC_MOTIFS.synthwave,
    noteLength: 12,
    octaveJumpProb: 0.2,
    defaultComplexity: 0.3,
  },
  hiphop: {
    motifs: RHYTHMIC_MOTIFS.hiphop,
    noteLength: 6,
    octaveJumpProb: 0.15,
    defaultComplexity: 0.6,
  },
  ambient: {
    motifs: RHYTHMIC_MOTIFS.ambient,
    noteLength: 24,
    octaveJumpProb: 0.1,
    defaultComplexity: 0.2,
  },
  house: {
    motifs: RHYTHMIC_MOTIFS.house,
    noteLength: 6,
    octaveJumpProb: 0.25,
    defaultComplexity: 0.5,
  },
  experimental: {
    motifs: RHYTHMIC_MOTIFS.experimental,
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

function generateBassLine() {
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

  const genre = params.genre.toLowerCase();
  const template = BASS_GENRE_TEMPLATES[genre];
  const notes = [];
  const patternLength = 32; // Total steps in pattern

  // Convert parameter values to normalized values (0-1)
  const evolution = params.phraseEvolution / 100;
  const complexity = params.rhythmicComplexity / 100;
  const tightness = params.grooveTightness / 100;
  const movement = params.bassMovement / 100;

  // Get root note based on key
  const rootNote = MIDI_NOTES[`${params.key}2`];

  // Calculate rest probability dynamically
  const restProbability =
    1 - (params.rhythmicComplexity * 0.7 + params.grooveTightness * 0.3);
  // Adjust weights as needed

  // Calculate shift for motif variation based on phrase evolution
  const shiftSteps = Math.floor(evolution * template.motifs[0].length);

  // Generate base rhythm pattern using motifs
  const rhythmPattern = generateRhythmPattern(
    template,
    complexity,
    params.drumPattern,
    restProbability,
    shiftSteps
  );

  // Generate pitch sequence
  const pitchSequence = generatePitchSequence(
    rootNote,
    SCALES[params.scale],
    movement,
    evolution,
    patternLength
  );

  // Create note events ensuring monophony
  let lastNoteEnd = 0; // Keep track of the last note's end position
  for (let step = 0; step < patternLength; step++) {
    if (rhythmPattern[step]) {
      const noteLength = calculateNoteLength(template.noteLength, tightness);
      const velocity = calculateVelocity(step, params.drumPattern, complexity);

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

function generateRhythmPattern(
  template,
  complexity,
  drumPattern,
  restProbability = 0.1,
  shift = 0
) {
  const patternLength = 32; // Total steps in pattern
  const pattern = new Array(patternLength).fill(0);
  const kickSteps = drumPattern
    .filter(
      (event) => event.note === DRUMS.KICK || event.note === DRUMS.KICK_ALT
    )
    .map((event) => event.start);

  // Select a random motif from the genre-specific motifs
  const motifs = template.motifs;
  const selectedMotif = motifs[Math.floor(Math.random() * motifs.length)];

  // Apply shifting to motif if needed
  const shiftedMotif = shiftPattern(selectedMotif, shift);

  // Determine how many times the motif fits into the pattern
  const motifLength = shiftedMotif.length;
  const repetitions = Math.floor(patternLength / motifLength);

  // Insert motifs into the pattern with added variability
  for (let i = 0; i < repetitions; i++) {
    const startIdx = i * motifLength;
    shiftedMotif.forEach((val, j) => {
      if (val) {
        // Introduce probability to skip or add additional notes
        if (Math.random() > 0.2) {
          // 80% chance to place the note
          pattern[startIdx + j] = 1;
        }
      }
    });
  }

  // Handle any remaining steps if patternLength is not a multiple of motifLength
  const remainingSteps = patternLength % motifLength;
  if (remainingSteps > 0) {
    const startIdx = repetitions * motifLength;
    for (let j = 0; j < remainingSteps; j++) {
      if (shiftedMotif[j] && Math.random() > 0.2) {
        pattern[startIdx + j] = 1;
      }
    }
  }

  // Add complexity based on drum kicks
  kickSteps.forEach((step) => {
    if (Math.random() < complexity) {
      pattern[step] = 1;
    }
  });

  // Add additional notes based on complexity
  for (let i = 0; i < patternLength; i++) {
    if (!pattern[i] && Math.random() < complexity * 0.3) {
      pattern[i] = 1;
    }
  }

  // Introduce rests based on restProbability with constraints
  for (let i = 0; i < patternLength; i++) {
    if (pattern[i] === 1 && Math.random() < restProbability) {
      // Constraint: Ensure not too many consecutive rests
      if (!(pattern[i - 1] === 0 && pattern[i - 2] === 0)) {
        pattern[i] = 0;
      }
    }
  }

  return pattern;
}

function shiftPattern(motif, shiftSteps) {
  const shifted = [];
  const motifLength = motif.length;
  for (let i = 0; i < motifLength; i++) {
    shifted.push(motif[(i + shiftSteps) % motifLength]);
  }
  return shifted;
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

  // Add accents based on complexity
  if (Math.random() < complexity * 0.2) {
    // 20% of the time, adjusted by complexity
    velocity += 30; // Accent velocity
  }

  // Add slight random variation based on complexity
  const variation = Math.floor(complexity * 20);
  velocity += Math.floor(Math.random() * variation) - variation / 2;

  // Ensure velocity stays within MIDI bounds
  return Math.max(1, Math.min(127, velocity));
}
