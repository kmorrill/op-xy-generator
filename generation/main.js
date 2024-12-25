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
  generationState.tracks.drums = generateDrumPattern();
  generationState.tracks.bass = generateBassLine();
  generationState.tracks.chords = generateChords(generationState);
  generationState.tracks.melody = generateMelody(generationState);

  renderAllVisualizations();
}

window.regenerateTracks = regenerateTracks;
