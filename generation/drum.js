// Drum MIDI note mapping constants
const DRUMS = {
  KICK: 53,
  KICK_ALT: 54,
  SNARE: 55,
  SNARE_ALT: 56,
  RIM: 57,
  CLAP: 58,
  TAMBOURINE: 59,
  SHAKER: 60,
  CLOSED_HAT: 61,
  OPEN_HAT: 62,
  PEDAL_HAT: 63,
  LOW_TOM: 65,
  CRASH: 66,
  MID_TOM: 67,
  RIDE: 68,
  HIGH_TOM: 69,
  CONGA_LOW: 71,
  CONGA_HIGH: 72,
  COWBELL: 73,
  GUIRO: 74,
  METAL: 75,
  CHI: 76,
};

// Genre-specific drum pattern templates
const GENRE_TEMPLATES = {
  edm: {
    core: {
      [DRUMS.KICK]: { steps: [1, 5, 9, 13], probability: 0.9 },
      [DRUMS.SNARE]: { steps: [5, 13], probability: 0.9 },
      [DRUMS.CLOSED_HAT]: {
        steps: [1, 3, 5, 7, 9, 11, 13, 15],
        probability: 0.8,
      },
    },
    auxiliary: {
      [DRUMS.CRASH]: { steps: [1], probability: 0.3 },
      [DRUMS.RIDE]: { steps: [3, 7, 11, 15], probability: 0.1 },
      [DRUMS.CLAP]: { steps: [5, 13], probability: 0.2 },
    },
  },
  synthwave: {
    core: {
      [DRUMS.KICK]: { steps: [1, 9], probability: 0.8 },
      [DRUMS.SNARE]: { steps: [5, 13], probability: 0.8 },
      [DRUMS.CLOSED_HAT]: { steps: [1, 5, 9, 13], probability: 0.7 },
    },
    auxiliary: {
      [DRUMS.RIM]: { steps: [3, 7, 11, 15], probability: 0.6 },
      [DRUMS.CRASH]: { steps: [1], probability: 0.4 },
      [DRUMS.MID_TOM]: { steps: [14, 15, 16], probability: 0.2 },
    },
  },
  hiphop: {
    core: {
      [DRUMS.KICK]: { steps: [1, 7, 9, 15], probability: 0.8 },
      [DRUMS.SNARE]: { steps: [5, 13], probability: 0.9 },
      [DRUMS.CLOSED_HAT]: {
        steps: [1, 3, 5, 7, 9, 11, 13, 15],
        probability: 0.7,
      },
    },
    auxiliary: {
      [DRUMS.CLAP]: { steps: [5, 13], probability: 0.5 },
      [DRUMS.CONGA_HIGH]: { steps: [4, 8, 12, 16], probability: 0.2 },
      [DRUMS.PEDAL_HAT]: {
        steps: [2, 4, 6, 8, 10, 12, 14, 16],
        probability: 0.3,
      },
    },
  },
  ambient: {
    core: {
      [DRUMS.KICK]: { steps: [1, 9], probability: 0.5 },
      [DRUMS.SHAKER]: { steps: [1, 3, 5, 7, 9, 11, 13, 15], probability: 0.6 },
    },
    auxiliary: {
      [DRUMS.GUIRO]: { steps: [3, 7, 11, 15], probability: 0.3 },
      [DRUMS.CRASH]: { steps: [1], probability: 0.2 },
    },
  },
  house: {
    core: {
      [DRUMS.KICK]: { steps: [1, 5, 9, 13], probability: 1.0 },
      [DRUMS.SNARE]: { steps: [5, 13], probability: 0.5 },
      [DRUMS.CLOSED_HAT]: {
        steps: [2, 4, 6, 8, 10, 12, 14, 16],
        probability: 0.8,
      },
    },
    auxiliary: {
      [DRUMS.CLAP]: { steps: [2, 6, 10, 14], probability: 0.4 },
      [DRUMS.RIDE]: { steps: [1, 5, 9, 13], probability: 0.3 },
    },
  },
  experimental: {
    core: {
      [DRUMS.METAL]: { steps: [1, 5, 9, 13], probability: 0.2 },
      [DRUMS.CHI]: {
        steps: Array.from({ length: 16 }, (_, i) => i + 1),
        probability: 0.3,
      },
    },
    auxiliary: {
      [DRUMS.LOW_TOM]: { steps: [2, 6, 10, 14], probability: 0.4 },
      [DRUMS.HIGH_TOM]: { steps: [4, 8, 12, 16], probability: 0.4 },
    },
  },
};

