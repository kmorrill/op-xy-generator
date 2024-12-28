// Define parameter mappings for engines
const AXIS_PARAMETER_WEIGHTS = {
  param1: (brightness, patchType) => {
    // Tone
    return {
      distribution: "linear",
      min: 0,
      max: 127,
      bias: brightness, // 0 to 1
    };
  },
  param2: (patchType) => {
    // Ratio
    switch (patchType) {
      case "pad":
        return { fixed: 64 }; // Midpoint
      case "bass":
        return { fixed: 80 }; // Adding a fifth
      case "ear_candy":
        return { fixed: 64 }; // Avoiding fifths
      default:
        return { fixed: 64 }; // Default to midpoint
    }
  },
  param3: (patchType) => {
    // Shape
    switch (patchType) {
      case "pad":
        return { fixed: 80 }; // Slightly turned up
      case "bass":
        return { fixed: 70 }; // Between square and saw
      case "keys":
      case "ear_candy":
        return { fixed: 90 }; // Closer to square
      default:
        return { fixed: 64 }; // Default value
    }
  },
  param4: (movement, patchType) => {
    // Tremolo
    if (patchType === "ear_candy") {
      return { fixed: 127 }; // Turn up all the way
    }
    return {
      distribution: "linear",
      min: 0,
      max: 127,
      bias: movement, // 0 to 1
    };
  },
};

const DISSOLVE_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Swarm
    switch (patchType) {
      case "poly":
        return { fixed: 0 }; // No swarm
      case "lead":
        return { fixed: 80 }; // Warmed up noise
      case "pluck":
        return { fixed: 43 }; // About a third of the way
      default:
        return { fixed: 0 }; // Default to no swarm
    }
  },
  param2: (patchType) => {
    // AM
    switch (patchType) {
      case "respace":
        return { fixed: 64 }; // Near midpoint
      case "poly":
        return { fixed: 32 }; // Around a quarter
      case "lead":
        return { fixed: 64 }; // Near midpoint
      case "pluck":
        return { fixed: 85 }; // Up 2/3
      default:
        return { fixed: 64 }; // Default to midpoint
    }
  },
  param3: (patchType) => {
    // FM
    switch (patchType) {
      case "respace":
        return { fixed: 127 }; // Cranked all the way up
      case "poly":
      case "lead":
      case "pluck":
        return { fixed: 64 }; // Near midpoint
      default:
        return { fixed: 64 }; // Default to midpoint
    }
  },
  param4: (patchType) => {
    // Detune
    switch (patchType) {
      case "respace":
        return { fixed: 100 }; // Healthy dose
      case "poly":
        return { fixed: 32 }; // A touch
      case "lead":
      case "pluck":
        return { fixed: 32 }; // A little bit
      default:
        return { fixed: 32 }; // Default to a little bit
    }
  },
};

const EPiano_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Tone
    switch (patchType) {
      case "base":
        return { fixed: 64 }; // Midpoint
      case "bendy_piano":
        return { fixed: 80 }; // Slightly increased for brightness
      case "pluck":
        return { fixed: 80 }; // Boosted for saw-toothy pluck
      case "lead":
        return { fixed: 64 }; // Midpoint
      default:
        return { fixed: 64 }; // Default to midpoint
    }
  },
  param2: (patchType) => {
    // Texture
    switch (patchType) {
      case "base":
        return { fixed: 48 }; // Slightly less than Tone
      case "bendy_piano":
        return { fixed: 32 }; // Around a quarter up
      case "pluck":
        return { fixed: 48 }; // Midpoint
      case "lead":
        return { fixed: 64 }; // Midpoint
      default:
        return { fixed: 48 }; // Default to midpoint
    }
  },
  param3: (patchType) => {
    // Punch
    switch (patchType) {
      case "base":
        return { fixed: 42 }; // Around a third up
      case "bendy_piano":
        return { fixed: 42 }; // A little bit
      case "pluck":
        return { fixed: 42 }; // A little bit
      case "lead":
        return { fixed: 42 }; // A little bit
      default:
        return { fixed: 42 }; // Default to a third up
    }
  },
  param4: (patchType) => {
    // Tine
    switch (patchType) {
      case "base":
        return { fixed: 64 }; // Halfway
      case "pluck":
        return { fixed: 127 }; // All the way up for plucky vibes
      case "bendy_piano":
        return { fixed: 64 }; // Halfway
      case "lead":
        return { fixed: 64 }; // Halfway
      default:
        return { fixed: 64 }; // Default to halfway
    }
  },
};

