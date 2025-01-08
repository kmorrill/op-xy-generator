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

  const sendChannelSelects = document.querySelectorAll('[id$="-send-channel"]');
  sendChannelSelects.forEach((select) => {
    const defaultChannels = {
      "drum-send-channel": MIDI_CHANNELS.drums,
      "bass-send-channel": MIDI_CHANNELS.bass,
      "melody-send-channel": MIDI_CHANNELS.melody,
      "chord-send-channel": MIDI_CHANNELS.chords,
      "response-send-channel": MIDI_CHANNELS.callResponse,
    };
    const channelId = select.id;
    for (let i = 1; i <= 16; i++) {
      const option = document.createElement("option");
      option.text = i;
      option.value = i;
      if (defaultChannels[channelId] === i) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  });
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