// Current state for drum generation
if (!window.generationState) {
  window.generationState = { tracks: {} };
}
generationState.tracks.drums = [];

// 1) Function to build an initial pattern from the genre template
function buildPatternFromTemplate(genre, density, balance) {
  const template = GENRE_TEMPLATES[genre];
  if (!template) return [];

  let pattern = [];

  // Generate core elements
  Object.entries(template.core).forEach(([note, config]) => {
    const { steps, probability } = config;
    const adjustedProb = probability * (1 - balance * 0.5) * density;
    steps.forEach((step) => {
      if (Math.random() < adjustedProb) {
        pattern.push({
          note: parseInt(note),
          velocity: Math.floor(calculateVelocity(step, 0)), // pass variation=0 here or similar
          start: step,
          end: step + 1,
        });
      }
    });
  });

  // Generate auxiliary elements
  Object.entries(template.auxiliary).forEach(([note, config]) => {
    const { steps, probability } = config;
    const adjustedProb = probability * balance * density;
    steps.forEach((step) => {
      if (Math.random() < adjustedProb) {
        pattern.push({
          note: parseInt(note),
          velocity: Math.floor(calculateVelocity(step, 0)),
          start: step,
          end: step + 1,
        });
      }
    });
  });

  return pattern;
}

// 2) Function to preserve core beats
function preserveCoreBeats(pattern, preserveFactor = 0.7) {
  // Define "core" instruments you want to preserve across *all* genres
  // (you could also branch this by genre if needed)
  const coreInstruments = new Set([
    DRUMS.KICK,
    DRUMS.SNARE,
    DRUMS.CLOSED_HAT,
    // or add RIM, CLAP, etc. if you consider them "core"
  ]);

  return pattern.map((note) => {
    if (coreInstruments.has(note.note)) {
      // If we pass this random check, we skip removing or messing with it
      // so these notes are less likely to be lost or heavily altered
      if (Math.random() < preserveFactor) {
        // Return the note as-is
        return note;
      }
    }
    // For notes not preserved, return as-is (they can still be changed later)
    return note;
  });
}

// 3) Calculate velocity
function calculateVelocity(step, variation) {
  const baseVelocity = step % 4 === 0 ? 100 : 80;
  const randomRange = 30 * variation;
  const velocity = Math.min(
    127,
    Math.max(
      30,
      Math.floor(baseVelocity + (Math.random() * randomRange - randomRange / 2))
    )
  );
  return velocity;
}

// 4) Apply variation (smaller/no offset for Kick/Snare, plus fills at end)
function applyVariation(pattern, variation) {
  let variedPattern = pattern.map((note) => {
    let timingOffset = 0;

    // If NOT Kick or Snare, apply timing offset
    if (![DRUMS.KICK, DRUMS.SNARE].includes(note.note)) {
      timingOffset = Math.random() * variation * 0.5 - 0.25;
      // e.g. ±0.25 steps * variation
    }
    let newStart = note.start + timingOffset;
    newStart = Math.round(newStart);
    newStart = Math.max(1, Math.min(newStart, 32));
    let newEnd = Math.min(newStart + 1, 32);

    // Apply velocity variation
    let newVelocity = note.velocity + (Math.random() * 20 - 10) * variation;
    newVelocity = Math.max(30, Math.min(newVelocity, 127));
    newVelocity = Math.floor(newVelocity);

    return {
      ...note,
      start: newStart,
      end: newEnd,
      velocity: newVelocity,
    };
  });

  // Now add fills primarily near the end
  variedPattern = addFillsAtEnd(variedPattern, variation);
  return variedPattern;
}

