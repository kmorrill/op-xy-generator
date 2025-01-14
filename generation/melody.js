// melody.js

// Constants for melody generation
const MELODY_CHANNEL = 4;
const RESPONSE_CHANNEL = 5;
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

// Helper function for weighted random selection
function weightedRandomSelection(items, weights) {
  const cumulativeWeights = [];
  weights.reduce((acc, weight, index) => {
    cumulativeWeights[index] = acc + weight;
    return cumulativeWeights[index];
  }, 0);

  const random =
    Math.random() * cumulativeWeights[cumulativeWeights.length - 1];

  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random < cumulativeWeights[i]) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

// Helper function to convert MIDI note numbers to note names
function midiNoteToName(noteNumber) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Calculate the octave
  const octave = Math.floor(noteNumber / 12) - 1;
  // Index into noteNames
  const noteIndex = noteNumber % 12;
  const noteName = noteNames[noteIndex];

  return `${noteName}${octave}`;
}

function generateMelody() {
  const genre = document.getElementById("genre-select").value;
  const key = document.getElementById("key-select").value;
  const scale = document.getElementById("scale-select").value;
  const melodicContour = document.getElementById("melody-contour").value;
  const rhythmicComplexity = document.getElementById("melody-rhythm").value;
  const register = document.getElementById("melody-register").value;
  const harmonyAlignment = document.getElementById("melody-harmony").value;
  const responseDelay = parseInt(
    document.getElementById("melody-response-delay").value
  );
  const responseComplexity = parseInt(
    document.getElementById("melody-response-complexity").value
  );
  const callResponseBalance = parseInt(
    document.getElementById("melody-call-balance").value
  );
  const responseRegister = document.getElementById(
    "melody-response-register"
  ).value;
  const melodyLength = parseInt(document.getElementById("melody-length").value);
  const currentChords = [];

  // Generate call and response sections based on total melody length
  const callLength = Math.floor((melodyLength * callResponseBalance) / 100);
  const responseLength = melodyLength - callLength;

  // Generate the call phrase
  const callNotes = generatePhrase({
    baseNote: getBaseNoteFromKey(key),
    scalePattern: GENRE_SCALES[genre] || GENRE_SCALES.edm,
    registerRange: calculateRegisterRange(register),
    melodicContour,
    harmonyAlignment,
    rhythmicComplexity,
    currentChords,
    length: callLength,
    startStep: 0,
    channel: MELODY_CHANNEL,
  });

  // Calculate response parameters based on input
  const responseRegisterRange = calculateRegisterRange(responseRegister);
  // Scale response delay based on total length
  const maxDelay = Math.min(4, melodyLength * 0.125); // Max delay is either 4 or 12.5% of length
  const responseStart = callLength + (responseDelay / 100) * maxDelay;

  // Modify complexity for response based on responseComplexity parameter
  const responseRhythmicComplexity = adjustResponseComplexity(
    rhythmicComplexity,
    responseComplexity
  );

  // Generate the response phrase
  const responseNotes = generatePhrase({
    baseNote: getBaseNoteFromKey(key),
    scalePattern: GENRE_SCALES[genre] || GENRE_SCALES.edm,
    registerRange: responseRegisterRange,
    melodicContour: invertContour(melodicContour), // Invert the contour for contrast
    harmonyAlignment,
    rhythmicComplexity: responseRhythmicComplexity,
    currentChords,
    length: responseLength,
    startStep: responseStart,
    channel: RESPONSE_CHANNEL,
    isResponse: true,
    referenceNotes: callNotes, // Pass call notes for thematic reference
  });

  return [...callNotes, ...responseNotes];
}

function generatePhrase({
  baseNote,
  scalePattern,
  registerRange,
  melodicContour,
  harmonyAlignment,
  rhythmicComplexity,
  currentChords,
  length,
  startStep,
  channel,
  isResponse = false,
  referenceNotes = [],
}) {
  const notes = [];
  const noteDensity = calculateNoteDensity(rhythmicComplexity);
  let currentStep = startStep;

  while (currentStep < startStep + length) {
    if (shouldGenerateNote(currentStep, noteDensity)) {
      const note = generateMelodyNote({
        baseNote,
        scalePattern,
        registerRange,
        melodicContour,
        harmonyAlignment,
        currentStep,
        currentChords,
        isResponse,
        referenceNotes,
      });

      if (note) {
        // Add channel information to the note
        notes.push({
          ...note,
          channel,
        });
        currentStep += note.end - note.start;
        continue;
      }
    }
    currentStep++;
  }

  return notes;
}

