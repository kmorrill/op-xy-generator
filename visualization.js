// visualization.js

// A helper function to convert MIDI note numbers into e.g. "C#4", "Eb3", etc.
function midiNoteToName(noteNumber) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Calculate the octave
  const octave = Math.floor(noteNumber / 12) - 1;
  // Index into noteNames
  const noteIndex = noteNumber % 12;
  const noteName = noteNames[noteIndex];

  return `${noteName}${octave}`;
}

// Helper function to get numerical value for note sorting
function getNoteValue(midiNote) {
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  // This gives each note a unique value that properly sorts them musically
  // by combining octave and note position
  return octave * 12 + ((noteIndex + 3) % 12);
}

// Function to calculate notes in the selected scale and mode
function getScaleNotes(scale, key) {
  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const scales = {
    major: [0, 2, 4, 5, 7, 9, 11], // Whole steps for major scale
    minor: [0, 2, 3, 5, 7, 8, 10], // Whole steps for natural minor scale
    // Add other scales here if needed
  };

  const keyIndex = noteNames.indexOf(key); // Find the key index
  if (keyIndex === -1) {
    console.error(`Invalid key: ${key}`);
    return [];
  }

  const intervals = scales[scale];
  if (!intervals) {
    console.error(`Invalid scale: ${scale}`);
    return [];
  }

  // Generate all notes in the selected scale
  const scaleNotes = intervals.map((interval) => (keyIndex + interval) % 12);
  return scaleNotes;
}

function renderTrackVisualization(trackName) {
  if (trackName === "drums") {
    const tableSelector = "#drum-patterns .sequence-table";
    const table = document.querySelector(tableSelector);
    if (!table) {
      console.error(`Drum table not found with selector: ${tableSelector}`);
      return;
    }

    const tbody = table.querySelector("tbody");
    if (!tbody) {
      console.error("Drum table body not found.");
      return;
    }

    // Clear previous 'hit' classes and innerHTML
    let hitCells = tbody.querySelectorAll("td.hit");
    hitCells.forEach((cell) => {
      cell.classList.remove("hit");
      cell.innerHTML = "";
    });

    const drumHits = generationState.tracks.drums;
    if (!drumHits || drumHits.length === 0) {
      console.warn("No drum hits to visualize.");
      return;
    }

    // Create a mapping from MIDI note numbers to drum types
    const midiToDrumMap = {};
    Object.entries(DRUMS).forEach(([drumType, midiNumber]) => {
      midiToDrumMap[midiNumber] = drumType;
    });

    // Iterate through each drum hit and update the table
    drumHits.forEach((hit) => {
      const { note, start } = hit;
      let drumType = midiToDrumMap[note];
      if (!drumType) {
        console.warn(`Unknown drum MIDI note: ${note}`);
        return;
      }
      drumType = midiToDrumMap[note] || "Other";

      // Map drum types to table rows
      if (drumType === "KICK" || drumType === "KICK_ALT") {
        drumType = "Kick";
      } else if (drumType === "SNARE" || drumType === "SNARE_ALT") {
        drumType = "Snare";
      } else if (drumType.includes("HAT")) {
        drumType = "Hi-hat";
      } else {
        drumType = "Other";
      }

      // Find the corresponding row in the table
      const row = Array.from(tbody.rows).find((r) =>
        r.cells[0].textContent
          .trim()
          .toLowerCase()
          .includes(drumType.toLowerCase())
      );

      if (!row) {
        console.warn(`No row for drum type: ${drumType}`);
        return;
      }

      const cell = row.cells[start];
      if (cell) {
        cell.innerHTML = "•";
        cell.classList.add("hit");
      }
    });

    return;
  }

  // For bass, chords, or melody, do the row-per-pitch approach with duration handling
  else if (
    trackName === "bass" ||
    trackName === "chords" ||
    trackName === "melody"
  ) {
    const selectedScale = document.getElementById("scale-select").value;
    const selectedKey = document.getElementById("key-select").value;

    const scaleNotes = getScaleNotes(selectedScale, selectedKey);

    let tableSelector;
    if (trackName === "bass") {
      tableSelector = "#basslines .sequence-table";
    } else if (trackName === "chords") {
      tableSelector = "#chords .sequence-table";
    } else if (trackName === "melody") {
      tableSelector = "#melodies .sequence-table";
    }

    const table = document.querySelector(tableSelector);
    if (!table) {
      console.error(`Table for ${trackName} not found.`);
      return;
    }

    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear old rows

    const notes = generationState.tracks[trackName];
    if (!notes || notes.length === 0) {
      console.warn(`No notes to visualize for track: ${trackName}`);
      return;
    }

    // Gather unique pitches and sort them using the new getNoteValue function
    const uniquePitches = [...new Set(notes.map((note) => note.note))];
    uniquePitches.sort((a, b) => getNoteValue(b) - getNoteValue(a)); // Sort by musical pitch

    // After sorting, convert MIDI numbers to note names for row headers
    uniquePitches.forEach((pitch) => {
      const row = document.createElement("tr");
      const noteLabel = midiNoteToName(pitch);

      // Add row header
      const labelCell = document.createElement("td");
      labelCell.textContent = noteLabel;
      row.appendChild(labelCell);

      // Add cells for each step
      let step = 0;
      while (step < 32) {
        const pitchNotes = notes.filter(
          (note) => note.note === pitch && note.start === step
        );

        if (pitchNotes.length > 0) {
          const currentNote = pitchNotes[0];
          const duration = currentNote.end - currentNote.start;
          const effectiveDuration = Math.min(duration, 32 - step);

          const cell = document.createElement("td");
          cell.colSpan = effectiveDuration;
          cell.textContent = "•";
          cell.classList.add("hit");
          cell.style.backgroundColor = "#FFD700";
          row.appendChild(cell);

          step += effectiveDuration;
        } else {
          const cell = document.createElement("td");
          row.appendChild(cell);
          step++;
        }
      }

      tbody.appendChild(row);
    });
  } else {
    console.error(`No visualization handler for track: ${trackName}`);
  }
}

// Render all tracks
function renderAllVisualizations() {
  renderTrackVisualization("drums");
  renderTrackVisualization("bass");
  renderTrackVisualization("chords");
  renderTrackVisualization("melody");
}

// Example: Call renderAllVisualizations after generating tracks
function regenerateTracks() {
  generationState.tracks.drums = generateDrumPattern();
  generationState.tracks.bass = regenerateBassLine();
  generationState.tracks.chords = generateChords(generationState);
  generationState.tracks.melody = generateMelody(generationState);
  renderAllVisualizations();
}

document.addEventListener("DOMContentLoaded", () => {
  regenerateTracks();
});
