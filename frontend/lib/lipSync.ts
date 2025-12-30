import type { InterviewerControls } from "@/app/interview/_components/Interviewer";

export function speakWithLipSync(
  text: string,
  controls: React.RefObject<InterviewerControls>
) {
  const audio = new Audio(
    `http://localhost:8000/tts/stream?text=${encodeURIComponent(text)}`
  );

  const ctx = new AudioContext();
  const src = ctx.createMediaElementSource(audio);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  src.connect(analyser);
  analyser.connect(ctx.destination);

  const data = new Uint8Array(analyser.frequencyBinCount);

  audio.play();

  const tick = () => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.min(Math.sqrt(sum / data.length) * 3, 1);
    controls.current?.setMouthOpen(rms);
    requestAnimationFrame(tick);
  };

  tick();
  audio.onended = () => controls.current?.setMouthOpen(0);
}
