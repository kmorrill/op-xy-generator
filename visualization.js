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

    // Determine the new length of the drum track
    const newDrumLength = document.getElementById("drum-length").value;

    // Clear unnecessary columns if the drum track length was shortened
    const rows = tbody.querySelectorAll("tr");
    rows.forEach((row) => {
      // Skip the first cell (label cell)
      const cellCount = row.cells.length - 1;
      // Remove cells if the current cell count exceeds the new drum length
      for (let i = cellCount; i > newDrumLength; i--) {
        row.removeChild(row.cells[i]);
      }
    });

    // Add new columns if the drum track length was increased
    rows.forEach((row) => {
      // Skip the first cell (label cell)
      const cellCount = row.cells.length - 1;
      // Add cells until we have the specified length
      for (let i = cellCount; i < newDrumLength; i++) {
        const cell = document.createElement("td");
        row.appendChild(cell);
      }
    });

    // Ensure header row is correct
    const thead = table.querySelector("thead");
    if (thead) {
      let headerRow = thead.querySelector("tr");
      if (!headerRow) {
        headerRow = document.createElement("tr");
        thead.appendChild(headerRow);
      }

      // Clear existing header cells
      headerRow.innerHTML = "";

      // Add Hit Type header
      const hitTypeHeader = document.createElement("th");
      hitTypeHeader.textContent = "Hit Type";
      headerRow.appendChild(hitTypeHeader);

      // Add beat numbers 1-newDrumLength
      for (let i = 1; i <= newDrumLength; i++) {
        const th = document.createElement("th");
        th.textContent = i.toString();
        headerRow.appendChild(th);
      }
    }

    // Clear previous 'hit' classes and innerHTML
    let hitCells = tbody.querySelectorAll("td.active-hit");
    hitCells.forEach((cell) => {
      cell.classList.remove("active-hit");
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
        cell.classList.add("active-hit");
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

    // Initialize header row
    const thead = table.querySelector("thead");
    if (thead) {
      let headerRow = thead.querySelector("tr");
      if (!headerRow) {
        headerRow = document.createElement("tr");
        thead.appendChild(headerRow);
      }

      // Clear existing header cells
      headerRow.innerHTML = "";

      // Add Note header
      const noteHeader = document.createElement("th");
      noteHeader.textContent = "Note";
      headerRow.appendChild(noteHeader);

      // Add beat numbers 1-32
      for (
        let i = 1;
        i <= document.getElementById(`${trackName}-length`).value;
        i++
      ) {
        const th = document.createElement("th");
        th.textContent = i.toString();
        headerRow.appendChild(th);
      }
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
      while (step < document.getElementById(`${trackName}-length`).value) {
        const pitchNotes = notes.filter(
          (note) => note.note === pitch && note.start === step
        );

        if (pitchNotes.length > 0) {
          const currentNote = pitchNotes[0];
          const duration = currentNote.end - currentNote.start;
          const effectiveDuration = Math.min(
            duration,
            document.getElementById(`${trackName}-length`).value - step
          );

          const cell = document.createElement("td");
          cell.colSpan = effectiveDuration;
          cell.textContent = "•";
          cell.classList.add("hit");

          // Check if the note's channel is the standard channel for the track
          const standardChannel = MIDI_CHANNELS[trackName];
          if (
            currentNote.channel !== undefined &&
            currentNote.channel !== standardChannel
          ) {
            cell.style.backgroundColor = "#0000FF"; // Blue for non-standard channel
          } else {
            cell.style.backgroundColor = "#FFFF00"; // Yellow for standard channel
          }

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
