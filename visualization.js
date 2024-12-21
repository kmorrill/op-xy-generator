// visualization.js

// Existing function to render track visualizations
function renderTrackVisualization(trackName) {
  console.log(`Rendering visualization for track: ${trackName}`);

  let table;

  // Select the appropriate table based on the track name
  if (trackName === "drums") {
    table = document.querySelector(`#drum-patterns .sequence-table`);
  } else if (trackName === "bass") {
    table = document.querySelector(`#basslines .sequence-table`); // Corrected the selector to match the HTML structure
  } else {
    console.error(`No visualization handler for track: ${trackName}`);
    return;
  }

  if (!table) {
    console.error(`Table for ${trackName} not found.`);
    return;
  }

  const tbody = table.querySelector("tbody");
  tbody.innerHTML = ""; // Clear existing visualization

  const notes = generationState.tracks[trackName];
  if (!notes || notes.length === 0) {
    console.warn(`No notes to visualize for track: ${trackName}`);
    return;
  }

  if (trackName === "drums") {
    // Existing drums rendering logic
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
            category.notes.includes(note.note) &&
            i >= note.start &&
            i < note.end
        );

        if (matchingNotes.length > 0) {
          cell.classList.add("hit");
          cell.textContent = "•";
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });
  } else if (trackName === "bass") {
    // New bass rendering logic to include all notes in the scale as rows
    const scaleNotes = generationState.tracks.bass.map((note) => note.note); // Assuming note objects have a 'note' property
    const uniqueScaleNotes = [...new Set(scaleNotes)]; // Get unique notes in the scale

    uniqueScaleNotes.forEach((scaleNote) => {
      const row = document.createElement("tr");
      const labelCell = document.createElement("td");
      labelCell.textContent = scaleNote; // Use the note number as the label
      row.appendChild(labelCell);

      for (let i = 1; i <= 32; i++) {
        const cell = document.createElement("td");
        cell.style.border = "1px solid black";

        // Check if any note of this scale note starts at this step
        const activeNotes = notes.filter(
          (note) => note.note === scaleNote && note.start === i
        );
        if (activeNotes.length > 0) {
          cell.classList.add("hit");
          cell.textContent = "•";
        }

        row.appendChild(cell);
      }

      tbody.appendChild(row);
    });
  }
}

// Optionally, modify renderAllVisualizations to include bass
function renderAllVisualizations() {
  renderTrackVisualization("drums");
  renderTrackVisualization("bass"); // Add this line to render bass visualization
}
