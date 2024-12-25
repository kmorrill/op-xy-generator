let midiAccess;
let midiOutput;
let loopInterval;
let loopStartTime;
let noteTriggered = false;

// Global clamp function to restrict values between min and max
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

document.addEventListener("DOMContentLoaded", () => {
  setupMidiInputs();
  regenerateTracks();
});

// Example: Call renderAllVisualizations after generating tracks
function regenerateTracks() {
  generationState.tracks.drums = generateDrumPattern();
  generationState.tracks.bass = generateBassLine();
  generationState.tracks.chords = generateChords(generationState);
  generationState.tracks.melody = generateMelody(generationState);
  renderAllVisualizations();
}

document.addEventListener("DOMContentLoaded", () => {
  regenerateTracks();
});
