/*
 * 키보드 사운드 엔진 — Web Audio API 기반.
 *
 * HTMLAudioElement 는 빠른 연타 시 같은 소리가 겹쳐 재생되지 못해 끊긴다.
 * AudioContext + 미리 디코딩한 AudioBuffer 를 매 타격마다 새 source 로 재생하면
 * 지연 없이 여러 소리가 동시에 울린다.
 *
 * 매핑(assets → public/sounds):
 *   Backspace → BACKSPACE,  Enter → ENTER,  Space → SPACE
 *   그 외 키  → GENERIC_R0..R4 (물리 키보드 행 기준)
 */

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

/** 물리 키보드 행(row) — GENERIC_R0(숫자열) ~ R4(맨 아랫줄) */
const ROW_BY_CODE: Record<string, SampleName> = {};

const assignRow = (codes: string[], sample: SampleName) => {
  for (const c of codes) ROW_BY_CODE[c] = sample;
};

// R0 — 숫자/기능열
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
// R1 — QWERTY 열
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
// R2 — ASDF 열(홈로우)
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
// R3 — ZXCV 열
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
// R4 — 맨 아랫줄(수정키 등)
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

/** 키 이벤트 → 재생할 샘플 이름 */
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

  /** 사용자 제스처(첫 키 입력 등) 안에서 호출 — autoplay 정책 충족 */
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
        } catch {
          /* 개별 샘플 로드 실패는 조용히 무시 */
        }
      }),
    );
  }

  /** 컨텍스트를 미리 깨워두고 샘플을 받아둔다 (첫 타격 지연 제거) */
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

  /** 키 이벤트로 해당 사운드 재생 */
  playForEvent(code: string, key: string) {
    if (!this.enabled || this.volume <= 0) return;
    this.ensureContext();
    if (!this.ctx || !this.master) return;
    const buf = this.buffers.get(sampleForKey(code, key));
    if (!buf) return; // 아직 로딩 전이면 이번 타격은 건너뜀
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    // 같은 샘플 반복 시 기계음처럼 들리지 않도록 미세한 피치 변주
    src.playbackRate.value = 0.97 + (key.charCodeAt(0) % 7) * 0.01;
    src.connect(this.master);
    src.start();
  }
}

/** 앱 전역 단일 엔진 */
export const soundEngine = new SoundEngine();
