// Main JavaScript for the Music Generation System

let midiAccess;
let midiOutput;
let clockRunning = false;
let loopInterval;
let loopStartTime;
let noteTriggered = false;
let clockTickCount = 0;
const TICKS_PER_QUARTER = 24;
const TICKS_PER_BAR = TICKS_PER_QUARTER * 4;

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

// Drum MIDI notes
const DRUMS = {
  KICK: 41, // F1
  KICK_ALT: 42, // F#1
  SNARE: 43, // G1
  SNARE_ALT: 44, // G#1
  RIM: 45, // A1
  CLAP: 46, // A#1
  TAMBOURINE: 47, // B1
  SHAKER: 48, // C2
  CLOSED_HAT: 49, // C#2
  OPEN_HAT: 50, // D2
  PEDAL_HAT: 51, // D#2
  LOW_TOM: 53, // F2
  CRASH: 54, // F#2
  MID_TOM: 55, // G2
  RIDE: 56, // G#2
  HIGH_TOM: 57, // A2
  CONGA_LOW: 59, // B2
  CONGA_HIGH: 60, // C3
  COWBELL: 61, // C#3
  GUIRO: 62, // D3
  METAL: 63, // D#3
  CHI: 64, // E3
};

// State
let generationState = {
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

// Track Generators
function generateDrumPattern() {
  const pattern = [];

  // Core beat - Kick on 1 and 3
  [1, 9, 17, 25].forEach((beat) => {
    pattern.push({
      note: DRUMS.KICK,
      start: beat,
      end: beat + 1,
      velocity: 100,
    });
  });

  // Snare on 2 and 4
  [5, 13, 21, 29].forEach((beat) => {
    pattern.push({
      note: DRUMS.SNARE,
      start: beat,
      end: beat + 1,
      velocity: 90,
    });
  });

  // Hi-hats on eighth notes with randomization
  for (let i = 1; i <= 32; i += 2) {
    if (Math.random() > 0.2) {
      // 80% chance of a hi-hat hit
      pattern.push({
        note: DRUMS.CLOSED_HAT,
        start: i,
        end: i + 1,
        velocity: 80 + Math.floor(Math.random() * 10), // Slight velocity variation
      });
    }
  }

  // Random open hats
  [7, 15, 23, 31].forEach((beat) => {
    if (Math.random() > 0.6) {
      pattern.push({
        note: DRUMS.OPEN_HAT,
        start: beat,
        end: beat + 1,
        velocity: 85,
      });
    }
  });

  // Occasional claps to reinforce snare
  [5, 21].forEach((beat) => {
    if (Math.random() > 0.7) {
      pattern.push({
        note: DRUMS.CLAP,
        start: beat,
        end: beat + 1,
        velocity: 75,
      });
    }
  });

  // Fill at the end of 8 bars
  if (Math.random() > 0.5) {
    [30, 31, 32].forEach((beat, i) => {
      pattern.push({
        note: [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM][i],
        start: beat,
        end: beat + 1,
        velocity: 90,
      });
    });
  }

  return pattern;
}

function regenerateTracks() {
  generationState.tracks.drums = generateDrumPattern();
  console.log("Generated drum pattern:", generationState.tracks.drums);
  renderAllVisualizations();
}

// Rendering
function renderTrackVisualization(trackName) {
  console.log(`Rendering visualization for track: ${trackName}`);
  const table = document.querySelector(`#drum-patterns .sequence-table`);
  if (!table) {
    console.error(`Table for ${trackName} not found.`);
    return;
  }
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  const notes = generationState.tracks[trackName];
  if (notes.length === 0) {
    console.warn(`No notes to visualize for track: ${trackName}`);
    return;
  }

  // Render rows and beats
  const categories = [
    { type: "Kick", notes: [DRUMS.KICK, DRUMS.KICK_ALT] },
    { type: "Snare", notes: [DRUMS.SNARE, DRUMS.SNARE_ALT, DRUMS.CLAP] },
    { type: "Hi-Hats", notes: [DRUMS.CLOSED_HAT, DRUMS.OPEN_HAT] },
    { type: "Toms", notes: [DRUMS.LOW_TOM, DRUMS.MID_TOM, DRUMS.HIGH_TOM] },
  ];

  categories.forEach((category) => {
    const row = document.createElement("tr");
    const categoryCell = document.createElement("td");
    categoryCell.textContent = category.type;
    row.appendChild(categoryCell);

    for (let i = 1; i <= 32; i++) {
      const cell = document.createElement("td");
      cell.style.border = "1px solid black";

      const matchingNotes = notes.filter(
        (note) =>
          category.notes.includes(note.note) && i >= note.start && i < note.end
      );

      if (matchingNotes.length > 0) {
        cell.classList.add("hit");
        cell.textContent = "•";
      }

      row.appendChild(cell);
    }

    tbody.appendChild(row);
  });
}

function renderAllVisualizations() {
  renderTrackVisualization("drums");
}

// MIDI Functions
function handleMidiMessage(message) {
  const [status, data1, data2] = message.data;

  switch (status) {
    case 0xfa: // MIDI Start
      startClock();
      break;
    case 0xfc: // MIDI Stop
      stopClock();
      break;
    case 0xf8: // MIDI Clock Tick
      if (clockRunning) {
        handleClockTick();
      }
      break;
    default:
      // Log other MIDI messages if needed
      console.log("MIDI message received:", status, data1, data2);
      break;
  }
}

function startClock() {
  if (!clockRunning) {
    clockRunning = true;
    clockTickCount = 0; // Reset tick count
    console.log("Clock started.");
  }
}

function stopClock() {
  if (clockRunning) {
    clockRunning = false;
    console.log("Clock stopped.");
  }
}

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

function playGeneratedNotes(beat) {
  console.log(`Playing notes for beat: ${beat}`);
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];
    track.forEach((note) => {
      if (note.start === beat) {
        console.log(`Note ON: ${note.note} at velocity ${note.velocity}`);
        sendMidiNoteOn(
          MIDI_CHANNELS[trackName],
          note.note,
          note.velocity,
          midiOutput
        );
      }
      if (note.end === beat) {
        console.log(`Note OFF: ${note.note}`);
        sendMidiNoteOff(MIDI_CHANNELS[trackName], note.note, midiOutput);
      }
    });
  });
}

function handleClockTick() {
  clockTickCount++;
  console.log(`Clock tick: ${clockTickCount}`);

  if (clockTickCount % TICKS_PER_QUARTER === 0) {
    const currentBeat = Math.floor(clockTickCount / TICKS_PER_QUARTER) % 32;
    console.log(`Processing beat: ${currentBeat + 1}`);
    playGeneratedNotes(currentBeat + 1);

    if (clockTickCount >= TICKS_PER_QUARTER * 32) {
      console.log("Resetting clock tick count");
      clockTickCount = 0;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupMidiInputs();
  regenerateTracks();
});
