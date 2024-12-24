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

  // For bass, chords, or melody, do the row-per-pitch approach with duration handling
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

      // Get all notes for this pitch, sorted by start
      const pitchNotes = notes
        .filter((note) => note.note === pitch)
        .sort((a, b) => a.start - b.start);

      let step = 1; // Initialize step counter
      let noteIndex = 0; // Initialize note index

      while (step <= 32) {
        if (
          noteIndex < pitchNotes.length &&
          pitchNotes[noteIndex].start === step
        ) {
          const currentNote = pitchNotes[noteIndex];
          const duration = currentNote.end - currentNote.start;

          // Ensure duration doesn't exceed table bounds
          const effectiveDuration = Math.min(duration, 32 - step + 1);

          // Create a cell with colspan equal to duration
          const cell = document.createElement("td");
          cell.style.border = "1px solid black";
          cell.style.backgroundColor = "#FFD700"; // Optional: Highlight the cell
          cell.textContent = "•";
          cell.colSpan = effectiveDuration;

          // Add the 'hit' class for styling
          cell.classList.add("hit");

          row.appendChild(cell);

          // Move the step counter forward by the duration
          step += effectiveDuration;

          // Move to the next note
          noteIndex++;
        } else {
          // No note starting at this step, create an empty cell
          const cell = document.createElement("td");
          cell.style.border = "1px solid black";
          row.appendChild(cell);
          step++;
        }
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

// Ensure renderAllVisualizations is called after generating tracks
// For example, in your main.js or wherever you handle track generation,
// call renderAllVisualizations() after updating generationState.tracks

// Example:
// function regenerateTracks() {
//   // ... your existing track generation logic ...
//   generationState.tracks.melody = generateMelody(generationState);
//   generationState.tracks.bass = regenerateBassLine();
//   generationState.tracks.chords = generateChords(generationState);
//   // ... other tracks ...
//   renderAllVisualizations(); // Ensure this is called here
// }
