let midiAccess;
let midiOutput;
let loopInterval;
let loopStartTime;
let noteTriggered = false;

document.addEventListener("DOMContentLoaded", () => {
  setupMidiInputs();
  regenerateTracks();
});
