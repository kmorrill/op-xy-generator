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
generationState.tracks.drums = [];

function generateDrumPattern() {
  const genre = document.getElementById("genre-select").value;
  const density = parseInt(document.getElementById("drum-density").value) / 100;
  const variation =
    parseInt(document.getElementById("drum-variation").value) / 100;
  const balance = parseInt(document.getElementById("drum-balance").value) / 100;
  const repetition =
    parseInt(document.getElementById("drum-repetition").value) / 100;

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
          velocity: calculateVelocity(step, variation),
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
          velocity: calculateVelocity(step, variation),
          start: step,
          end: step + 1,
        });
      }
    });
  });

  // Apply variation effects
  pattern = applyVariation(pattern, variation);

  // Apply repetition
  pattern = applyRepetition(pattern, repetition, genre);

  // Extend pattern to 32 steps
  pattern = extendPattern(pattern);

  // Update global state
  generationState.tracks.drums = pattern;

  // Update visualization
  renderTrackVisualization("drums");

  return pattern;
}

function calculateVelocity(step, variation) {
  const baseVelocity = step % 4 === 0 ? 100 : 80;
  const randomRange = 30 * variation;
  return Math.min(
    127,
    Math.max(30, baseVelocity + (Math.random() * randomRange - randomRange / 2))
  );
}

function applyVariation(pattern, variation) {
  // Apply timing and velocity variations
  const variedPattern = pattern.map((note) => {
    // Apply timing variations
    const timingOffset = Math.random() * variation * 0.5 - 0.25; // ±0.25 steps based on variation
    let newStart = note.start + timingOffset;

    // Round to the nearest integer
    newStart = Math.round(newStart);

    // Clamp newStart to be within 1 to 32
    newStart = Math.max(1, Math.min(newStart, 32));

    // Set newEnd as newStart + 1, clamped to 32
    let newEnd = newStart + 1;
    newEnd = Math.min(newEnd, 32);

    // Apply velocity variation
    let newVelocity = note.velocity + (Math.random() * 20 - 10) * variation;
    newVelocity = Math.max(30, Math.min(newVelocity, 127));

    return {
      ...note,
      start: newStart,
      end: newEnd,
      velocity: newVelocity,
    };
  });

  // Add fills based on variation
  if (Math.random() < variation * 0.3) {
    const fillStart = Math.floor(Math.random() * 24) + 4; // Ensures fills start between step 4 and 27
    const fillNotes = [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM];

    for (let i = 0; i < 4; i++) {
      const currentStep = fillStart + i;
      if (currentStep > 32) break; // Prevent exceeding the maximum step

      if (Math.random() < 0.6) {
        variedPattern.push({
          note: fillNotes[Math.floor(Math.random() * fillNotes.length)],
          velocity: 70 + Math.floor(Math.random() * 40), // Velocity between 70 and 109
          start: currentStep,
          end: currentStep + 1,
        });
      }
    }
  }

  return variedPattern;
}

function applyRepetition(pattern, repetition, genre) {
  if (repetition < 0.7) return pattern;

  // For high repetition, modify sections of the pattern
  const template = GENRE_TEMPLATES[genre];
  for (let i = 8; i < 32; i += 8) {
    if (Math.random() < repetition) {
      // Remove existing notes in this section
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

function generateSectionPattern(template, startStep) {
  const pattern = [];
  const instruments = { ...template.core, ...template.auxiliary };

  Object.entries(instruments).forEach(([note, config]) => {
    const { probability } = config;
    const steps = config.steps.map((step) => step + startStep);

    steps.forEach((step) => {
      if (Math.random() < probability && step < startStep + 8) {
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

function extendPattern(pattern) {
  // Create a second half of the pattern with variations
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

// Initial generation
document.addEventListener("DOMContentLoaded", () => {
  generateDrumPattern();
});
