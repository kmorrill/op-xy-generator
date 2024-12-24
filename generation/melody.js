// Constants for melody generation
const MELODY_CHANNEL = 4;
const MIN_VELOCITY = 60;
const MAX_VELOCITY = 127;

// Scale definitions for different genres
const GENRE_SCALES = {
  edm: [0, 2, 4, 5, 7, 9, 11], // Major scale
  synthwave: [0, 2, 4, 5, 7, 9, 10], // Mixolydian
  hiphop: [0, 3, 5, 7, 10], // Minor pentatonic
  ambient: [0, 2, 4, 7, 9], // Major pentatonic
  house: [0, 2, 4, 5, 7, 9, 11], // Major scale
  experimental: [0, 1, 4, 6, 7, 9, 10], // Custom experimental scale
};

// Register ranges for different settings
const REGISTER_RANGES = {
  low: { min: 48, max: 60 }, // C2 to C3
  medium: { min: 60, max: 72 }, // C3 to C4
  high: { min: 72, max: 84 }, // C4 to C5
};

function generateMelody(params) {
  const {
    genre = "edm",
    key = "C",
    scale = "major",
    melodicContour = 50,
    rhythmicComplexity = 50,
    register = 50,
    harmonyAlignment = 50,
    currentChords = [],
  } = params;

  const notes = [];
  const steps = 32; // Total number of steps

  // Calculate base parameters
  const baseNote = getBaseNoteFromKey(key);
  const scalePattern = GENRE_SCALES[genre] || GENRE_SCALES.edm;
  const registerRange = calculateRegisterRange(register);
  const noteDensity = calculateNoteDensity(rhythmicComplexity);

  // Generate the melody sequence
  let currentStep = 0;
  while (currentStep < steps) {
    if (shouldGenerateNote(currentStep, noteDensity)) {
      const note = generateMelodyNote({
        baseNote,
        scalePattern,
        registerRange,
        melodicContour,
        harmonyAlignment,
        currentStep,
        currentChords,
      });

      // Add the note if valid
      if (note) {
        notes.push(note);
      }
    }
    currentStep++;
  }

  return notes;
}

function getBaseNoteFromKey(key) {
  const keyMap = {
    C: 60,
    D: 62,
    E: 64,
    F: 65,
    G: 67,
    A: 69,
    B: 71,
  };
  return keyMap[key] || 60;
}

function calculateRegisterRange(register) {
  if (register <= 30) {
    return REGISTER_RANGES.low;
  } else if (register <= 70) {
    return REGISTER_RANGES.medium;
  }
  return REGISTER_RANGES.high;
}

function calculateNoteDensity(rhythmicComplexity) {
  // Convert complexity (0-100) to probability (0.1-0.8)
  return 0.1 + (rhythmicComplexity / 100) * 0.7;
}

function shouldGenerateNote(step, density) {
  // Higher density means more likely to generate a note
  return Math.random() < density;
}

function generateMelodyNote({
  baseNote,
  scalePattern,
  registerRange,
  melodicContour,
  harmonyAlignment,
  currentStep,
  currentChords,
}) {
  // Calculate note duration based on step position
  const duration = calculateNoteDuration(currentStep);

  // Check if the note would extend beyond sequence
  if (currentStep + duration > 32) {
    return null;
  }

  // Generate pitch based on contour and harmony
  const pitch = calculateNotePitch({
    baseNote,
    scalePattern,
    registerRange,
    melodicContour,
    harmonyAlignment,
    currentChords,
    currentStep,
  });

  // Generate velocity with slight variation
  const velocity = generateNoteVelocity(currentStep);

  return {
    note: pitch,
    velocity,
    start: currentStep + 1, // Convert to 1-based step
    end: currentStep + duration + 1,
  };
}

function calculateNoteDuration(step) {
  // More complex duration logic could be added here
  const possibleDurations = [1, 2, 4];
  return possibleDurations[
    Math.floor(Math.random() * possibleDurations.length)
  ];
}

function calculateNotePitch({
  baseNote,
  scalePattern,
  registerRange,
  melodicContour,
  harmonyAlignment,
  currentChords,
  currentStep,
}) {
  // Get available notes in the current register
  const availableNotes = [];
  let note = registerRange.min;

  while (note <= registerRange.max) {
    const noteInScale = scalePattern.some(
      (interval) => (note - baseNote) % 12 === interval
    );
    if (noteInScale) {
      availableNotes.push(note);
    }
    note++;
  }

  // Apply melodic contour influence
  const contourIndex = Math.floor(
    (melodicContour / 100) * (availableNotes.length - 1)
  );

  // Higher contour values prefer higher notes
  const preferredNote = availableNotes[contourIndex];

  // Apply harmony alignment
  const harmonicNote = findHarmonicNote(
    preferredNote,
    currentChords,
    currentStep,
    harmonyAlignment
  );

  return harmonicNote || preferredNote;
}

function findHarmonicNote(
  preferredNote,
  currentChords,
  step,
  harmonyAlignment
) {
  // Simplified harmony logic - could be expanded
  if (currentChords && currentChords.length > 0) {
    const currentChord = currentChords[step % currentChords.length];
    if (currentChord && harmonyAlignment > 50) {
      // Adjust note to nearest chord tone
      const chordTones = currentChord.notes || [];
      if (chordTones.length > 0) {
        return findNearestNote(preferredNote, chordTones);
      }
    }
  }
  return preferredNote;
}

function findNearestNote(target, possibleNotes) {
  return possibleNotes.reduce((nearest, current) => {
    const currentDistance = Math.abs(current - target);
    const nearestDistance = Math.abs(nearest - target);
    return currentDistance < nearestDistance ? current : nearest;
  }, possibleNotes[0]);
}

function generateNoteVelocity(step) {
  // Add slight velocity variation based on step position
  const baseVelocity = MIN_VELOCITY + Math.floor(Math.random() * 20);
  const stepAccent = step % 8 === 0 ? 10 : 0; // Accent every 8th step
  return Math.min(MAX_VELOCITY, baseVelocity + stepAccent);
}

// Utility function to update melody when parameters change
function updateMelody(state, params) {
  const melodyNotes = generateMelody(params);
  state.tracks.melody = melodyNotes;
  return melodyNotes;
}
