const PARAMETER_DEFINITIONS = {
  trackVolume: { cc: 7, defaultValue: 99 },
  trackMute: { cc: 9, defaultValue: 0 }, // TODO less useful, and if we use it we need to flip between 0/1
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
  polyMonoLegator: { cc: 28, defaultValue: 64 }, // TODO need to clarify the zones you're settin; gpoly 0-42; mono 43-83; legator 84-
  portamento: { cc: 29, defaultValue: 64 },
  pitchBendAmount: { cc: 30, defaultValue: 64 },
  engineVolume: { cc: 31, defaultValue: 99 },
  filterCutoff: { cc: 32, defaultValue: 64 },
  resonance: { cc: 33, defaultValue: 64 },
  envAmount: { cc: 34, defaultValue: 64 },
  keyTracking: { cc: 35, defaultValue: 64 },
  // sendToExt: { cc: 36, defaultValue: 0 },
  // sendToTape: { cc: 37, defaultValue: 0 },
  sendToFX1: { cc: 38, defaultValue: 0 },
  sendToFX2: { cc: 39, defaultValue: 0 },
  // lfoShape: { cc: 40, defaultValue: 0 }, // not working right now since we can't control source or amount
  // lfoOnsetDest: { cc: 41, defaultValue: 0 },
};

const MIDI_CCS = Object.fromEntries(
  Object.entries(PARAMETER_DEFINITIONS).map(([key, value]) => [
    key.toUpperCase(),
    value.cc,
  ])
);