const Hardsync_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Freq
    switch (patchType) {
      case "stab":
        return { fixed: 70 }; // Slightly increased frequency
      case "jab":
        return { fixed: 60 }; // Moderate frequency
      case "bass":
        return { fixed: 80 }; // Higher frequency for bass
      default:
        return { fixed: 64 }; // Default frequency
    }
  },
  param2: (patchType) => {
    // Sub
    switch (patchType) {
      case "bass":
        return { fixed: 80 }; // Fatter for bass
      case "stab":
        return { fixed: 50 }; // Moderate sub for stabs
      case "jab":
        return { fixed: 60 }; // Slightly higher sub for jabs
      default:
        return { fixed: 40 }; // Lower sub for other types
    }
  },
  param3: (patchType) => {
    // Noise
    switch (patchType) {
      case "stab":
        return { fixed: 60 }; // Adds noise for stabs
      case "jab":
        return { fixed: 50 }; // Moderate noise
      case "bass":
        return { fixed: 40 }; // Less noise for bass
      default:
        return { fixed: 40 }; // Default noise
    }
  },
  param4: (patchType) => {
    // Lowcut
    switch (patchType) {
      case "bass":
        return { fixed: 50 }; // Moderate high-pass for bass
      case "stab":
        return { fixed: 40 }; // Slightly lower high-pass
      case "jab":
        return { fixed: 45 }; // Moderate high-pass
      default:
        return { fixed: 50 }; // Default high-pass
    }
  },
};

const Organ_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Type
    switch (patchType) {
      case "bass":
        return { fixed: Math.floor(Math.random() * 8) }; // Random type between 0-7
      case "pad":
        return { fixed: Math.floor(Math.random() * 8) }; // Random type between 0-7
      case "lead":
        return { fixed: Math.floor(Math.random() * 8) }; // Random type between 0-7
      default:
        return { fixed: Math.floor(Math.random() * 8) }; // Default to random type
    }
  },
  param2: (patchType, brightness) => {
    // Bass
    if (patchType === "bass") {
      return { distribution: "linear", min: 0, max: 127, bias: 0.7 }; // More bass for bass patches
    } else {
      return { distribution: "linear", min: 0, max: 127, bias: 0.4 }; // Less bass for other patches
    }
  },
  param3: (patchType, movement) => {
    // Tremolo Amount
    if (patchType === "pad" || patchType === "lead") {
      return { distribution: "linear", min: 0, max: 127, bias: movement }; // Influenced by movement
    } else {
      return { fixed: 20 }; // Subtle tremolo for bass
    }
  },
  param4: (patchType, movement) => {
    // Tremolo Speed
    if (patchType === "pad" || patchType === "lead") {
      return { distribution: "linear", min: 0, max: 127, bias: movement }; // Influenced by movement
    } else {
      return { fixed: 40 }; // Moderate speed for bass
    }
  },
};

const Prism_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Shape
    // Assuming Shape ranges from 0-127 with higher values being more complex
    switch (patchType) {
      case "bass":
        return { fixed: 50 }; // Moderate shape for bass
      case "lead":
        return { fixed: 80 }; // More complex shape for leads
      case "pad":
        return { fixed: 60 }; // Slightly more complex for pads
      default:
        return { fixed: 50 }; // Default to moderate shape
    }
  },
  param2: (patchType, brightness) => {
    // Ratio
    switch (patchType) {
      case "bass":
        return { distribution: "linear", min: 0.5, max: 2, bias: brightness }; // Wider ratios for bass
      case "lead":
        return { distribution: "linear", min: 0.7, max: 1.5, bias: brightness }; // Balanced ratios for leads
      case "pad":
        return { distribution: "linear", min: 1, max: 3, bias: brightness }; // Harmonic ratios for pads
      default:
        return { distribution: "linear", min: 0.5, max: 2, bias: brightness }; // Default ratios
    }
  },
  param3: (patchType, brightness) => {
    // Detune
    if (patchType === "bass") {
      return { fixed: 20 }; // Minimal detune for bass
    } else if (patchType === "lead") {
      return { fixed: 40 }; // Moderate detune for leads
    } else if (patchType === "pad") {
      return { fixed: 60 }; // More detune for pads
    } else {
      return { fixed: 30 }; // Default detune
    }
  },
  param4: (patchType, spatialWidth) => {
    // Stereo
    return { distribution: "linear", min: 0, max: 127, bias: spatialWidth }; // Influenced by spatial width
  },
};

