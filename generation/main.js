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

// Initialize window.generationState if it doesn't exist
if (!window.generationState) {
  window.generationState = {
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
}

function regenerateTracks() {
  window.generationState.tracks.drums = generateDrumPattern();
  window.generationState.tracks.bass = generateBassLine();
  window.generationState.tracks.chords = generateChords(window.generationState);
  window.generationState.tracks.melody = generateMelody();

  renderAllVisualizations();
}

window.regenerateTracks = regenerateTracks;
