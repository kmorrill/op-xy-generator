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

function handleClockTick() {
  clockTickCount++;

  if (clockTickCount % TICKS_PER_STEP === 0) {
    const currentStep = Math.floor(clockTickCount / TICKS_PER_STEP) % 32;
    console.log(`Processing step: ${currentStep + 1}`);
    playGeneratedNotes(currentStep + 1); // Now correctly represents a step

    if (clockTickCount >= TICKS_PER_STEP * 32) {
      // 6 * 32 = 192 ticks
      console.log("Resetting clock tick count");
      clockTickCount = 0;
    }
  }
}
