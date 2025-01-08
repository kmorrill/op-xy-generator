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
      "drones-send-channel": MIDI_CHANNELS.drones,
      "chord-extensions-send-channel": MIDI_CHANNELS.chordExtensions,
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
  if (!document.getElementById("drum-lock").checked) {
    generationState.tracks.drums = generateDrumPattern();
  }
  if (!document.getElementById("bass-lock").checked) {
    generationState.tracks.bass = generateBassLine();
  }
  if (!document.getElementById("chord-lock").checked) {
    generationState.tracks.chords = generateChords(generationState);
  }
  if (!document.getElementById("melody-lock").checked) {
    generationState.tracks.melody = generateMelody(generationState);
  }
  renderAllVisualizations();
}

document.addEventListener("DOMContentLoaded", () => {
  regenerateTracks();
});
