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
  };

  const keyIndex = noteNames.indexOf(key);
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
  return intervals.map((interval) => (keyIndex + interval) % 12);
}

// New helper function to get all valid scale notes within a range
function getAllScaleNotesInRange(minNote, maxNote, scaleNotes) {
  const allNotes = [];
  const minOctave = Math.floor(minNote / 12);
  const maxOctave = Math.floor(maxNote / 12);

  for (let octave = minOctave; octave <= maxOctave; octave++) {
    scaleNotes.forEach((noteInScale) => {
      const midiNote = octave * 12 + noteInScale;
      if (midiNote >= minNote && midiNote <= maxNote) {
        allNotes.push(midiNote);
      }
    });
  }

  return allNotes.sort((a, b) => getNoteValue(b) - getNoteValue(a));
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

    // Find min and max MIDI notes from the track
    const midiNotes = notes.map((note) => note.note);
    const minNote = Math.min(...midiNotes);
    const maxNote = Math.max(...midiNotes);

    // Get all valid scale notes within the range
    const allScaleNotes = getAllScaleNotesInRange(minNote, maxNote, scaleNotes);

    // Create rows for all scale notes in range
    allScaleNotes.forEach((pitch) => {
      const row = document.createElement("tr");
      const noteLabel = midiNoteToName(pitch);

      // Add row header
      const labelCell = document.createElement("td");
      labelCell.textContent = noteLabel;
      // Highlight notes that are in the current scale
      const pitchClass = pitch % 12;
      if (scaleNotes.includes(pitchClass)) {
        labelCell.classList.add("in-scale");
      }
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
  generationState.tracks.bass = generateBassLine();
  generationState.tracks.chords = generateChords(generationState);
  generationState.tracks.melody = generateMelody(generationState);
  renderAllVisualizations();
}

document.addEventListener("DOMContentLoaded", () => {
  regenerateTracks();
});
