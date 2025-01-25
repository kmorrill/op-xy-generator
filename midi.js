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
        regenerateTracks();
      });
    });
  });
}

function playGeneratedNotes(step) {
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];

    // Get the track's length from the UI
    const lengthElementMap = {
      drums: "drum-length",
      bass: "bass-length",
      melody: "melody-length",
      chords: "chords-length",
      "chord-extensions": "chords-length", // Extensions use same length as chords
      drones: "chords-length", // Drones use same length as chords
      callresponse: "melody-length", // Call response uses same length as melody
    };

    const lengthElement = document.getElementById(lengthElementMap[trackName]);
    const trackLength = lengthElement ? parseInt(lengthElement.value) : 16; // Default to 16 if not found

    // Normalize the step to the track's length
    // For example: if step is 10 and trackLength is 8:
    // ((10 - 1) % 8) + 1 = 2, so we play step 2 of the pattern again
    const normalizedStep = ((step - 1) % trackLength) + 1;

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

      const channel =
        note.type === "extension"
          ? document.getElementById(`chord-extensions-send-channel`).value
          : note.type === "drone"
          ? document.getElementById(`drones-send-channel`).value
          : note.type === "response"
          ? document.getElementById(`response-send-channel`).value
          : note.type === "main"
          ? document.getElementById(`${prefix}-send-channel`).value
          : document.getElementById(`${prefix}-send-channel`).value;
      const muteStatus = document.getElementById(`${prefix}-mute`).checked;

      // Check if this note should be played at the current normalized step
      if (note.start === normalizedStep && !muteStatus) {
        sendMidiNoteOn(channel, note.note, note.velocity, midiOutput);
      }

      // Calculate when the note should end, taking into account pattern repetition
      const noteEnd = ((note.end - 1) % trackLength) + 1;
      if (noteEnd === normalizedStep) {
        sendMidiNoteOff(channel, note.note, midiOutput);
      }

      // Handle notes that cross pattern boundaries
      // If a note starts near the end of the pattern and extends beyond it
      if (
        note.start > note.end &&
        (normalizedStep === 1 || normalizedStep === note.start)
      ) {
        // Send note-off at pattern end and note-on at pattern start
        if (normalizedStep === 1) {
          sendMidiNoteOff(channel, note.note, midiOutput);
          if (!muteStatus) {
            sendMidiNoteOn(channel, note.note, note.velocity, midiOutput);
          }
        }
      }
    });
  });
}
