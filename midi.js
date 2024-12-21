function sendMidiNoteOn(channel, note, velocity, output) {
  console.log(
    `Sending MIDI Note On: Channel ${channel}, Note ${note}, Velocity ${velocity}`
  );
  output.send([0x90 | (channel - 1), note, velocity]);
}

function sendMidiNoteOff(channel, note, output) {
  console.log(`Sending MIDI Note Off: Channel ${channel}, Note ${note}`);
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
  console.log(`Playing notes for step: ${step}`);
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];
    track.forEach((note) => {
      if (note.start === step) {
        console.log(`Note ON: ${note.note} at velocity ${note.velocity}`);
        sendMidiNoteOn(
          MIDI_CHANNELS[trackName],
          note.note,
          note.velocity,
          midiOutput
        );
      }
      if (note.end === step) {
        console.log(`Note OFF: ${note.note}`);
        sendMidiNoteOff(MIDI_CHANNELS[trackName], note.note, midiOutput);
      }
    });
  });
}
