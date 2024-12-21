// Main JavaScript for the Music Generation System

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

// State
let generationState = {
  genre: "edm",
  key: "C",
  scale: "major",
  tracks: {
    drums: {},
    bass: {},
    melody: {},
    callResponse: {},
    chords: {},
    drones: {},
    chordExtensions: {},
  },
};

// Track Generators (Stubs)
function generateDrumPattern() {
  // Returns a 4-on-the-floor pattern with random hi-hats
  const pattern = [
    {
      note: "F",
      start: 1,
      end: 2,
      velocity: 100,
    },
    {
      note: "F",
      start: 9,
      end: 10,
      velocity: 100,
    },
    {
      note: "F",
      start: 17,
      end: 18,
      velocity: 100,
    },
    {
      note: "F",
      start: 25,
      end: 26,
      velocity: 100,
    },
  ];

  // Add random hi-hats to the pattern
  for (let i = 1; i <= 32; i++) {
    if (Math.random() > 0.7) {
      // 30% chance for a hi-hat hit on each beat
      pattern.push({
        note: "A#", // Hi-hat note
        start: i,
        end: i + 1,
        velocity: 80,
      });
    }
  }

  return pattern;
}

function generateBassPattern() {
  return [];
}

function generateMelody() {
  return [];
}

function generateCallResponse() {
  return [];
}

function generateChords() {
  return [];
}

function generateDrones() {
  return [];
}

function generateChordExtensions() {
  return [];
}

// MIDI Clock Player
let midiPlayer = {
  isPlaying: false,
  currentBeat: 0,
  bpm: 120, // Default BPM, updated from external MIDI clock
  noteTriggered: false, // Prevent duplicate triggers per beat

  start() {
    this.isPlaying = true;
    this.currentBeat = 0;
    this.noteTriggered = false;
  },

  stop() {
    this.isPlaying = false;
    this.currentBeat = 0;
    this.noteTriggered = false;
    resetAllNotes();
  },

  onMidiClockTick() {
    if (!this.isPlaying) return;

    // Handle 24 MIDI clock ticks per quarter note
    const ticksPerBeat = 6; // Assuming 4/4 time signature
    const ticksInBar = 24 * 4; // 24 ticks per quarter note, 4 beats per bar
    const tickPosition = performance.now() % ticksInBar;

    // Only trigger notes once per beat
    if (tickPosition % ticksPerBeat === 0 && !this.noteTriggered) {
      this.noteTriggered = true;
      playNotesForCurrentBeat(this.currentBeat);

      // Advance the beat
      this.currentBeat = (this.currentBeat + 1) % 32;
    } else if (tickPosition % ticksPerBeat !== 0) {
      this.noteTriggered = false;
    }
  },
};

// Reset all notes on stop
function resetAllNotes() {
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];
    track.forEach((note) => {
      sendMidiNoteOff(MIDI_CHANNELS[trackName], note.note);
    });
  });
}

// Attach MIDI Event Listeners
function setupMidiInputs() {
  navigator.requestMIDIAccess().then((midiAccess) => {
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMidiMessage;
    }
  });
}

// Handle MIDI Messages
function handleMidiMessage(message) {
  const [status, data1] = message.data;
  const command = status & 0xf0;

  switch (command) {
    case 0xf8: // MIDI Clock Tick
      midiPlayer.onMidiClockTick();
      break;
    case 0xfc: // MIDI Stop
      midiPlayer.stop();
      break;
    case 0xfa: // MIDI Start
      midiPlayer.start();
      break;
    default:
      console.log(`Unhandled MIDI message: ${message.data}`);
  }
}

// Play Notes for Current Beat
function playNotesForCurrentBeat(beat) {
  Object.keys(generationState.tracks).forEach((trackName) => {
    const track = generationState.tracks[trackName];

    track.forEach((note) => {
      if (note.start === beat) {
        sendMidiNoteOn(MIDI_CHANNELS[trackName], note.note, note.velocity);
      }
      if (note.end === beat) {
        sendMidiNoteOff(MIDI_CHANNELS[trackName], note.note);
      }
    });
  });
}

// MIDI Note Handlers
function sendMidiNoteOn(channel, note, velocity) {
  console.log(
    `MIDI Note On: Channel ${channel}, Note ${note}, Velocity ${velocity}`
  );
  // Add actual MIDI sending logic here
}

function sendMidiNoteOff(channel, note) {
  console.log(`MIDI Note Off: Channel ${channel}, Note ${note}`);
  // Add actual MIDI sending logic here
}

// Initialization
function initializeUI() {
  document.getElementById("genre-select").addEventListener("change", (e) => {
    generationState.genre = e.target.value;
    regenerateTracks();
  });

  document.getElementById("key-select").addEventListener("change", (e) => {
    generationState.key = e.target.value;
    regenerateTracks();
  });

  document.getElementById("scale-select").addEventListener("change", (e) => {
    generationState.scale = e.target.value;
    regenerateTracks();
  });

  setupTrackControls("drum", generateDrumPattern);
  setupTrackControls("bass", generateBassPattern);
  setupTrackControls("melody", generateMelody);
  setupTrackControls("callResponse", generateCallResponse);
  setupTrackControls("chords", generateChords);
  setupTrackControls("drones", generateDrones);
  setupTrackControls("chordExtensions", generateChordExtensions);
}

function setupTrackControls(trackName, generator) {
  const controls = document.querySelector(
    `#${trackName}-patterns, #${trackName}`
  );

  if (controls) {
    controls.querySelectorAll("input, select").forEach((control) => {
      control.addEventListener("input", () => {
        generationState.tracks[trackName] = generator();
        renderTrackVisualization(trackName);
      });
    });
  }
}

// Regenerate All Tracks
function regenerateTracks() {
  generationState.tracks.drums = generateDrumPattern();
  generationState.tracks.bass = generateBassPattern();
  generationState.tracks.melody = generateMelody();
  generationState.tracks.callResponse = generateCallResponse();
  generationState.tracks.chords = generateChords();
  generationState.tracks.drones = generateDrones();
  generationState.tracks.chordExtensions = generateChordExtensions();

  renderAllVisualizations();
}

// Rendering
function renderTrackVisualization(trackName) {
  const table = document.querySelector(
    `#${trackName}-patterns .sequence-table, #${trackName} .sequence-table`
  );
  if (table) {
    // Clear existing rows
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    // Define categories for drum visualization
    const categories = [
      { type: "Kick", notes: ["F"] },
      { type: "Snare", notes: ["G"] },
      { type: "Hi-Hat", notes: ["A#"] },
      { type: "Tom", notes: ["C", "D"] },
    ];

    // Loop through categories and render rows
    categories.forEach((category) => {
      const row = document.createElement("tr");
      const categoryCell = document.createElement("td");
      categoryCell.textContent = category.type;
      categoryCell.style.whiteSpace = "nowrap";
      row.appendChild(categoryCell);

      for (let i = 1; i <= 32; i++) {
        const cell = document.createElement("td");
        cell.style.border = "1px solid black";

        // Check if any notes in this category match the current beat
        const notesAtBeat = generationState.tracks[trackName].filter(
          (note) =>
            category.notes.includes(note.note) &&
            i >= note.start &&
            i < note.end
        );

        if (notesAtBeat.length > 0) {
          cell.classList.add("hit");
          cell.textContent = notesAtBeat[0].note === "A#" ? "✱" : "•"; // Example: different symbol for hi-hat
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });
  }
}

function renderAllVisualizations() {
  Object.keys(generationState.tracks).forEach(renderTrackVisualization);
}

// Start the Application
document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
});