// 5) Add fills at the end (e.g., steps 29-32)
function addFillsAtEnd(pattern, variation) {
  // e.g. 30% chance of a fill if variation is 1.0
  if (Math.random() < variation * 0.3) {
    // fillStart anywhere from 29 to 32
    const fillStart = Math.floor(Math.random() * 4) + 29; // 29-32
    const fillNotes = [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM];

    for (let i = 0; i < 4; i++) {
      const currentStep = fillStart + i;
      if (currentStep > 32) break;

      if (Math.random() < 0.6) {
        pattern.push({
          note: fillNotes[Math.floor(Math.random() * fillNotes.length)],
          velocity: 70 + Math.floor(Math.random() * 40), // 70-109
          start: currentStep,
          end: Math.min(currentStep + 1, 32),
        });
      }
    }
  }
  return pattern;
}

// 6) Apply repetition logic (unchanged from your original or lightly modified)
function applyRepetition(pattern, repetition, genre) {
  if (repetition < 0.7) return pattern;

  // For high repetition, we remove sections and regenerate them
  const template = GENRE_TEMPLATES[genre];
  for (let i = 8; i < 32; i += 8) {
    if (Math.random() < repetition) {
      // Remove existing notes in this 8-step section
      pattern = pattern.filter((note) => note.start < i || note.start >= i + 8);

      // Add new variations in this section
      if (template) {
        const sectionPattern = generateSectionPattern(template, i);
        pattern = pattern.concat(sectionPattern);
      }
    }
  }

  return pattern;
}

// 6.1) Generate a small snippet for a repeated section
function generateSectionPattern(template, startStep) {
  const pattern = [];
  const instruments = { ...template.core, ...template.auxiliary };

  Object.entries(instruments).forEach(([note, config]) => {
    const { probability, steps } = config;
    // Shift the config steps by startStep
    const shiftedSteps = steps.map((step) => step + startStep);

    shiftedSteps.forEach((step) => {
      if (step < startStep + 8 && Math.random() < probability) {
        pattern.push({
          note: parseInt(note),
          velocity: calculateVelocity(step, 0.5),
          start: step,
          end: step + 1,
        });
      }
    });
  });

  return pattern;
}

// 7) Extend pattern to 32 steps by duplicating first half
function extendPattern(pattern) {
  const secondHalf = pattern
    .filter((note) => note.start <= 16)
    .map((note) => ({
      ...note,
      start: note.start + 16,
      end: note.end + 16,
      velocity: Math.max(
        30,
        Math.min(127, note.velocity + (Math.random() * 20 - 10))
      ),
    }));

  return [...pattern, ...secondHalf];
}

// 8) The main generation function with preserveCoreBeats integrated
function generateDrumPattern() {
  const genre = document.getElementById("genre-select").value;
  const density = parseInt(document.getElementById("drum-density").value) / 100;
  const variation =
    parseInt(document.getElementById("drum-variation").value) / 100;
  const balance = parseInt(document.getElementById("drum-balance").value) / 100;
  const repetition =
    parseInt(document.getElementById("drum-repetition").value) / 100;

  // (1) Build initial pattern from the template
  let pattern = buildPatternFromTemplate(genre, density, balance);

  // (2) Preserve a subset of core beats
  pattern = preserveCoreBeats(pattern, 0.7);
  // e.g. 70% chance of not messing with core instruments

  // (3) Apply variation (with smaller/no offset for Kick/Snare)
  pattern = applyVariation(pattern, variation);

  // (4) Apply repetition logic
  pattern = applyRepetition(pattern, repetition, genre);

  // (5) Extend pattern to 32 steps
  pattern = extendPattern(pattern);

  // Update global state
  generationState.tracks.drums = pattern;

  // Update visualization
  renderTrackVisualization("drums");

  return pattern;
}

// Initial generation
document.addEventListener("DOMContentLoaded", () => {
  generateDrumPattern();
});
