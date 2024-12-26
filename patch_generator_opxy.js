class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => callback(data));
    }
    return this;
  }
}

class Automation {
  constructor({
    target,
    startValue,
    endValue,
    startBeat = 0,
    duration = 4,
    repeat = false,
  }) {
    this.target = target; // Reference to parameter
    this.startValue = startValue;
    this.endValue = endValue;
    this.startBeat = startBeat; // When automation begins
    this.duration = duration; // Length in beats
    this.repeat = repeat; // Whether to loop
    this.currentBeat = 0;
  }

  getValue(beat) {
    if (!this.repeat && beat > this.startBeat + this.duration) {
      return this.endValue;
    }

    // Handle repeating automations
    const normalizedBeat = this.repeat
      ? (beat - this.startBeat) % this.duration
      : beat - this.startBeat;

    if (normalizedBeat < 0) return this.startValue;
    if (normalizedBeat > this.duration) return this.endValue;

    const progress = normalizedBeat / this.duration;
    return this.startValue + (this.endValue - this.startValue) * progress;
  }
}

class Note {
  constructor({
    pitch,
    velocity = 100,
    start = 0,
    duration = 0.25,
    channel = 1,
  }) {
    this.pitch = pitch;
    this.velocity = velocity;
    this.start = start;
    this.duration = duration;
    this.channel = channel;
  }

