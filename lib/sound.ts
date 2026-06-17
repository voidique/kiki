const SAMPLE_NAMES = [
  "BACKSPACE",
  "ENTER",
  "SPACE",
  "GENERIC_R0",
  "GENERIC_R1",
  "GENERIC_R2",
  "GENERIC_R3",
  "GENERIC_R4",
] as const;

type SampleName = (typeof SAMPLE_NAMES)[number];

const ROW_BY_CODE: Record<string, SampleName> = {};

const assignRow = (codes: string[], sample: SampleName) => {
  for (const c of codes) ROW_BY_CODE[c] = sample;
};

assignRow(
  [
    "Backquote",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "Digit0",
    "Minus",
    "Equal",
    "Escape",
    "Tab",
  ],
  "GENERIC_R0",
);
assignRow(
  [
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
    "Backslash",
  ],
  "GENERIC_R1",
);
assignRow(
  [
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyJ",
    "KeyK",
    "KeyL",
    "Semicolon",
    "Quote",
    "CapsLock",
  ],
  "GENERIC_R2",
);
assignRow(
  [
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV",
    "KeyB",
    "KeyN",
    "KeyM",
    "Comma",
    "Period",
    "Slash",
  ],
  "GENERIC_R3",
);
assignRow(
  [
    "ShiftLeft",
    "ShiftRight",
    "ControlLeft",
    "ControlRight",
    "AltLeft",
    "AltRight",
    "MetaLeft",
    "MetaRight",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
  ],
  "GENERIC_R4",
);

function sampleForKey(code: string, key: string): SampleName {
  if (code === "Backspace" || key === "Backspace") return "BACKSPACE";
  if (code === "Enter" || code === "NumpadEnter" || key === "Enter")
    return "ENTER";
  if (code === "Space" || key === " ") return "SPACE";
  return ROW_BY_CODE[code] ?? "GENERIC_R2";
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buffers = new Map<SampleName, AudioBuffer>();
  private loadingStarted = false;
  private volume = 0.6;
  private enabled = true;

  private ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    void this.loadAll();
  }

  private async loadAll() {
    if (this.loadingStarted || !this.ctx) return;
    this.loadingStarted = true;
    await Promise.all(
      SAMPLE_NAMES.map(async (name) => {
        try {
          const res = await fetch(`/sounds/${name}.mp3`);
          const arr = await res.arrayBuffer();
          const buf = await this.ctx!.decodeAudioData(arr);
          this.buffers.set(name, buf);
        } catch {}
      }),
    );
  }

  prime() {
    this.ensureContext();
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.01);
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
  }

  playForEvent(code: string, key: string) {
    if (!this.enabled || this.volume <= 0) return;
    this.ensureContext();
    if (!this.ctx || !this.master) return;
    const buf = this.buffers.get(sampleForKey(code, key));
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.97 + (key.charCodeAt(0) % 7) * 0.01;
    src.connect(this.master);
    src.start();
  }
}

export const soundEngine = new SoundEngine();
