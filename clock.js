let clockRunning = false;
let clockTickCount = 0;
const TICKS_PER_QUARTER = 24;
const TICKS_PER_BAR = TICKS_PER_QUARTER * 4;

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

function handleClockTick() {
  clockTickCount++;
  // console.log(`Clock tick: ${clockTickCount}`);

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