function adjustResponseComplexity(baseComplexity, responseComplexity) {
  // responseComplexity 0-100: 0 = simpler, 50 = same, 100 = more complex
  const factor = (responseComplexity - 50) / 50; // -1 to 1
  let adjustedComplexity = baseComplexity * (1 + factor);
  return Math.max(0, Math.min(100, adjustedComplexity));
}

function invertContour(contour) {
  // Invert the melodic contour (0-100) for contrast
  return 100 - contour;
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
  isResponse = false,
  referenceNotes = [],
}) {
  // Calculate note duration based on step position
  const duration = calculateNoteDuration(currentStep);

  // Get melody length from the DOM
  const melodyLength = parseInt(document.getElementById("melody-length").value);

  // Check if the note would extend beyond sequence
  if (currentStep + duration > melodyLength) {
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
    isResponse,
    referenceNotes,
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
  isResponse,
  referenceNotes,
}) {
  // Get available notes in the current register
  const availableNotes = [];
  let note = registerRange.min;

  while (note <= registerRange.max) {
    const noteInScale = scalePattern.some(
      (interval) => (((note - baseNote) % 12) + 12) % 12 === interval
    );
    if (noteInScale) {
      availableNotes.push(note);
    }
    note++;
  }

  if (availableNotes.length === 0) {
    console.warn("No available notes in the current register and scale.");
    return baseNote; // Fallback to baseNote
  }

  // Calculate weights based on melodicContour
  const contourPosition = (melodicContour / 100) * (availableNotes.length - 1);
  let weights = availableNotes.map((note, index) => {
    const distance = Math.abs(index - contourPosition);
    // Invert distance so that closer notes have higher weight
    const weight = 1 / (distance + 1); // +1 to prevent division by zero
    return weight;
  });

  // If this is a response, adjust weights to favor notes that relate to the call
  if (isResponse && referenceNotes.length > 0) {
    weights = adjustWeightsForResponse(availableNotes, weights, referenceNotes);
  }

  // Select a note based on weights
  const selectedNote = weightedRandomSelection(availableNotes, weights);

  // Apply harmony alignment
  const harmonicNote = findHarmonicNote(
    selectedNote,
    currentChords,
    currentStep,
    harmonyAlignment
  );

  return harmonicNote || selectedNote;
}

function adjustWeightsForResponse(availableNotes, weights, referenceNotes) {
  // Find the most recent call notes
  const recentCallNotes = referenceNotes.slice(-3).map((n) => n.note);

  return weights.map((weight, index) => {
    const note = availableNotes[index];
    let responseBonus = 1;

    // Favor notes that form musical intervals with recent call notes
    recentCallNotes.forEach((callNote) => {
      const interval = Math.abs(note - callNote) % 12;
      // Bonus for perfect intervals (unison, fourth, fifth, octave)
      if ([0, 5, 7].includes(interval)) {
        responseBonus *= 1.5;
      }
      // Bonus for thirds and sixths
      else if ([3, 4, 8, 9].includes(interval)) {
        responseBonus *= 1.3;
      }
    });

    return weight * responseBonus;
  });
}

function findHarmonicNote(selectedNote, currentChords, step, harmonyAlignment) {
  if (currentChords && currentChords.length > 0) {
    const currentChord = currentChords[step % currentChords.length];
    if (currentChord && harmonyAlignment > 50) {
      const chordTones = currentChord.notes || [];
      if (chordTones.length > 0) {
        // Determine probability to stick to chord tone based on harmonyAlignment
        const stickToChordProb = harmonyAlignment / 100;

        if (Math.random() < stickToChordProb) {
          // Stick to chord tone
          return findNearestNote(selectedNote, chordTones);
        } else {
          // Deviate from chord tone by selecting another available note
          return selectedNote;
        }
      }
    }
  }
  return selectedNote;
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
