"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConceptAudioNodes = {
  context: AudioContext;
  master: GainNode;
  engine: OscillatorNode;
  sub: OscillatorNode;
  noise: AudioBufferSourceNode;
  noiseGain: GainNode;
  filter: BiquadFilterNode;
};

type BrowserAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useConceptSound(progress: number, disabled: boolean) {
  const nodesRef = useRef<ConceptAudioNodes | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);

  const stop = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) {
      return;
    }

    const now = nodes.context.currentTime;
    nodes.master.gain.cancelScheduledValues(now);
    nodes.master.gain.setTargetAtTime(0, now, 0.08);
    window.setTimeout(() => {
      try {
        nodes.engine.stop();
        nodes.sub.stop();
        nodes.noise.stop();
        void nodes.context.close();
      } catch {
        // Already stopped or closed.
      }
    }, 180);
    nodesRef.current = null;
  }, []);

  const start = useCallback(async () => {
    const AudioContextConstructor = window.AudioContext || (window as BrowserAudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) {
      setSupported(false);
      return false;
    }

    const context = new AudioContextConstructor();
    await context.resume();

    const master = context.createGain();
    const engine = context.createOscillator();
    const sub = context.createOscillator();
    const filter = context.createBiquadFilter();
    const engineGain = context.createGain();
    const subGain = context.createGain();
    const noiseGain = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const noise = context.createBufferSource();
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    engine.type = "sawtooth";
    sub.type = "sine";
    engine.frequency.value = 54;
    sub.frequency.value = 27;
    filter.type = "lowpass";
    filter.frequency.value = 360;
    filter.Q.value = 0.8;
    engineGain.gain.value = 0.09;
    subGain.gain.value = 0.06;
    noiseGain.gain.value = 0.025;
    master.gain.value = 0;
    compressor.threshold.value = -26;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.22;
    noise.buffer = noiseBuffer;
    noise.loop = true;

    engine.connect(engineGain).connect(filter);
    sub.connect(subGain).connect(filter);
    noise.connect(noiseGain).connect(filter);
    filter.connect(compressor).connect(master).connect(context.destination);

    engine.start();
    sub.start();
    noise.start();

    master.gain.setTargetAtTime(0.16, context.currentTime, 0.18);
    nodesRef.current = { context, master, engine, sub, noise, noiseGain, filter };
    return true;
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      stop();
      setEnabled(false);
      return;
    }

    const started = await start();
    setEnabled(started);
  }, [enabled, start, stop]);

  useEffect(() => {
    if (!disabled || !enabled) {
      return;
    }

    stop();
    window.setTimeout(() => setEnabled(false), 0);
  }, [disabled, enabled, stop]);

  useEffect(() => {
    const nodes = nodesRef.current;
    if (!enabled || !nodes) {
      return;
    }

    const now = nodes.context.currentTime;
    const load = Math.min(Math.max(progress, 0), 1);
    nodes.engine.frequency.setTargetAtTime(52 + load * 58, now, 0.16);
    nodes.sub.frequency.setTargetAtTime(26 + load * 21, now, 0.16);
    nodes.filter.frequency.setTargetAtTime(340 + load * 760, now, 0.2);
    nodes.noiseGain.gain.setTargetAtTime(0.018 + load * 0.035, now, 0.18);
  }, [enabled, progress]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    enabled,
    supported,
    toggle,
  };
}
