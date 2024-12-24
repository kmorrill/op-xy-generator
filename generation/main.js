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

function regenerateTracks() {
  // Validate and clamp drum velocities
  generationState.tracks.drums = generateDrumPattern().map((note) => {
    let velocity = parseInt(note.velocity, 10);
    velocity = clamp(isNaN(velocity) ? 100 : velocity, 1, 127);
    return {
      ...note,
      velocity: velocity,
    };
  });

  generationState.tracks.bass = regenerateBassLine();
  generationState.tracks.chords = generateChords(generationState);
  generationState.tracks.melody = generateMelody(generationState);

  console.log("Generated drum pattern:", generationState.tracks.drums);
  console.log("Generated bass line:", generationState.tracks.bass);
  renderAllVisualizations();
}

window.regenerateTracks = regenerateTracks;