const Simple_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Shape
    switch (patchType) {
      case "lead":
      case "pluck":
        return { fixed: Math.floor(Math.random() * 127) }; // Random shape for leads and plucks
      case "pad":
        return { fixed: Math.floor(Math.random() * 127) }; // Random shape for pads
      default:
        return { fixed: 64 }; // Default to midpoint shape
    }
  },
  param2: (patchType, brightness) => {
    // Pw (Pulse Width)
    if (patchType === "pluck" || patchType === "lead") {
      return { distribution: "linear", min: 30, max: 90, bias: brightness }; // Influenced by brightness
    } else {
      return { distribution: "linear", min: 20, max: 80, bias: 0.5 }; // Moderate pulse width for pads
    }
  },
  param3: (patchType, character) => {
    // Noise
    if (patchType === "lead") {
      return { distribution: "linear", min: 40, max: 100, bias: character }; // More noise for leads
    } else if (patchType === "pluck") {
      return { distribution: "linear", min: 30, max: 80, bias: character }; // Moderate noise for plucks
    } else {
      return { distribution: "linear", min: 20, max: 70, bias: 0.3 }; // Less noise for pads
    }
  },
  param4: (patchType, spatialWidth) => {
    // Stereo
    return { distribution: "linear", min: 0, max: 127, bias: spatialWidth }; // Influenced by spatial width
  },
};

const Wavetable_PARAMETER_WEIGHTS = {
  param1: (patchType) => {
    // Table
    switch (patchType) {
      case "lead":
        return { fixed: Math.floor(Math.random() * 9) }; // Random table between 0-8 for leads
      case "pluck":
        return { fixed: Math.floor(Math.random() * 9) }; // Random table between 0-8 for plucks
      case "pad":
        return { fixed: Math.floor(Math.random() * 9) }; // Random table between 0-8 for pads
      default:
        return { fixed: Math.floor(Math.random() * 9) }; // Default to random table
    }
  },
  param2: (patchType, brightness) => {
    // Position
    return { distribution: "linear", min: 0, max: 127, bias: brightness }; // Influenced by brightness
  },
  param3: (patchType, movement) => {
    // Warp
    if (patchType === "lead" || patchType === "pluck") {
      return { distribution: "linear", min: 20, max: 100, bias: movement }; // More warp for active patches
    } else {
      return { distribution: "linear", min: 10, max: 80, bias: 0.4 }; // Moderate warp for pads
    }
  },
  param4: (patchType, movement) => {
    // Drift
    if (patchType === "lead") {
      return { distribution: "linear", min: 30, max: 110, bias: movement }; // More drift for leads
    } else if (patchType === "pluck") {
      return { distribution: "linear", min: 20, max: 90, bias: movement }; // Moderate drift for plucks
    } else {
      return { distribution: "linear", min: 10, max: 70, bias: 0.3 }; // Less drift for pads
    }
  },
};

