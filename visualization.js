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