// Add this after your PARAMETER_DEFINITIONS and before the EventEmitter class

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

  // Constrain the selected engine when random to one of the selects for synth to track mapps in @patch_generator.html
  if (
    engine === "Axis" ||
    engine === "Dissolve" ||
    engine === "E-Piano" ||
    engine === "HardSync" ||
    engine === "Organ" ||
    engine === "Prism" ||
    engine === "Simple" ||
    engine === "Wavetable"
  ) {
    engine = engine;
  } else {
    console.warn(
      `Invalid engine "${engine}", falling back to random selection`
    );
    engine = engines[Math.floor(Math.random() * engines.length)];
  }

  // ---------------------
  // 2) CHANNEL, VOLUME, PAN
  // ---------------------
  let volume = 80 + Math.floor(Math.random() * 48);
  if (patchType === "bass") volume = Math.max(volume - 15, 0);
  const pan = Math.floor(spatialWidth * 127);

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
  // 5) ENGINE PARAMS
  // ---------------------
  // param1: "Grit/Texture"
  const param1 = Math.floor(
    character * 70 +
      complexity * 30 +
      (patchType === "fx" ? 20 : 0) +
      Math.random() * 15
  );

  // param2: "Harmonic Brightness"
  const param2 = Math.floor(
    brightness * 80 +
      complexity * 20 +
      (patchType === "lead" ? 15 : 0) +
      Math.random() * 10
  );

  // param3: "Movement/Mod Factor"
  const param3 = Math.floor(
    movement * 70 +
      resonance * 40 +
      (movement > 0.7 && spatialWidth > 0.5 ? 20 : 0) +
      Math.random() * 10
  );

  // param4: "Stereo/Space"
  const param4 = Math.floor(
    spatialWidth * 80 +
      brightness * 20 +
      (patchType === "pad" ? 15 : 0) +
      Math.random() * 15
  );

  // ---------------------
  // 6) PATTERN
  // ---------------------
  const patternLength = 16; // 4 bars per octave, 4 octaves
  const patternRes = 16;
  const notes = [];
  let octaves;
  if (patchType === "bass") {
    octaves = ["2", "3", "4"]; // Lower octaves for bass
  } else {
    octaves = ["2", "3", "4", "5", "6"]; // Full spectrum for other types
  }
  const noteCount = complexity > 0.7 ? 4 : 2; // Notes per octave

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

      // Adjust note duration based on patch type
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

      const startBeat = Math.floor(Math.random() * 4) + octaveIndex * 4; // Adjust start beat for each octave
      const trackSelects = document.querySelectorAll('[id^="track"]');

      const selectedTrack = Array.from(trackSelects).find(
        (track) => track.value === engine
      );
      const trackNumber = parseInt(selectedTrack.id.replace("track", "")) - 1; // subtract 1 to fix base 0
      channel_for_engine = trackNumber + 1; // save the channel number
      notes.push({
        pitch: randomPitch,
        start: startBeat,
        duration,
        channel: channel_for_engine,
      });
    }
  }

  // ---------------------
  // 8) AUTOMATION
  // ---------------------
  const automations = [];
  {
    // All possible targets we can automate
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

    // We'll build a weighted list based on the patch generation parameters,
    // so we pick a parameter that best fits the current patch "vibe".
    // For example:
    // - If movement is high, we might emphasize parameters that produce big sweeps (filterCutoff, resonance, etc.).
    // - If patchType is "fx", maybe we favor sendToTape/sendToFX.
    const weightedTargets = [];

    function addWeighted(target, weight) {
      for (let i = 0; i < weight; i++) {
        weightedTargets.push(target);
      }
    }

    // Go through each possible target, assign some base weight, then boost
    // if it makes sense given patch params.
    possibleTargets.forEach((target) => {
      let weight = 1; // base

      // Example synergy: high movement => more likely to automate filter or resonance
      if (
        movement > 0.6 &&
        [
          "filterCutoff",
          "resonance",
          "trackPan",
          "param1",
          "param2",
          "param3",
          "pram4",
        ].includes(target)
      ) {
        weight += 3;
      }

      // If patchType is "fx", maybe prioritize sends or "trackPan"
      if (
        patchType === "fx" &&
        (target === "sendToFX1" || target === "sendToFX2")
      ) {
        weight += 3;
      }

      // If brightness is high, automating filterCutoff or envAmount might be nice
      if (
        brightness > 0.6 &&
        (target === "filterCutoff" || target === "envAmount")
      ) {
        weight += 2;
      }

      // If patchType is "bass", maybe prefer automating "trackVolume" or "synth_param4" (just as an example)
      if (
        patchType === "bass" &&
        (target === "trackVolume" || target === "synth_param4")
      ) {
        weight += 2;
      }

      // etc. (You can add more rules for complexity, character, etc.)

      addWeighted(target, weight);
    });

    // If for some reason all weighting ended up minimal, just ensure we have at least some
    // fallback (we already set a base weight=1, so it should be fine).

    // Randomly choose between 2-4 automations
    const numAutomations = Math.floor(Math.random() * 3) + 2; // Random number between 2-4

    // Keep track of chosen targets to avoid duplicates
    const chosenTargets = new Set();

    // Create multiple automations
    for (let i = 0; i < numAutomations; i++) {
      // Keep trying until we find an unused target
      let chosenTarget;
      do {
        chosenTarget =
          weightedTargets[Math.floor(Math.random() * weightedTargets.length)];
      } while (chosenTargets.has(chosenTarget));

      chosenTargets.add(chosenTarget);

      // We'll choose startValue and endValue using movement to shape the range:
      // higher movement => more dramatic changes
      const spread = Math.floor(20 + movement * 64); // e.g. up to about 84 if movement=1
      const startVal = Math.floor(Math.random() * (128 - spread));
      const endVal = startVal + spread;

      // Duration in beats: from 4..(12 or so) if movement is big
      // Vary the duration slightly for each automation to create more interesting patterns
      const baseDuration = Math.floor(4 + movement * 8);
      const duration = baseDuration + Math.floor(Math.random() * 4) - 2; // +/- 2 beats

      // Vary the start beat for each automation
      const startBeat = Math.floor(Math.random() * 4); // Start within first 4 beats

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
  // 9) FX GENERATION
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
    {
      type: "Lofi",
      recommendedFor: ["bass", "fx", "lead"],
      synergy: {
        character: 0.5,
      },
      paramAssignment: (vars) => {
        const { character, brightness } = vars;
        return {
          Rate: Math.floor(20 + character * 100),
          Bits: Math.floor(character * 80 + Math.random() * 20),
          Quality: Math.floor((1 - brightness) * 50 + character * 20),
          Drift: Math.floor(brightness * 70),
          recommendedWet: Math.floor(60 + character * 40 - brightness * 30),
        };
      },
    },
    {
      type: "Phaser",
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
          Frequency: Math.floor(baseSize + movement * 40),
          Depth: Math.floor(movement * 80),
          Rate: Math.floor(30 + brightness * 70),
          Feedback: Math.floor(dry),
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

  // Update the "About this patch" section in the HTML
  const patchDetails = document.getElementById("patch-details-list");
  patchDetails.innerHTML = "";
  const engineDetail = document.createElement("li");
  engineDetail.textContent = `Engine: ${engine}`;
  patchDetails.appendChild(engineDetail);

  const channelDetail = document.createElement("li");
  const trackSelects = document.querySelectorAll('[id^="track"]');
  const selectedTrack = Array.from(trackSelects).find(
    (track) => track.value === engine
  );
  const trackNumber = parseInt(selectedTrack.id.replace("track", "")) - 1; // subtract 1 to fix base 0
  const assignedChannel = trackNumber + 1; // save the channel number
  channelDetail.textContent = `Channel: ${assignedChannel}`;
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

  // ---------------------
  // 10) RETURN COMPLETE PATCH
  // ---------------------
  return {
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
    param1,
    param2,
    param3,
    param4,
    pattern: {
      length: patternLength,
      resolution: patternRes,
      notes,
    },
    automations,
    fx,
  };
}
