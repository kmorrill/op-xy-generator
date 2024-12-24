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

function renderTrackVisualization(trackName) {
  console.log(`Rendering visualization for track: ${trackName}`);

  // DRUM logic (unchanged)
  if (trackName === "drums") {
    // existing drum logic with category-based rows...
    // ...
    return;
  }

  // For bass, chords, or melody, do the row-per-pitch approach
  else if (
    trackName === "bass" ||
    trackName === "chords" ||
    trackName === "melody"
  ) {
    // Map track name to selector
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

    // 1) Gather unique pitches
    const uniquePitches = [...new Set(notes.map((note) => note.note))];
    // 2) Sort them from low to high
    uniquePitches.sort((a, b) => a - b);

    // 3) Create rows for each pitch
    uniquePitches.forEach((pitch) => {
      const row = document.createElement("tr");

      // Convert pitch to "C#4", etc.
      const noteLabel = midiNoteToName(pitch);

      // First cell: pitch label
      const labelCell = document.createElement("td");
      labelCell.textContent = noteLabel;
      row.appendChild(labelCell);

      // Columns for steps 1..32
      for (let step = 1; step <= 32; step++) {
        const cell = document.createElement("td");
        cell.style.border = "1px solid black";

        // The note is "active" if step in [note.start, note.end)
        const isActive = notes.some(
          (note) => note.note === pitch && step >= note.start && step < note.end
        );

        if (isActive) {
          cell.classList.add("hit");
          cell.textContent = "•";
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });
  }
  // Fallback for unsupported trackName
  else {
    console.error(`No visualization handler for track: ${trackName}`);
  }
}

// Render all tracks
function renderAllVisualizations() {
  renderTrackVisualization("drums");
  renderTrackVisualization("bass");
  renderTrackVisualization("chords");
  renderTrackVisualization("melody");
  // Add more if you have them (e.g. "callResponse")
}
