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