  getMIDINoteNumber() {
    const notes = [
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
    const match = this.pitch.match(/([A-G]#?)(\d+)/);
    if (!match) {
      throw new Error(`Invalid pitch format: ${this.pitch}`);
    }

    const [, note, octave] = match;
    return notes.indexOf(note) + (parseInt(octave) + 1) * 12;
  }

  clone(overrides = {}) {
    return new Note({
      pitch: this.pitch,
      velocity: this.velocity,
      start: this.start,
      duration: this.duration,
      channel: this.channel,
      ...overrides,
    });
  }
}

class Track extends EventEmitter {
  constructor({ name, channel, type = "instrument" }) {
    super();
    this.name = name;
    this.channel = channel;
    this.type = type;
    this.patterns = [];
    this.currentPattern = null;
    this.automations = new Map();
    this.parameters = Object.fromEntries(
      Object.entries(PARAMETER_DEFINITIONS).map(([key, { defaultValue }]) => [
        key,
        defaultValue,
      ])
    );
  }

  setParameter(parameterName, value) {
    if (!parameterName) {
      console.warn("Attempted to set parameter with undefined name");
      return;
    }

    // Update your in-memory parameter
    this.parameters[parameterName] = value;

    // Find the corresponding MIDI CC number
    const ccNumber = MIDI_CCS[parameterName.toUpperCase()];

    if (ccNumber === undefined) {
      console.warn(`No MIDI CC mapping found for parameter: ${parameterName}`);
      return;
    }

    // Emit the parameterChange event, passing the info needed to send CC
    this.emit("parameterChange", {
      ccNumber,
      value,
      channel: this.channel,
    });
  }

  get currentPattern() {
    return this._currentPattern;
  }

  set currentPattern(pattern) {
    this._currentPattern = pattern;
    this.emit("patternChange", pattern);
  }

  addAutomation(parameterName, automation) {
    if (!this.automations.has(parameterName)) {
      this.automations.set(parameterName, []);
    }
    this.automations.get(parameterName).push(automation);
  }

  updateAutomations(beat) {
    this.automations.forEach((automations, parameterName) => {
      const activeAutomations = automations.filter(
        (a) =>
          beat >= a.startBeat && (a.repeat || beat <= a.startBeat + a.duration)
      );

      if (activeAutomations.length > 0) {
        // Use the last active automation if multiple overlap
        const value =
          activeAutomations[activeAutomations.length - 1].getValue(beat);
        this.setParameter(parameterName, Math.round(value));
      }
    });
  }

  clearSequencesAndAutomations() {
    this.automations.clear();
    this.removeSequencedNotes();
  }

  removeSequencedNotes() {
    this.patterns.forEach((pattern) => {
      pattern.notes.forEach((note) => {
        if (note.start <= this.currentBeat) {
          this.sendNoteStop(note);
        }
      });
      pattern.notes = [];
    });
  }
}

class Pattern {
  constructor({ length = 16, resolution = 16 }) {
    this.length = length; // Pattern length in beats
    this.resolution = resolution; // Steps per beat
    this.notes = [];
    this.loop = true; // Patterns loop by default
  }

  getNoteEventsInTimeRange(startBeat, endBeat) {
    const events = [];
    if (!this.loop) {
      return this.notes.filter(
        (note) => note.start >= startBeat && note.start < endBeat
      );
    }

    // Handle looping patterns
    const patternDuration = this.length;
    const startPattern = Math.floor(startBeat / patternDuration);
    const endPattern = Math.ceil(endBeat / patternDuration);

    for (let i = startPattern; i < endPattern; i++) {
      this.notes.forEach((note) => {
        const noteStart = note.start + i * patternDuration;
        if (noteStart >= startBeat && noteStart < endBeat) {
          // clone the note so we keep the prototype (getMIDINoteNumber)
          events.push(note.clone({ start: noteStart }));
        }
      });
    }
    return events;
  }
}

class OPXY extends EventEmitter {
  constructor() {
    super();
    this.tracks = new Map();
    this.isPlaying = false;
    this.TICKS_PER_QUARTER = 24;
    this.STEPS_PER_BEAT = 4;
    this.TICKS_PER_STEP = this.TICKS_PER_QUARTER / this.STEPS_PER_BEAT;
    this.clockTickCount = 0;
    this.currentBeat = 0;
    this.tempo = 120;
    this.lastTickTime = null;
    this.midiOutput = null;
    this.initializeTracks();
  }

  async initialize() {
    try {
      const access = await navigator.requestMIDIAccess();

      const outputs = Array.from(access.outputs.values());
      if (outputs.length > 0) {
        this.midiOutput = outputs[0];
        this.updateStatus(`Connected to MIDI output: ${this.midiOutput.name}`);
      } else {
        this.updateStatus("No MIDI outputs found.");
      }

      if (access.inputs.size > 0) {
        for (let input of access.inputs.values()) {
          input.onmidimessage = this.handleMidiMessage.bind(this);
        }
      } else {
        this.updateStatus("No MIDI inputs found.");
      }

      access.onstatechange = this.handleMidiStateChange.bind(this);

      // Start animation frame loop for automations
      this._updateAutomations();

      return true;
    } catch (error) {
      this.updateStatus("Failed to initialize MIDI: " + error.message);
      return false;
    }
  }

  sendMidiCC(channel, ccNumber, value) {
    // 0xB0 indicates a Control Change message
    // channel - 1 because MIDI channels are 0–15 internally
    if (this.midiOutput) {
      this.midiOutput.send([0xb0 | (channel - 1), ccNumber, value]);
    }
  }

  _updateAutomations() {
    for (const track of this.tracks.values()) {
      track.updateAutomations(this.currentBeat);
    }
    requestAnimationFrame(() => this._updateAutomations());
  }

  updateStatus(message) {
    const statusDiv = document.getElementById("status");
    if (statusDiv) {
      statusDiv.textContent = message;
    }
  }

  start() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.clockTickCount = 0;
      this.updateStatus("Started");
    }
  }

  stop() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.updateStatus("Stopped");
      this.clearSequencesAndAutomations();
    }
  }

  initializeTracks() {
    // Create 8 instrument tracks (channels 1–8)
    for (let i = 1; i <= 8; i++) {
      const track = new Track({
        name: `track${i}`, // Use backticks here
        channel: i,
        type: "instrument",
      });

      // Store the track in the OPXY's Map
      this.tracks.set(`track${i}`, track);

      // Listen for parameterChange events from this track
      track.on("parameterChange", ({ ccNumber, value, channel }) => {
        // Ensure you have defined sendMidiCC in OPXY
        this.sendMidiCC(channel, ccNumber, value);
      });
    }
  }

  processClockTick() {
    if (!this.isPlaying) return;

    const now = performance.now();
    if (!this.lastTickTime) {
      this.lastTickTime = now;
      return;
    }

    // Calculate current beat position
    const ticksElapsed = this.clockTickCount % this.TICKS_PER_QUARTER;
    const beatsElapsed = this.clockTickCount / this.TICKS_PER_QUARTER;
    this.currentBeat = beatsElapsed;

    // Process automations for all tracks
    this.tracks.forEach((track) => {
      track.updateAutomations(this.currentBeat);
    });

    // Process notes for the next time window
    const LOOK_AHEAD = 0.1; // Look ahead 100ms
    const endBeat = this.currentBeat + LOOK_AHEAD;

    this.tracks.forEach((track) => {
      if (track.currentPattern) {
        const notes = track.currentPattern.getNoteEventsInTimeRange(
          this.currentBeat,
          endBeat
        );

        notes.forEach((note) => {
          const noteOn = [
            0x90 | (track.channel - 1),
            note.getMIDINoteNumber(),
            note.velocity,
          ];
          const noteOff = [
            0x80 | (track.channel - 1),
            note.getMIDINoteNumber(),
            0,
          ];

          if (this.midiOutput) {
            const noteStartDelay =
              (note.start - this.currentBeat) * (60000 / this.tempo);
            const noteDuration = note.duration * (60000 / this.tempo);

            setTimeout(() => this.midiOutput.send(noteOn), noteStartDelay);
            setTimeout(
              () => this.midiOutput.send(noteOff),
              noteStartDelay + noteDuration
            );
          }
        });
      }
    });

    this.lastTickTime = now;
  }

  handleMidiMessage(message) {
    const [status] = message.data;

    switch (status) {
      case 0xfa: // Start
        this.start();
        break;
      case 0xfc: // Stop
        this.stop();
        break;
      case 0xf8: // Clock Tick
        if (this.isPlaying) {
          this.clockTickCount++;
          this.processClockTick();
        }
        break;
    }
  }

  handleMidiStateChange(event) {
    this.updateStatus(`MIDI connection state changed: ${event.port.state}`);
  }

  clearSequencesAndAutomations() {
    this.tracks.forEach((track) => {
      track.clearSequencesAndAutomations();
    });
  }

  generateAndApplyPatch({
    patchType = "lead",
    brightness = 0.5,
    movement = 0.5,
    complexity = 0.5,
    character = 0.5,
    resonance = 0.5,
    spatialWidth = 0.5,
    engineSelection = "random",
  } = {}) {
    // Generate the patch
    const patch = generatePatch({
      patchType,
      brightness,
      movement,
      complexity,
      character,
      resonance,
      spatialWidth,
      engineSelection,
    });

    console.log("Generated patch:", JSON.stringify(patch, null, 2));

    // Get the track for the specified channel
    const track = this.tracks.get(`track${patch.channel}`);
    if (!track) {
      console.error(`No track found for channel ${patch.channel}`);
      return;
    }

    function updateTrackParams(track, params) {
      for (const [key, value] of Object.entries(params)) {
        track.setParameter(key, value);
      }
    }

    // Update basic parameters
    updateTrackParams(track, {
      trackVolume: patch.volume,
      trackPan: patch.pan,
      // Amp envelope
      ampAttack: patch.ampEnv.attack,
      ampDecay: patch.ampEnv.decay,
      ampSustain: patch.ampEnv.sustain,
      ampRelease: patch.ampEnv.release,
      // Filter parameters
      filterCutoff: patch.filter.cutoff,
      resonance: patch.filter.resonance,
      envAmount: patch.filter.envAmount,
      keyTracking: patch.filter.keyTracking,
      // Filter envelope
      filterAttack: patch.filter.envelope.attack,
      filterDecay: patch.filter.envelope.decay,
      filterSustain: patch.filter.envelope.sustain,
      filterRelease: patch.filter.envelope.release,
      // Engine parameters
      param1: patch.param1,
      param2: patch.param2,
      param3: patch.param3,
      param4: patch.param4,
    });

    // Set up FX sends if FX are specified
    if (patch.fx && patch.fx.length > 0) {
      updateTrackParams(track, {
        sendToFX1: patch.fx[0].recommendedWet || 64,
        sendToFX2: patch.fx[1]?.recommendedWet || 0,
      });
    }

    // Set up the LFO if specified
    if (patch.lfo) {
      const { type, speed, amount, destination, parameter, ...lfoParams } =
        patch.lfo;
      track.setParameter(
        "lfoShape",
        {
          element: 0,
          random: 1,
          tremolo: 2,
          value: 3,
        }[type] || 0
      );

      // Set LFO parameters based on type
      switch (type) {
        case "element":
          track.setParameter("param1", speed || 64);
          track.setParameter("param2", amount || 64);
          break;
        case "random":
        case "tremolo":
        case "value":
          track.setParameter("param1", speed || 64);
          track.setParameter("param2", amount || 64);
          if (lfoParams.envelope) {
            track.setParameter("param3", lfoParams.envelope);
          }
          break;
      }
    }

    // Create and set up pattern
    if (patch.pattern && patch.pattern.notes) {
      const pattern = new Pattern({
        length: patch.pattern.length || 4,
        resolution: patch.pattern.resolution || 16,
      });

      // Add notes to pattern
      patch.pattern.notes.forEach((noteData) => {
        pattern.notes.push(
          new Note({
            pitch: noteData.pitch,
            velocity: noteData.velocity || 100,
            start: noteData.start,
            duration: noteData.duration,
            channel: patch.channel,
          })
        );
      });

      // Add the pattern to the patterns array
      track.patterns.push(pattern);

      // Set as current pattern
      track.currentPattern = pattern;
    }

    // Set up automations
    if (patch.automations && patch.automations.length > 0) {
      patch.automations.forEach((autoData) => {
        const splitTarget = autoData.target.split(".");
        let param;

        if (splitTarget.length > 1) {
          // If target is in "module.param" format
          param = splitTarget[1];
        } else {
          // If target is just the parameter name
          param = splitTarget[0];
        }

        // Log the extracted param for debugging
        const automation = new Automation({
          target: param,
          startValue: autoData.startValue,
          endValue: autoData.endValue,
          startBeat: autoData.startBeat,
          duration: autoData.duration,
          repeat: true, // Make automation loop by default
        });
        track.addAutomation(param, automation);
      });
    }

    return patch;
  }

  getCurrentPlaying() {
    const currentPlaying = {};

    this.tracks.forEach((track, trackName) => {
      const notes = track.currentPattern ? track.currentPattern.notes : [];
      const automations = track.automations;

      currentPlaying.notes = currentPlaying.notes || [];
      currentPlaying.automations = currentPlaying.automations || [];

      notes.forEach((note) => {
        currentPlaying.notes.push({
          track: trackName,
          pitch: note.pitch,
          velocity: note.velocity,
          start: note.start,
          duration: note.duration,
        });
      });

      if (automations) {
        Array.from(automations.entries()).forEach(([param, automations]) => {
          automations.forEach((auto) => {
            currentPlaying.automations.push({
              track: trackName,
              parameter: param,
              startValue: auto.startValue,
              endValue: auto.endValue,
              startBeat: auto.startBeat,
              duration: auto.duration,
              repeat: auto.repeat,
            });
          });
        });
      }
    });

    return currentPlaying;
  }
}
