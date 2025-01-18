let clockRunning = false;
let clockTickCount = 0;
const TICKS_PER_QUARTER = 24;
const STEPS_PER_BEAT = 4;
const TICKS_PER_STEP = TICKS_PER_QUARTER / STEPS_PER_BEAT; // 6

const TICKS_PER_BAR = TICKS_PER_QUARTER * 4; // 96 ticks per bar

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

// Add this helper function to calculate LCM
function getLCM(arr) {
  const gcd = (a, b) => (!b ? a : gcd(b, a % b));
  const lcm = (a, b) => (a * b) / gcd(a, b);
  return arr.reduce((a, b) => lcm(a, b));
}

function handleClockTick() {
  clockTickCount++;

  if (clockTickCount % TICKS_PER_STEP === 0) {
    // Get all track length selects
    const drumLength = parseInt(document.getElementById("drum-length").value);
    const bassLength = parseInt(document.getElementById("bass-length").value);
    const chordsLength = parseInt(
      document.getElementById("chords-length").value
    );
    const melodyLength = parseInt(
      document.getElementById("melody-length").value
    );

    // Calculate total pattern length as LCM of all track lengths
    const patternLength = getLCM([
      drumLength,
      bassLength,
      chordsLength,
      melodyLength,
    ]);

    const currentStep =
      Math.floor(clockTickCount / TICKS_PER_STEP) % patternLength;

    // Update UI to show current step
    updateStepHighlight(currentStep + 1);

    playGeneratedNotes(currentStep + 1); // Now correctly represents a step

    if (clockTickCount >= TICKS_PER_STEP * patternLength) {
      console.log("Resetting clock tick count");
      clockTickCount = 0;
    }
  }
}

// Add this function to update the UI
function updateStepHighlight(step) {
  // Remove highlight from all beat headers
  document.querySelectorAll(".sequence-table th").forEach((header) => {
    header.classList.remove("current-beat");
  });

  // Add highlight to current beat headers
  document.querySelectorAll(".sequence-table").forEach((table) => {
    const headers = table.querySelectorAll("th");
    const trackLength = parseInt(
      table.closest(".track-section").querySelector('select[id$="-length"]')
        .value
    );
    const normalizedStep = ((step - 1) % trackLength) + 1;

    // The first header is for the label column, so we need to offset by 1
    if (headers[normalizedStep]) {
      headers[normalizedStep].classList.add("current-beat");
    }
  });
}