// Helper function for weighted value generation
function generateWeightedValue(weightConfig) {
  if (weightConfig.fixed !== undefined) {
    return weightConfig.fixed;
  }

  const { distribution, min, max, bias } = weightConfig;

  switch (distribution) {
    case "linear":
      // Linearly bias the random value based on bias (0 to 1)
      return Math.floor(min + (max - min) * bias * Math.random());
    default:
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

const PARAMETER_DEFINITIONS = {
  trackVolume: { cc: 7, defaultValue: 99 },
  trackMute: { cc: 9, defaultValue: 0 },
  trackPan: { cc: 10, defaultValue: 64 },
  param1: { cc: 12, defaultValue: 50 },
  param2: { cc: 13, defaultValue: 50 },
  param3: { cc: 14, defaultValue: 50 },
  param4: { cc: 15, defaultValue: 50 },
  ampAttack: { cc: 20, defaultValue: 64 },
  ampDecay: { cc: 21, defaultValue: 64 },
  ampSustain: { cc: 22, defaultValue: 64 },
  ampRelease: { cc: 23, defaultValue: 64 },
  filterAttack: { cc: 24, defaultValue: 64 },
  filterDecay: { cc: 25, defaultValue: 64 },
  filterSustain: { cc: 26, defaultValue: 64 },
  filterRelease: { cc: 27, defaultValue: 64 },
  polyMonoLegator: { cc: 28, defaultValue: 64 },
  portamento: { cc: 29, defaultValue: 64 },
  pitchBendAmount: { cc: 30, defaultValue: 64 },
  engineVolume: { cc: 31, defaultValue: 99 },
  filterCutoff: { cc: 32, defaultValue: 64 },
  resonance: { cc: 33, defaultValue: 64 },
  envAmount: { cc: 34, defaultValue: 64 },
  keyTracking: { cc: 35, defaultValue: 64 },
  sendToFX1: { cc: 38, defaultValue: 0 },
  sendToFX2: { cc: 39, defaultValue: 0 },
};

const MIDI_CCS = Object.fromEntries(
  Object.entries(PARAMETER_DEFINITIONS).map(([key, value]) => [
    key.toUpperCase(),
    value.cc,
  ])
);

function generatePatch({
  patchType = "lead",
  brightness = 0.5,
  movement = 0.5,
  complexity = 0.5,
  character = 0.5,
  resonance = 0.5,
  spatialWidth = 0.5,
  engineSelection = "random",
}) {
  // ---------------------
  // 1) ENGINE CHOICE
  // ---------------------
  const engines = [
    "Axis",
    "Dissolve",
    "E-Piano",
    "HardSync",
    "Organ",
    "Prism",
    "Simple",
    "Wavetable",
  ];

  let engine;
  if (engineSelection === "random") {
    engine = engines[Math.floor(Math.random() * engines.length)];
  } else if (engines.includes(engineSelection)) {
    engine = engineSelection;
  } else {
    console.warn(
      `Unknown engine "${engineSelection}", falling back to random selection`
    );
    engine = engines[Math.floor(Math.random() * engines.length)];
  }

  // ---------------------
  // 2) CHANNEL, VOLUME, PAN
  // ---------------------
  let volume = 80 + Math.floor(Math.random() * 48);
  if (patchType === "bass") volume = Math.max(volume - 15, 0);
  const pan = Math.floor(spatialWidth * 127);

  const trackSelects = document.querySelectorAll('[id^="track"]');
  const selectedTrack = Array.from(trackSelects).find(
    (track) => track.value === engine
  );
  const trackNumber = selectedTrack
    ? parseInt(selectedTrack.id.replace("track", "")) - 1
    : 0;
  const channel_for_engine = trackNumber + 1;

  // ---------------------
  // 3) AMP ENVELOPE
  // ---------------------
  let ampAttack, ampDecay, ampSustain, ampRelease;
  switch (patchType) {
    case "pad":
      ampAttack = 20 + Math.floor(Math.random() * 40);
      ampDecay = 30 + Math.floor(Math.random() * 30);
      ampSustain = 80 + Math.floor(Math.random() * 20);
      ampRelease = 40 + Math.floor(Math.random() * 40);
      break;
    case "bass":
      ampAttack = Math.floor(Math.random() * 10);
      ampDecay = 20 + Math.floor(Math.random() * 20);
      ampSustain = 50 + Math.floor(Math.random() * 40);
      ampRelease = 10 + Math.floor(Math.random() * 20);
      break;
    case "pluck":
      ampAttack = Math.floor(Math.random() * 5);
      ampDecay = 10 + Math.floor(Math.random() * 20);
      ampSustain = 30 + Math.floor(Math.random() * 30);
      ampRelease = 10 + Math.floor(Math.random() * 30);
      break;
    case "fx":
      ampAttack = 5 + Math.floor(Math.random() * 30);
      ampDecay = 5 + Math.floor(Math.random() * 30);
      ampSustain = 10 + Math.floor(Math.random() * 30);
      ampRelease = 10 + Math.floor(Math.random() * 60);
      break;
    default: // "lead" or other
      ampAttack = Math.floor(Math.random() * 10);
      ampDecay = 20 + Math.floor(Math.random() * 20);
      ampSustain = 60 + Math.floor(Math.random() * 40);
      ampRelease = 20 + Math.floor(Math.random() * 30);
  }

  // ---------------------
  // 4) FILTER + FILTER ENVELOPE
  // ---------------------
  const filterCutoff = Math.floor(30 + brightness * 90);
  const filterResonance = Math.floor(resonance * 60);
  const envAmount = Math.floor(20 + complexity * 50);
  const keyTracking = Math.floor(64 + (brightness - 0.5) * 30);

  const filterAttack = Math.max(0, ampAttack - Math.floor(Math.random() * 10));
  const filterDecay = ampDecay + Math.floor(Math.random() * 10);
  const filterSustain = Math.max(
    0,
    ampSustain - Math.floor(Math.random() * 10)
  );
  const filterRelease = ampRelease + Math.floor(Math.random() * 20);

  // ---------------------
  // 5) ENGINE PARAMS (Weighted Approach)
  // ---------------------
  let engineParams = {};

  if (engine === "Axis") {
    const paramWeights = AXIS_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(
      paramWeights.param1(brightness, patchType)
    ); // Tone
    engineParams.param2 = generateWeightedValue(paramWeights.param2(patchType)); // Ratio
    engineParams.param3 = generateWeightedValue(paramWeights.param3(patchType)); // Shape
    engineParams.param4 = generateWeightedValue(
      paramWeights.param4(movement, patchType)
    ); // Tremolo
  } else if (engine === "Dissolve") {
    const paramWeights = DISSOLVE_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(paramWeights.param1(patchType)); // Swarm
    engineParams.param2 = generateWeightedValue(paramWeights.param2(patchType)); // AM
    engineParams.param3 = generateWeightedValue(paramWeights.param3(patchType)); // FM
    engineParams.param4 = generateWeightedValue(paramWeights.param4(patchType)); // Detune
  } else if (engine === "Epiano" || engine === "E-Piano") {
    const paramWeights = EPiano_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(paramWeights.param1(patchType)); // Tone
    engineParams.param2 = generateWeightedValue(paramWeights.param2(patchType)); // Texture
    engineParams.param3 = generateWeightedValue(paramWeights.param3(patchType)); // Punch
    engineParams.param4 = generateWeightedValue(paramWeights.param4(patchType)); // Tine
  } else if (engine === "Hardsync" || engine === "HardSync") {
    const paramWeights = Hardsync_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(paramWeights.param1(patchType)); // Freq
    engineParams.param2 = generateWeightedValue(paramWeights.param2(patchType)); // Sub
    engineParams.param3 = generateWeightedValue(paramWeights.param3(patchType)); // Noise
    engineParams.param4 = generateWeightedValue(paramWeights.param4(patchType)); // Lowcut
  } else if (engine === "Organ") {
    const paramWeights = Organ_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(paramWeights.param1(patchType)); // Type
    engineParams.param2 = generateWeightedValue(
      paramWeights.param2(patchType, brightness)
    ); // Bass
    engineParams.param3 = generateWeightedValue(
      paramWeights.param3(patchType, movement)
    ); // Tremolo Amount
    engineParams.param4 = generateWeightedValue(
      paramWeights.param4(patchType, movement)
    ); // Tremolo Speed
  } else if (engine === "Prism") {
    const paramWeights = Prism_PARAMETER_WEIGHTS;
    engineParams.param1 = generateWeightedValue(paramWeights.param1(patchType)); // Shape
    engineParams.param2 = generateWeightedValue(
      paramWeights.param2(patchType, brightness)
    ); // Ratio
    engineParams.param3 = generateWeightedValue(
      paramWeights.param3(patchType, brightness)
    ); // Detune
    engineParams.param4 = generateWeightedValue(
      paramWeights.param4(patchType, spatialWidth)
    ); // Stereo
  } else {
    // Placeholder for other engines
    console.warn(
      `Engine-specific parameter mapping for "${engine}" is not implemented yet.`
    );
    // Assign default or random values as needed
    engineParams.param1 = PARAMETER_DEFINITIONS.param1.defaultValue;
    engineParams.param2 = PARAMETER_DEFINITIONS.param2.defaultValue;
    engineParams.param3 = PARAMETER_DEFINITIONS.param3.defaultValue;
    engineParams.param4 = PARAMETER_DEFINITIONS.param4.defaultValue;
  }

  // ---------------------
  // 6) PATTERN
  // ---------------------
  const patternLength = 16;
  const patternRes = 16;
  const notes = [];
  let octaves;
  if (patchType === "bass") {
    octaves = ["2", "3", "4"];
  } else {
    octaves = ["2", "3", "4", "5", "6"];
  }
  const noteCount = complexity > 0.7 ? 4 : 2;

  for (let octaveIndex = 0; octaveIndex < octaves.length; octaveIndex++) {
    for (let i = 0; i < noteCount; i++) {
      const pitches = [
        `C${octaves[octaveIndex]}`,
        `D${octaves[octaveIndex]}`,
        `E${octaves[octaveIndex]}`,
        `G${octaves[octaveIndex]}`,
        `B${octaves[octaveIndex]}`,
        `C${parseInt(octaves[octaveIndex], 10) + 1}`,
        `D${parseInt(octaves[octaveIndex], 10) + 1}`,
        `E${parseInt(octaves[octaveIndex], 10) + 1}`,
        `G${parseInt(octaves[octaveIndex], 10) + 1}`,
        `A${parseInt(octaves[octaveIndex], 10) + 1}`,
        `B${parseInt(octaves[octaveIndex], 10) + 1}`,
        `C${parseInt(octaves[octaveIndex], 10) + 2}`,
      ];
      const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];

      let duration;
      switch (patchType) {
        case "pad":
          duration = 2 + Math.random() * 2;
          break;
        case "pluck":
          duration = 0.25 + Math.random() * 0.25;
          break;
        case "bass":
          duration = 0.5 + Math.random() * 0.5;
          break;
        default:
          duration = 0.5 + Math.random();
      }

      const startBeat = Math.floor(Math.random() * 4) + octaveIndex * 4;
      // const trackSelects = document.querySelectorAll('[id^="track"]');

      // const selectedTrack = Array.from(trackSelects).find(
      //   (track) => track.value === engine
      // );
      // const trackNumber = selectedTrack
      //   ? parseInt(selectedTrack.id.replace("track", "")) - 1
      //   : 0;
      // const channel_for_engine = trackNumber + 1;
      notes.push({
        pitch: randomPitch,
        start: startBeat,
        duration,
        channel: channel_for_engine,
      });
    }
  }

  // ---------------------
  // 7) AUTOMATION
  // ---------------------
  const automations = [];
  {
    const possibleTargets = [
      "trackVolume",
      "trackMute",
      "trackPan",
      "param1",
      "param2",
      "param3",
      "param4",
      "ampAttack",
      "ampDecay",
      "ampSustain",
      "ampRelease",
      "filterAttack",
      "filterDecay",
      "filterSustain",
      "filterRelease",
      "filterCutoff",
      "resonance",
      "envAmount",
      "keyTracking",
      "sendToFX1",
      "sendToFX2",
      "polyMonoLegator",
      "portamento",
      "pitchBendAmount",
      "engineVolume",
    ];

    const weightedTargets = [];

    function addWeighted(target, weight) {
      for (let i = 0; i < weight; i++) {
        weightedTargets.push(target);
      }
    }

    possibleTargets.forEach((target) => {
      let weight = 1;

      if (
        movement > 0.6 &&
        [
          "filterCutoff",
          "resonance",
          "trackPan",
          "param1",
          "param2",
          "param3",
          "param4",
        ].includes(target)
      ) {
        weight += 3;
      }

      if (
        patchType === "fx" &&
        (target === "sendToFX1" || target === "sendToFX2")
      ) {
        weight += 3;
      }

      if (
        brightness > 0.6 &&
        (target === "filterCutoff" || target === "envAmount")
      ) {
        weight += 2;
      }

      if (
        patchType === "bass" &&
        (target === "trackVolume" || target === "param4")
      ) {
        weight += 2;
      }

      addWeighted(target, weight);
    });

    const numAutomations = Math.floor(Math.random() * 3) + 2;
    const chosenTargets = new Set();

    for (let i = 0; i < numAutomations; i++) {
      let chosenTarget;
      do {
        chosenTarget =
          weightedTargets[Math.floor(Math.random() * weightedTargets.length)];
      } while (
        chosenTargets.has(chosenTarget) &&
        weightedTargets.length > chosenTargets.size
      );

      if (chosenTargets.has(chosenTarget)) {
        break;
      }

      chosenTargets.add(chosenTarget);

      const spread = Math.floor(20 + movement * 64);
      const startVal = Math.floor(Math.random() * (128 - spread));
      const endVal = Math.min(startVal + spread, 127);

      const baseDuration = Math.floor(4 + movement * 8);
      const duration = baseDuration + Math.floor(Math.random() * 4) - 2;
      const startBeat = Math.floor(Math.random() * 4);

      automations.push({
        target: chosenTarget,
        startValue: startVal,
        endValue: endVal,
        startBeat,
        duration,
      });
    }
  }

  // ---------------------
  // 8) FX GENERATION
  // ---------------------
  const fxOptions = [
    {
      type: "Chorus",
      recommendedFor: ["pad", "lead", "fx"],
      synergy: {
        movement: 0.4,
        spatialWidth: 0.3,
      },
      paramAssignment: (vars) => {
        const { movement, spatialWidth, brightness, complexity } = vars;
        return {
          Rate: Math.floor(20 + movement * 80),
          Depth: Math.floor(30 + movement * 50),
          Feedback: Math.floor(10 + complexity * 60),
          Stereo: Math.floor(spatialWidth * 127),
          recommendedWet: Math.floor(40 + brightness * 30 + movement * 30),
        };
      },
    },
    {
      type: "Delay",
      recommendedFor: ["lead", "fx", "pad"],
      synergy: {
        movement: 0.3,
        complexity: 0.3,
      },
      paramAssignment: (vars) => {
        const { brightness, movement, complexity } = vars;
        let size = Math.floor(Math.random() * 6);
        if (movement > 0.6 || complexity > 0.6) {
          size = Math.floor(Math.random() * 6);
        }
        let dry = Math.floor(50 + (brightness - 0.5) * 20);
        dry = Math.max(
          0,
          Math.min(127, dry + Math.floor(Math.random() * 20 - 10))
        );
        return {
          Size: size,
          Fine: Math.floor(Math.random() * 50),
          Amount: Math.floor(20 + movement * 80),
          Dry: dry,
        };
      },
    },
    {
      type: "Distortion",
      recommendedFor: ["bass", "fx", "lead"],
      synergy: {
        character: 0.5,
      },
      paramAssignment: (vars) => {
        const { character, brightness } = vars;
        return {
          Drive: Math.floor(20 + character * 100),
          Clip: Math.floor(character * 80 + Math.random() * 20),
          "Low Cut": Math.floor((1 - brightness) * 50 + character * 20),
          "High Cut": Math.floor(brightness * 70),
          recommendedWet: Math.floor(60 + character * 40 - brightness * 30),
        };
      },
    },
    {
      type: "Reverb",
      recommendedFor: ["pad", "lead", "fx"],
      synergy: {
        brightness: 0.4,
        movement: 0.3,
      },
      paramAssignment: (vars) => {
        const { brightness, movement, patchType } = vars;
        let baseSize = patchType === "pad" ? 80 : 40;
        let dry = Math.floor(50 + (brightness - 0.5) * 20 + Math.random() * 20);
        dry = Math.max(0, Math.min(127, dry));
        return {
          Size: Math.floor(baseSize + movement * 40),
          Modulation: Math.floor(movement * 80),
          Tone: Math.floor(30 + brightness * 70),
          Dry: dry,
        };
      },
    },
  ];

  // Weight and select FX
  const weightedFx = [];
  fxOptions.forEach((fxDef) => {
    let weight = 1;
    if (fxDef.recommendedFor.includes(patchType)) {
      weight += 3;
    }
    const paramMap = {
      brightness,
      movement,
      complexity,
      character,
      resonance,
      spatialWidth,
      patchType,
    };
    for (const [key, minVal] of Object.entries(fxDef.synergy)) {
      const val = paramMap[key] || 0;
      if (val >= minVal) {
        weight += 2;
      }
    }
    for (let i = 0; i < weight; i++) {
      weightedFx.push(fxDef);
    }
  });

  const fxCount = complexity > 0.6 ? 2 : 1;
  const chosenFx = [];
  while (chosenFx.length < fxCount && weightedFx.length > 0) {
    const idx = Math.floor(Math.random() * weightedFx.length);
    const pick = weightedFx[idx];
    chosenFx.push(pick);
    const chosenType = pick.type;
    for (let i = weightedFx.length - 1; i >= 0; i--) {
      if (weightedFx[i].type === chosenType) weightedFx.splice(i, 1);
    }
  }

  const fx = chosenFx.map((fxDef) => {
    const fxParams = fxDef.paramAssignment({
      patchType,
      brightness,
      movement,
      complexity,
      character,
      resonance,
      spatialWidth,
    });
    return {
      type: fxDef.type,
      ...fxParams,
    };
  });

  // ---------------------
  // 9) UPDATE THE "ABOUT THIS PATCH" SECTION
  // ---------------------
  const patchDetails = document.getElementById("patch-details-list");
  patchDetails.innerHTML = "";

  const engineDetail = document.createElement("li");
  engineDetail.textContent = `Engine: ${engine}`;
  patchDetails.appendChild(engineDetail);

  const channelDetail = document.createElement("li");
  channelDetail.textContent = `Channel: ${channel_for_engine}`;
  patchDetails.appendChild(channelDetail);

  const fxDetails = chosenFx.map((fx, index) => {
    const detail = document.createElement("li");
    detail.textContent = `FX${index + 1}: ${fx.type}`;
    return detail;
  });
  fxDetails.forEach((detail) => patchDetails.appendChild(detail));

  if (automations.length > 0) {
    automations.forEach((automation, index) => {
      const automationDetail = document.createElement("li");
      automationDetail.textContent = `Automation ${index + 1}: ${
        automation.target
      }`;
      patchDetails.appendChild(automationDetail);
    });
  }

  // Add engine-specific parameters to the patch details
  if (engineParams && Object.keys(engineParams).length > 0) {
    const engineParamsList = document.createElement("ul");
    for (const [param, value] of Object.entries(engineParams)) {
      let paramName = `param${param.slice(-1)}`;
      // Map param1-param4 to meaningful names for display based on engine
      if (engine === "Axis") {
        switch (param) {
          case "param1":
            paramName = "Tone";
            break;
          case "param2":
            paramName = "Ratio";
            break;
          case "param3":
            paramName = "Shape";
            break;
          case "param4":
            paramName = "Tremolo";
            break;
        }
      } else if (engine === "Dissolve") {
        switch (param) {
          case "param1":
            paramName = "Swarm";
            break;
          case "param2":
            paramName = "AM";
            break;
          case "param3":
            paramName = "FM";
            break;
          case "param4":
            paramName = "Detune";
            break;
        }
      } else if (engine === "Epiano" || engine === "E-Piano") {
        switch (param) {
          case "param1":
            paramName = "Tone";
            break;
          case "param2":
            paramName = "Texture";
            break;
          case "param3":
            paramName = "Punch";
            break;
          case "param4":
            paramName = "Tine";
            break;
        }
      } else if (engine === "Hardsync" || engine === "HardSync") {
        switch (param) {
          case "param1":
            paramName = "Freq";
            break;
          case "param2":
            paramName = "Sub";
            break;
          case "param3":
            paramName = "Noise";
            break;
          case "param4":
            paramName = "Lowcut";
            break;
        }
      } else if (engine === "Organ") {
        switch (param) {
          case "param1":
            paramName = "Type";
            break;
          case "param2":
            paramName = "Bass";
            break;
          case "param3":
            paramName = "Tremolo Amount";
            break;
          case "param4":
            paramName = "Tremolo Speed";
            break;
        }
      } else if (engine === "Prism") {
        switch (param) {
          case "param1":
            paramName = "Shape";
            break;
          case "param2":
            paramName = "Ratio";
            break;
          case "param3":
            paramName = "Detune";
            break;
          case "param4":
            paramName = "Stereo";
            break;
        }
      } else if (engine === "Simple") {
        switch (param) {
          case "param1":
            paramName = "Shape";
            break;
          case "param2":
            paramName = "Pw";
            break;
          case "param3":
            paramName = "Noise";
            break;
          case "param4":
            paramName = "Stereo";
            break;
        }
      } else if (engine === "Wavetable") {
        switch (param) {
          case "param1":
            paramName = "Table";
            break;
          case "param2":
            paramName = "Position";
            break;
          case "param3":
            paramName = "Warp";
            break;
          case "param4":
            paramName = "Drift";
            break;
        }
      }

      const paramDetail = document.createElement("li");
      paramDetail.textContent = `${paramName}: ${value}`;
      engineParamsList.appendChild(paramDetail);
    }
    patchDetails.appendChild(engineParamsList);
  }

  // ---------------------
  // 10) RETURN COMPLETE PATCH
  // ---------------------
  const patch = {
    engine,
    channel: channel_for_engine,
    volume,
    pan,
    ampEnv: {
      attack: ampAttack,
      decay: ampDecay,
      sustain: ampSustain,
      release: ampRelease,
    },
    filter: {
      cutoff: filterCutoff,
      resonance: filterResonance,
      envAmount,
      keyTracking,
      envelope: {
        attack: filterAttack,
        decay: filterDecay,
        sustain: filterSustain,
        release: filterRelease,
      },
    },
    param1: engineParams.param1,
    param2: engineParams.param2,
    param3: engineParams.param3,
    param4: engineParams.param4,
    pattern: {
      length: patternLength,
      resolution: patternRes,
      notes,
    },
    automations,
    fx,
    engineParams,
  };

  return patch;
}
