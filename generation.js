// Constants
const MIDI_CHANNELS = {
  drums: 1,
  bass: 3,
  melody: 4,
  callResponse: 5,
  chords: 7,
  drones: 8,
  chordExtensions: 6,
};

// Drum MIDI notes
const DRUMS = {
  KICK: 53, // F2
  KICK_ALT: 54, // F#2
  SNARE: 43, // G1
  SNARE_ALT: 44, // G#1
  RIM: 45, // A1
  CLAP: 46, // A#1
  TAMBOURINE: 47, // B1
  SHAKER: 48, // C2
  CLOSED_HAT: 49, // C#2
  OPEN_HAT: 50, // D2
  PEDAL_HAT: 51, // D#2
  LOW_TOM: 53, // F2
  CRASH: 54, // F#2
  MID_TOM: 55, // G2
  RIDE: 56, // G#2
  HIGH_TOM: 57, // A2
  CONGA_LOW: 59, // B2
  CONGA_HIGH: 60, // C3
  COWBELL: 61, // C#3
  GUIRO: 62, // D3
  METAL: 63, // D#3
  CHI: 64, // E3
};

// State
let generationState = {
  genre: "edm",
  key: "C",
  scale: "major",
  tracks: {
    drums: [],
    bass: [],
    melody: [],
    callResponse: [],
    chords: [],
    drones: [],
    chordExtensions: [],
  },
};

// Track Generators
function generateDrumPattern() {
  const pattern = [];

  // Core beat - Kick on 1 and 3
  [1, 9, 17, 25].forEach((beat) => {
    pattern.push({
      note: DRUMS.KICK,
      start: beat,
      end: beat + 1,
      velocity: 100,
    });
  });

  // Snare on 2 and 4
  [5, 13, 21, 29].forEach((beat) => {
    pattern.push({
      note: DRUMS.SNARE,
      start: beat,
      end: beat + 1,
      velocity: 90,
    });
  });

  // Hi-hats on eighth notes with randomization
  for (let i = 1; i <= 32; i += 2) {
    if (Math.random() > 0.2) {
      // 80% chance of a hi-hat hit
      pattern.push({
        note: DRUMS.CLOSED_HAT,
        start: i,
        end: i + 1,
        velocity: 80 + Math.floor(Math.random() * 10), // Slight velocity variation
      });
    }
  }

  // Random open hats
  [7, 15, 23, 31].forEach((beat) => {
    if (Math.random() > 0.6) {
      pattern.push({
        note: DRUMS.OPEN_HAT,
        start: beat,
        end: beat + 1,
        velocity: 85,
      });
    }
  });

  // Occasional claps to reinforce snare
  [5, 21].forEach((beat) => {
    if (Math.random() > 0.7) {
      pattern.push({
        note: DRUMS.CLAP,
        start: beat,
        end: beat + 1,
        velocity: 75,
      });
    }
  });

  // Fill at the end of 8 bars
  if (Math.random() > 0.5) {
    [30, 31, 32].forEach((beat, i) => {
      pattern.push({
        note: [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM][i],
        start: beat,
        end: beat + 1,
        velocity: 90,
      });
    });
  }

  return pattern;
}

function regenerateTracks() {
  generationState.tracks.drums = generateDrumPattern();
  console.log("Generated drum pattern:", generationState.tracks.drums);
  renderAllVisualizations();
}
