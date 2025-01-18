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

// Function to generate steps for a given length and base pattern
function generateSteps(basePattern, trackLength) {
  const result = [];
  for (let i = 0; i < trackLength; i += 16) {
    result.push(...basePattern.map((step) => step + i));
  }
  return result;
}

// Genre-specific drum pattern templates with dynamic step generation
const GENRE_TEMPLATES = {
  edm: {
    core: {
      [DRUMS.KICK]: {
        baseSteps: [1, 5, 9, 13],
        probability: 0.9,
        getSteps: (trackLength) => generateSteps([1, 5, 9, 13], trackLength),
      },
      [DRUMS.SNARE]: {
        baseSteps: [5, 13],
        probability: 0.9,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
      [DRUMS.CLOSED_HAT]: {
        baseSteps: [1, 3, 5, 7, 9, 11, 13, 15],
        probability: 0.8,
        getSteps: (trackLength) =>
          generateSteps([1, 3, 5, 7, 9, 11, 13, 15], trackLength),
      },
    },
    auxiliary: {
      [DRUMS.CRASH]: {
        baseSteps: [1],
        probability: 0.3,
        getSteps: (trackLength) => generateSteps([1], trackLength),
      },
      [DRUMS.RIDE]: {
        baseSteps: [3, 7, 11, 15],
        probability: 0.1,
        getSteps: (trackLength) => generateSteps([3, 7, 11, 15], trackLength),
      },
      [DRUMS.CLAP]: {
        baseSteps: [5, 13],
        probability: 0.2,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
    },
  },
  synthwave: {
    core: {
      [DRUMS.KICK]: {
        baseSteps: [1, 9],
        probability: 0.8,
        getSteps: (trackLength) => generateSteps([1, 9], trackLength),
      },
      [DRUMS.SNARE]: {
        baseSteps: [5, 13],
        probability: 0.8,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
      [DRUMS.CLOSED_HAT]: {
        baseSteps: [1, 5, 9, 13],
        probability: 0.7,
        getSteps: (trackLength) => generateSteps([1, 5, 9, 13], trackLength),
      },
    },
    auxiliary: {
      [DRUMS.RIM]: {
        baseSteps: [3, 7, 11, 15],
        probability: 0.6,
        getSteps: (trackLength) => generateSteps([3, 7, 11, 15], trackLength),
      },
      [DRUMS.CRASH]: {
        baseSteps: [1],
        probability: 0.4,
        getSteps: (trackLength) => generateSteps([1], trackLength),
      },
      [DRUMS.MID_TOM]: {
        baseSteps: [14, 15, 16],
        probability: 0.2,
        getSteps: (trackLength) => generateSteps([14, 15, 16], trackLength),
      },
    },
  },
  hiphop: {
    core: {
      [DRUMS.KICK]: {
        baseSteps: [1, 7, 9, 15],
        probability: 0.8,
        getSteps: (trackLength) => generateSteps([1, 7, 9, 15], trackLength),
      },
      [DRUMS.SNARE]: {
        baseSteps: [5, 13],
        probability: 0.9,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
      [DRUMS.CLOSED_HAT]: {
        baseSteps: [1, 3, 5, 7, 9, 11, 13, 15],
        probability: 0.7,
        getSteps: (trackLength) =>
          generateSteps([1, 3, 5, 7, 9, 11, 13, 15], trackLength),
      },
    },
    auxiliary: {
      [DRUMS.CLAP]: {
        baseSteps: [5, 13],
        probability: 0.5,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
      [DRUMS.CONGA_HIGH]: {
        baseSteps: [4, 8, 12, 16],
        probability: 0.2,
        getSteps: (trackLength) => generateSteps([4, 8, 12, 16], trackLength),
      },
      [DRUMS.PEDAL_HAT]: {
        baseSteps: [2, 4, 6, 8, 10, 12, 14, 16],
        probability: 0.3,
        getSteps: (trackLength) =>
          generateSteps([2, 4, 6, 8, 10, 12, 14, 16], trackLength),
      },
    },
  },
  ambient: {
    core: {
      [DRUMS.KICK]: {
        baseSteps: [1, 9],
        probability: 0.5,
        getSteps: (trackLength) => generateSteps([1, 9], trackLength),
      },
      [DRUMS.SHAKER]: {
        baseSteps: [1, 3, 5, 7, 9, 11, 13, 15],
        probability: 0.6,
        getSteps: (trackLength) =>
          generateSteps([1, 3, 5, 7, 9, 11, 13, 15], trackLength),
      },
    },
    auxiliary: {
      [DRUMS.GUIRO]: {
        baseSteps: [3, 7, 11, 15],
        probability: 0.3,
        getSteps: (trackLength) => generateSteps([3, 7, 11, 15], trackLength),
      },
      [DRUMS.CRASH]: {
        baseSteps: [1],
        probability: 0.2,
        getSteps: (trackLength) => generateSteps([1], trackLength),
      },
    },
  },
  house: {
    core: {
      [DRUMS.KICK]: {
        baseSteps: [1, 5, 9, 13],
        probability: 1.0,
        getSteps: (trackLength) => generateSteps([1, 5, 9, 13], trackLength),
      },
      [DRUMS.SNARE]: {
        baseSteps: [5, 13],
        probability: 0.5,
        getSteps: (trackLength) => generateSteps([5, 13], trackLength),
      },
      [DRUMS.CLOSED_HAT]: {
        baseSteps: [2, 4, 6, 8, 10, 12, 14, 16],
        probability: 0.8,
        getSteps: (trackLength) =>
          generateSteps([2, 4, 6, 8, 10, 12, 14, 16], trackLength),
      },
    },
    auxiliary: {
      [DRUMS.CLAP]: {
        baseSteps: [2, 6, 10, 14],
        probability: 0.4,
        getSteps: (trackLength) => generateSteps([2, 6, 10, 14], trackLength),
      },
      [DRUMS.RIDE]: {
        baseSteps: [1, 5, 9, 13],
        probability: 0.3,
        getSteps: (trackLength) => generateSteps([1, 5, 9, 13], trackLength),
      },
    },
  },
  experimental: {
    core: {
      [DRUMS.METAL]: {
        baseSteps: [1, 5, 9, 13],
        probability: 0.2,
        getSteps: (trackLength) => generateSteps([1, 5, 9, 13], trackLength),
      },
      [DRUMS.CHI]: {
        baseSteps: Array.from({ length: 16 }, (_, i) => i + 1),
        probability: 0.3,
        getSteps: (trackLength) =>
          Array.from({ length: trackLength }, (_, i) => i + 1),
      },
    },
    auxiliary: {
      [DRUMS.LOW_TOM]: {
        baseSteps: [2, 6, 10, 14],
        probability: 0.4,
        getSteps: (trackLength) => generateSteps([2, 6, 10, 14], trackLength),
      },
      [DRUMS.HIGH_TOM]: {
        baseSteps: [4, 8, 12, 16],
        probability: 0.4,
        getSteps: (trackLength) => generateSteps([4, 8, 12, 16], trackLength),
      },
    },
  },
};

// Current state for drum generation
if (!window.generationState) {
  window.generationState = { tracks: {} };
}
if (!window.generationState.tracks.drums) {
  window.generationState.tracks.drums = [];
}

// 1) Function to build an initial pattern from the genre template
function buildPatternFromTemplate(genre, density, balance, trackLength) {
  const template = GENRE_TEMPLATES[genre];
  if (!template) return [];

  let pattern = [];

  // Generate core elements
  Object.entries(template.core).forEach(([note, config]) => {
    const { probability } = config;
    const steps = config.getSteps(trackLength);
    const adjustedProb = probability * (1 - balance * 0.5) * density;
    steps.forEach((step) => {
      if (Math.random() < adjustedProb && step <= trackLength) {
        pattern.push({
          note: parseInt(note),
          velocity: Math.floor(calculateVelocity(step, 0)),
          start: step,
          end: step + 1,
        });
      }
    });
  });

  // Generate auxiliary elements
  Object.entries(template.auxiliary).forEach(([note, config]) => {
    const { probability } = config;
    const steps = config.getSteps(trackLength);
    const adjustedProb = probability * balance * density;
    steps.forEach((step) => {
      if (Math.random() < adjustedProb && step <= trackLength) {
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
  const coreInstruments = new Set([DRUMS.KICK, DRUMS.SNARE, DRUMS.CLOSED_HAT]);

  return pattern.map((note) => {
    if (coreInstruments.has(note.note)) {
      if (Math.random() < preserveFactor) {
        return note;
      }
    }
    return note;
  });
}

// 3) Calculate velocity
function calculateVelocity(step, variation) {
  const baseVelocity = step % 4 === 0 ? 100 : 80;
  const randomRange = 30 * variation;
  let velocity = Math.min(
    127,
    Math.max(
      30,
      Math.floor(baseVelocity + (Math.random() * randomRange - randomRange / 2))
    )
  );
  velocity = Math.max(1, Math.min(100, velocity));
  return velocity;
}

// 4) Apply variation (smaller/no offset for Kick/Snare, plus fills at end)
function applyVariation(pattern, variation, trackLength) {
  let variedPattern = pattern.map((note) => {
    let timingOffset = 0;

    if (![DRUMS.KICK, DRUMS.SNARE].includes(note.note)) {
      timingOffset = Math.random() * variation * 0.5 - 0.25;
    }
    let newStart = note.start + timingOffset;
    newStart = Math.round(newStart);
    newStart = Math.max(1, Math.min(newStart, trackLength));
    let newEnd = Math.min(newStart + 1, trackLength);

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

  variedPattern = addFillsAtEnd(variedPattern, variation, trackLength);
  return variedPattern;
}

// 5) Add fills at the end
function addFillsAtEnd(pattern, variation, trackLength) {
  const sectionLength = 16;
  const numSections = Math.floor(trackLength / sectionLength);

  for (let section = 0; section < numSections; section++) {
    if (Math.random() < variation * 0.3) {
      const sectionStart = (section + 1) * sectionLength - 4;
      const fillNotes = [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM];

      for (let i = 0; i < 4; i++) {
        const currentStep = sectionStart + i;
        if (currentStep > trackLength) break;

        if (Math.random() < 0.6) {
          pattern.push({
            note: fillNotes[Math.floor(Math.random() * fillNotes.length)],
            velocity: 70 + Math.floor(Math.random() * 40),
            start: currentStep,
            end: Math.min(currentStep + 1, trackLength),
          });
        }
      }
    }
  }
  return pattern;
}

// 6) Apply repetition logic
function applyRepetition(pattern, repetition, genre, trackLength) {
  if (repetition < 0.7) return pattern;

  const template = GENRE_TEMPLATES[genre];
  const sectionLength = 16;
  const numSections = Math.floor(trackLength / sectionLength);

  for (let section = 0; section < numSections; section++) {
    const sectionStart = section * sectionLength;
    if (Math.random() < repetition) {
      // Remove existing notes in this section
      pattern = pattern.filter(
        (note) =>
          note.start < sectionStart ||
          note.start >= sectionStart + sectionLength
      );

      // Add new variations in this section
      if (template) {
        const sectionPattern = generateSectionPattern(
          template,
          sectionStart,
          sectionLength
        );
        pattern = pattern.concat(sectionPattern);
      }
    }
  }

  return pattern;
}

// 6.1) Generate a small snippet for a repeated section
function generateSectionPattern(template, startStep, sectionLength) {
  const pattern = [];
  const instruments = { ...template.core, ...template.auxiliary };

  Object.entries(instruments).forEach(([note, config]) => {
    const { probability, baseSteps } = config;
    // Shift the base steps by startStep
    const shiftedSteps = baseSteps.map((step) => step + startStep);

    shiftedSteps.forEach((step) => {
      if (step < startStep + sectionLength && Math.random() < probability) {
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

// 7) Extend pattern to full length
function extendPattern(pattern, trackLength) {
  if (trackLength <= 16) return pattern;

  const baseLength = 16;
  const numRepetitions = Math.floor(trackLength / baseLength) - 1;
  let extendedPattern = [...pattern];

  for (let i = 0; i < numRepetitions; i++) {
    const newNotes = pattern
      .filter((note) => note.start <= baseLength)
      .map((note) => ({
        ...note,
        start: note.start + (i + 1) * baseLength,
        end: note.end + (i + 1) * baseLength,
        velocity: Math.max(
          30,
          Math.min(127, note.velocity + (Math.random() * 20 - 10))
        ),
      }));
    extendedPattern = [...extendedPattern, ...newNotes];
  }

  return extendedPattern;
}

// 8) The main generation function
function generateDrumPattern() {
  const genre = document.getElementById("genre-select").value;
  const density = parseInt(document.getElementById("drum-density").value) / 100;
  const variation =
    parseInt(document.getElementById("drum-variation").value) / 100;
  const balance = parseInt(document.getElementById("drum-balance").value) / 100;
  const repetition =
    parseInt(document.getElementById("drum-repetition").value) / 100;
  const trackLength = parseInt(document.getElementById("drum-length").value);

  // (1) Build initial pattern from the template
  let pattern = buildPatternFromTemplate(genre, density, balance, trackLength);

  // (2) Preserve a subset of core beats
  pattern = preserveCoreBeats(pattern, 0.7);

  // (3) Apply variation
  pattern = applyVariation(pattern, variation, trackLength);

  // (4) Apply repetition logic
  pattern = applyRepetition(pattern, repetition, genre, trackLength);

  // (5) Extend pattern if needed
  if (trackLength > 16) {
    pattern = extendPattern(pattern, trackLength);
  }

  // Update global state
  const adjustedPattern = pattern.map((note) => {
    let velocity = parseInt(note.velocity, 10);
    velocity = isNaN(velocity) ? 100 : velocity;
    velocity = Math.max(1, Math.min(100, velocity));
    return {
      ...note,
      velocity: velocity,
    };
  });

  // Update visualization
  renderTrackVisualization("drums");

  return adjustedPattern;
}

// Initial generation
document.addEventListener("DOMContentLoaded", () => {
  generateDrumPattern();
});
