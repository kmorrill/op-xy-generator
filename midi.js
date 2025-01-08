function sendMidiNoteOn(channel, note, velocity, output) {
  output.send([0x90 | (channel - 1), note, velocity]);
}

function sendMidiNoteOff(channel, note, output) {
  output.send([0x80 | (channel - 1), note, 0]);
}

function setupMidiInputs() {
  navigator.requestMIDIAccess().then((access) => {
    midiAccess = access;

    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMidiMessage;
    }

    const outputs = Array.from(midiAccess.outputs.values());
    if (outputs.length > 0) {
      midiOutput = outputs[0];
    }

    console.log(`MIDI Output: ${midiOutput ? midiOutput.name : "None"}`);

    document.querySelectorAll(".knob").forEach((knob) => {
      knob.addEventListener("input", () => {
        console.log(`Knob changed: ${knob.id}`);
        regenerateTracks();
      });
    });
  });
}

function playGeneratedNotes(step) {
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];
    track.forEach((note) => {
      // Grab channel and mute status from UI
      const elementLookup = {
        drums: "drum",
        bass: "bass",
        melody: "melody",
        chords: "chord",
        "chord-extensions": "chord-extensions",
        drones: "drones",
        callresponse: "response",
      };

      const prefix = elementLookup[trackName];

      const channel = document.getElementById(`${prefix}-send-channel`).value;
      const muteStatus = document.getElementById(`${prefix}-mute`).checked;

      if (note.start === step && !muteStatus) {
        sendMidiNoteOn(channel, note.note, note.velocity, midiOutput);
      }

      // BUG TODO if you change channel while the note is on, off will be sent to the new channel
      if (note.end === step) {
        sendMidiNoteOff(channel, note.note, midiOutput);
      }
    });
  });
}
