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
      const channel = note.channel || MIDI_CHANNELS[trackName];
      if (note.start === step) {
        sendMidiNoteOn(channel, note.note, note.velocity, midiOutput);
      }
      if (note.end === step) {
        sendMidiNoteOff(channel, note.note, midiOutput);
      }
    });
  });
}
