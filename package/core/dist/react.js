'use client';
import { _ as _extends } from './cc-he3fHS3P.js';
import { useMemo, useRef, useState, useEffect, use, useCallback, createContext, useSyncExternalStore } from 'react';

let ctx = null;
let masterGain = null;
let storedOptions = {};
/**
 * Returns the shared `AudioContext`, creating one if needed.
 *
 * If the context is suspended (e.g. before a user gesture), it will be
 * resumed automatically. Pass `options` on first call to configure latency
 * and sample rate.
 *
 * @param options - Context creation options (stored for future calls)
 * @returns The shared `AudioContext`
 */ function getContext(options) {
    if (!ctx || ctx.state === "closed") {
        ctx = new AudioContext({
            latencyHint: storedOptions.latencyHint,
            sampleRate: storedOptions.sampleRate
        });
        masterGain = null;
    }
    if (ctx.state === "suspended") {
        ctx.resume();
    }
    return ctx;
}
/**
 * Returns the master bus `GainNode`, creating it on first access.
 *
 * The master bus sits between all sound output and `ctx.destination`,
 * providing a single point to control global volume.
 */ function getMasterBus() {
    const c = getContext();
    if (!masterGain || masterGain.context !== c) {
        masterGain = c.createGain();
        masterGain.connect(c.destination);
    }
    return masterGain;
}
/**
 * Returns the appropriate destination node for sound output.
 *
 * If a master bus has been created, routes through it; otherwise falls
 * back to `ctx.destination`.
 */ function getDestination() {
    const c = getContext();
    if (masterGain && masterGain.context === c) {
        return masterGain;
    }
    return c.destination;
}
/**
 * Configures the 3D audio listener position and orientation.
 *
 * @param listener - Position and orientation values
 * @see {@link getListener}
 */ function setListener(listener) {
    var _listener_forwardX, _listener_forwardY, _listener_forwardZ, _listener_upX, _listener_upY, _listener_upZ;
    const audio = getContext();
    const l = audio.listener;
    l.positionX.value = listener.positionX;
    l.positionY.value = listener.positionY;
    l.positionZ.value = listener.positionZ;
    l.forwardX.value = (_listener_forwardX = listener.forwardX) != null ? _listener_forwardX : 0;
    l.forwardY.value = (_listener_forwardY = listener.forwardY) != null ? _listener_forwardY : 0;
    l.forwardZ.value = (_listener_forwardZ = listener.forwardZ) != null ? _listener_forwardZ : -1;
    l.upX.value = (_listener_upX = listener.upX) != null ? _listener_upX : 0;
    l.upY.value = (_listener_upY = listener.upY) != null ? _listener_upY : 1;
    l.upZ.value = (_listener_upZ = listener.upZ) != null ? _listener_upZ : 0;
}

/**
 * Creates a standalone {@link AudioAnalyser}.
 *
 * The caller is responsible for connecting a source to `analyser.node`.
 * Call `analyser.dispose()` when finished to disconnect.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */ function createAnalyser(opts) {
    var _ref, _ref1;
    const ctx = getContext();
    const node = ctx.createAnalyser();
    node.fftSize = (_ref = opts == null ? void 0 : opts.fftSize) != null ? _ref : 2048;
    node.smoothingTimeConstant = (_ref1 = opts == null ? void 0 : opts.smoothingTimeConstant) != null ? _ref1 : 0.8;
    if ((opts == null ? void 0 : opts.minDecibels) !== undefined) node.minDecibels = opts.minDecibels;
    if ((opts == null ? void 0 : opts.maxDecibels) !== undefined) node.maxDecibels = opts.maxDecibels;
    const freqData = new Uint8Array(node.frequencyBinCount);
    const timeData = new Uint8Array(node.fftSize);
    const floatFreqData = new Float32Array(node.frequencyBinCount);
    const floatTimeData = new Float32Array(node.fftSize);
    return {
        node,
        frequencyBinCount: node.frequencyBinCount,
        getFrequencyData () {
            node.getByteFrequencyData(freqData);
            return freqData;
        },
        getTimeDomainData () {
            node.getByteTimeDomainData(timeData);
            return timeData;
        },
        getFloatFrequencyData () {
            node.getFloatFrequencyData(floatFreqData);
            return floatFreqData;
        },
        getFloatTimeDomainData () {
            node.getFloatTimeDomainData(floatTimeData);
            return floatTimeData;
        },
        dispose () {
            try {
                node.disconnect();
            } catch (_) {}
        }
    };
}
/**
 * Creates an {@link AudioAnalyser} that is pre-connected to the master bus.
 *
 * Useful for visualising the combined output of all sounds.
 * The returned analyser automatically disconnects from the master bus on
 * `dispose()`.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */ function createMasterAnalyser(opts) {
    const bus = getMasterBus();
    const analyser = createAnalyser(opts);
    bus.connect(analyser.node);
    const originalDispose = analyser.dispose;
    analyser.dispose = ()=>{
        try {
            bus.disconnect(analyser.node);
        } catch (_) {}
        originalDispose();
    };
    return analyser;
}

function withMix(ctx, mix, // biome-ignore lint/suspicious/noConfusingVoidType: callers may omit return
create) {
    const input = ctx.createGain();
    const output = ctx.createGain();
    const dry = ctx.createGain();
    dry.gain.value = 1 - mix;
    input.connect(dry);
    dry.connect(output);
    const wet = ctx.createGain();
    wet.gain.value = mix;
    input.connect(wet);
    const wetOut = ctx.createGain();
    wetOut.connect(output);
    const result = create(wet, wetOut);
    return {
        input,
        output,
        dispose: result == null ? void 0 : result.dispose
    };
}
function createReverb(ctx, opts) {
    var _opts_decay, _opts_mix, _opts_preDelay, _opts_damping, _opts_roomSize;
    const decay = (_opts_decay = opts.decay) != null ? _opts_decay : 0.5;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.3;
    const preDelay = (_opts_preDelay = opts.preDelay) != null ? _opts_preDelay : 0;
    const damping = (_opts_damping = opts.damping) != null ? _opts_damping : 0;
    const roomSize = (_opts_roomSize = opts.roomSize) != null ? _opts_roomSize : 1;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const sampleRate = ctx.sampleRate;
        const effectiveDecay = decay * roomSize;
        const length = Math.ceil(sampleRate * effectiveDecay);
        const buffer = ctx.createBuffer(2, length, sampleRate);
        for(let ch = 0; ch < 2; ch++){
            const data = buffer.getChannelData(ch);
            for(let i = 0; i < length; i++){
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.28));
            }
        }
        if (damping > 0) {
            for(let ch = 0; ch < 2; ch++){
                const data = buffer.getChannelData(ch);
                const coeff = Math.min(damping, 0.99);
                let prev = 0;
                for(let i = 0; i < length; i++){
                    prev = data[i] * (1 - coeff) + prev * coeff;
                    data[i] = prev;
                }
            }
        }
        const convolver = ctx.createConvolver();
        convolver.buffer = buffer;
        if (preDelay > 0) {
            const preDelayNode = ctx.createDelay(Math.max(preDelay + 0.01, 1));
            preDelayNode.delayTime.value = preDelay;
            wet.connect(preDelayNode);
            preDelayNode.connect(convolver);
        } else {
            wet.connect(convolver);
        }
        convolver.connect(wetOut);
    });
}
const irCache = new Map();
function createConvolver(ctx, opts) {
    var _opts_mix;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.5;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const convolver = ctx.createConvolver();
        if (opts.buffer) {
            convolver.buffer = opts.buffer;
        } else if (opts.url) {
            const cached = irCache.get(opts.url);
            if (cached) {
                convolver.buffer = cached;
            } else {
                const url = opts.url;
                fetch(url).then((res)=>res.arrayBuffer()).then((data)=>ctx.decodeAudioData(data)).then((decoded)=>{
                    irCache.set(url, decoded);
                    convolver.buffer = decoded;
                });
            }
        }
        wet.connect(convolver);
        convolver.connect(wetOut);
    });
}
function createDelay(ctx, opts) {
    var _opts_time, _opts_feedback, _opts_mix;
    const time = (_opts_time = opts.time) != null ? _opts_time : 0.25;
    const feedback = (_opts_feedback = opts.feedback) != null ? _opts_feedback : 0.3;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.3;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const delay = ctx.createDelay(Math.max(time + 0.01, 1));
        delay.delayTime.value = time;
        const fb = ctx.createGain();
        fb.gain.value = feedback;
        wet.connect(delay);
        delay.connect(fb);
        if (opts.feedbackFilter) {
            var _opts_feedbackFilter_Q;
            const filter = ctx.createBiquadFilter();
            filter.type = opts.feedbackFilter.type;
            filter.frequency.value = opts.feedbackFilter.frequency;
            filter.Q.value = (_opts_feedbackFilter_Q = opts.feedbackFilter.Q) != null ? _opts_feedbackFilter_Q : 1;
            fb.connect(filter);
            filter.connect(delay);
        } else {
            fb.connect(delay);
        }
        delay.connect(wetOut);
    });
}
function createDistortion(ctx, opts) {
    var _opts_amount, _opts_mix;
    const amount = (_opts_amount = opts.amount) != null ? _opts_amount : 50;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.5;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const shaper = ctx.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        const k = amount;
        for(let i = 0; i < samples; i++){
            const x = i * 2 / samples - 1;
            curve[i] = Math.tanh(k * x);
        }
        shaper.curve = curve;
        shaper.oversample = "4x";
        wet.connect(shaper);
        shaper.connect(wetOut);
    });
}
function createChorus(ctx, opts) {
    var _opts_rate, _opts_depth, _opts_mix;
    const rate = (_opts_rate = opts.rate) != null ? _opts_rate : 1.5;
    const depth = (_opts_depth = opts.depth) != null ? _opts_depth : 0.003;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.3;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const delayL = ctx.createDelay();
        delayL.delayTime.value = 0.012;
        const delayR = ctx.createDelay();
        delayR.delayTime.value = 0.016;
        const lfoL = ctx.createOscillator();
        lfoL.type = "sine";
        lfoL.frequency.value = rate;
        const lfoR = ctx.createOscillator();
        lfoR.type = "sine";
        lfoR.frequency.value = rate * 1.1;
        const lfoGainL = ctx.createGain();
        lfoGainL.gain.value = depth;
        const lfoGainR = ctx.createGain();
        lfoGainR.gain.value = depth;
        lfoL.connect(lfoGainL);
        lfoGainL.connect(delayL.delayTime);
        lfoL.start();
        lfoR.connect(lfoGainR);
        lfoGainR.connect(delayR.delayTime);
        lfoR.start();
        wet.connect(delayL);
        wet.connect(delayR);
        delayL.connect(wetOut);
        delayR.connect(wetOut);
        return {
            dispose () {
                try {
                    lfoL.stop();
                } catch (_) {}
                try {
                    lfoR.stop();
                } catch (_) {}
            }
        };
    });
}
function createFlanger(ctx, opts) {
    var _opts_rate, _opts_depth, _opts_feedback, _opts_mix;
    const rate = (_opts_rate = opts.rate) != null ? _opts_rate : 0.5;
    const depth = (_opts_depth = opts.depth) != null ? _opts_depth : 0.002;
    const feedback = (_opts_feedback = opts.feedback) != null ? _opts_feedback : 0.5;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.5;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.005;
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = rate;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = depth;
        lfo.connect(lfoGain);
        lfoGain.connect(delay.delayTime);
        lfo.start();
        const fb = ctx.createGain();
        fb.gain.value = feedback;
        delay.connect(fb);
        fb.connect(delay);
        wet.connect(delay);
        delay.connect(wetOut);
        return {
            dispose () {
                try {
                    lfo.stop();
                } catch (_) {}
            }
        };
    });
}
function createPhaser(ctx, opts) {
    var _opts_rate, _opts_depth, _opts_stages, _opts_feedback, _opts_mix;
    const rate = (_opts_rate = opts.rate) != null ? _opts_rate : 0.5;
    const depth = (_opts_depth = opts.depth) != null ? _opts_depth : 1000;
    const stages = (_opts_stages = opts.stages) != null ? _opts_stages : 4;
    const feedback = (_opts_feedback = opts.feedback) != null ? _opts_feedback : 0.5;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 0.5;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const filters = [];
        const baseFreqs = [
            200,
            600,
            1200,
            2400,
            4800,
            8000
        ];
        for(let i = 0; i < stages; i++){
            const f = ctx.createBiquadFilter();
            f.type = "allpass";
            f.frequency.value = baseFreqs[i % baseFreqs.length];
            f.Q.value = 0.5;
            filters.push(f);
        }
        for(let i = 0; i < filters.length - 1; i++){
            filters[i].connect(filters[i + 1]);
        }
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = rate;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = depth;
        lfo.connect(lfoGain);
        for (const f of filters){
            lfoGain.connect(f.frequency);
        }
        lfo.start();
        const fb = ctx.createGain();
        fb.gain.value = feedback;
        filters[filters.length - 1].connect(fb);
        fb.connect(filters[0]);
        wet.connect(filters[0]);
        filters[filters.length - 1].connect(wetOut);
        return {
            dispose () {
                try {
                    lfo.stop();
                } catch (_) {}
            }
        };
    });
}
function createTremolo(ctx, opts) {
    var _opts_rate, _opts_depth;
    const rate = (_opts_rate = opts.rate) != null ? _opts_rate : 4;
    const depth = (_opts_depth = opts.depth) != null ? _opts_depth : 0.5;
    const input = ctx.createGain();
    const output = ctx.createGain();
    const tremGain = ctx.createGain();
    tremGain.gain.value = 1 - depth / 2;
    input.connect(tremGain);
    tremGain.connect(output);
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = rate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = depth / 2;
    lfo.connect(lfoGain);
    lfoGain.connect(tremGain.gain);
    lfo.start();
    return {
        input,
        output,
        dispose () {
            try {
                lfo.stop();
            } catch (_) {}
        }
    };
}
function createVibrato(ctx, opts) {
    var _opts_rate, _opts_depth;
    const rate = (_opts_rate = opts.rate) != null ? _opts_rate : 5;
    const depth = (_opts_depth = opts.depth) != null ? _opts_depth : 0.002;
    const input = ctx.createGain();
    const output = ctx.createGain();
    const delay = ctx.createDelay();
    delay.delayTime.value = depth;
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = rate;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = depth;
    lfo.connect(lfoGain);
    lfoGain.connect(delay.delayTime);
    lfo.start();
    input.connect(delay);
    delay.connect(output);
    return {
        input,
        output,
        dispose () {
            try {
                lfo.stop();
            } catch (_) {}
        }
    };
}
function createBitcrusher(ctx, opts) {
    var _opts_bits, _opts_mix, _opts_sampleRateReduction;
    const bits = (_opts_bits = opts.bits) != null ? _opts_bits : 8;
    const mix = (_opts_mix = opts.mix) != null ? _opts_mix : 1;
    const srReduction = (_opts_sampleRateReduction = opts.sampleRateReduction) != null ? _opts_sampleRateReduction : 1;
    return withMix(ctx, mix, (wet, wetOut)=>{
        const shaper = ctx.createWaveShaper();
        const steps = 2 ** bits;
        const samples = 65536;
        const curve = new Float32Array(samples);
        for(let i = 0; i < samples; i++){
            const x = i * 2 / samples - 1;
            if (srReduction > 1) {
                const blockIndex = Math.floor(i / srReduction) * srReduction;
                const blockX = blockIndex * 2 / samples - 1;
                curve[i] = Math.round(blockX * steps) / steps;
            } else {
                curve[i] = Math.round(x * steps) / steps;
            }
        }
        shaper.curve = curve;
        wet.connect(shaper);
        shaper.connect(wetOut);
    });
}
function createCompressor(ctx, opts) {
    var _opts_threshold, _opts_knee, _opts_ratio, _opts_attack, _opts_release;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = (_opts_threshold = opts.threshold) != null ? _opts_threshold : -24;
    comp.knee.value = (_opts_knee = opts.knee) != null ? _opts_knee : 30;
    comp.ratio.value = (_opts_ratio = opts.ratio) != null ? _opts_ratio : 4;
    comp.attack.value = (_opts_attack = opts.attack) != null ? _opts_attack : 0.003;
    comp.release.value = (_opts_release = opts.release) != null ? _opts_release : 0.25;
    return {
        input: comp,
        output: comp
    };
}
function createEQ(ctx, opts) {
    const input = ctx.createGain();
    const output = ctx.createGain();
    if (opts.bands.length === 0) {
        input.connect(output);
        return {
            input,
            output
        };
    }
    const filters = opts.bands.map((band)=>{
        var _band_Q;
        const f = ctx.createBiquadFilter();
        f.type = band.type;
        f.frequency.value = band.frequency;
        f.gain.value = band.gain;
        f.Q.value = (_band_Q = band.Q) != null ? _band_Q : 1;
        return f;
    });
    input.connect(filters[0]);
    for(let i = 0; i < filters.length - 1; i++){
        filters[i].connect(filters[i + 1]);
    }
    filters[filters.length - 1].connect(output);
    return {
        input,
        output
    };
}
function createGainEffect(ctx, opts) {
    const gain = ctx.createGain();
    gain.gain.value = opts.value;
    return {
        input: gain,
        output: gain
    };
}
function createPanEffect(ctx, opts) {
    const panner = ctx.createStereoPanner();
    panner.pan.value = opts.value;
    return {
        input: panner,
        output: panner
    };
}
/**
 * Instantiates an {@link EffectNode} from an {@link Effect} descriptor.
 *
 * This is the main factory used by the engine to build effect chains.
 * It dispatches to the appropriate `create*` function based on `effect.type`.
 *
 * @param ctx - The audio context to create nodes in
 * @param effect - The effect descriptor
 * @returns A connectable effect node with `input`, `output`, and optional `dispose`
 */ function createEffect(ctx, effect) {
    switch(effect.type){
        case "reverb":
            return createReverb(ctx, effect);
        case "convolver":
            return createConvolver(ctx, effect);
        case "delay":
            return createDelay(ctx, effect);
        case "distortion":
            return createDistortion(ctx, effect);
        case "chorus":
            return createChorus(ctx, effect);
        case "flanger":
            return createFlanger(ctx, effect);
        case "phaser":
            return createPhaser(ctx, effect);
        case "tremolo":
            return createTremolo(ctx, effect);
        case "vibrato":
            return createVibrato(ctx, effect);
        case "bitcrusher":
            return createBitcrusher(ctx, effect);
        case "compressor":
            return createCompressor(ctx, effect);
        case "eq":
            return createEQ(ctx, effect);
        case "gain":
            return createGainEffect(ctx, effect);
        case "pan":
            return createPanEffect(ctx, effect);
    }
}

const SILENCE = 0.0001;
function isMultiLayer(def) {
    return "layers" in def;
}
function normalize(def) {
    if (isMultiLayer(def)) return def;
    return {
        layers: [
            def
        ],
        effects: []
    };
}
function generateWhiteNoise(data) {
    for(let i = 0; i < data.length; i++){
        data[i] = Math.random() * 2 - 1;
    }
}
function generatePinkNoise(data) {
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for(let i = 0; i < data.length; i++){
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
    }
}
function generateBrownNoise(data) {
    let last = 0;
    for(let i = 0; i < data.length; i++){
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
    }
}
function createNoiseBuffer(ctx, color, duration) {
    const length = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    switch(color){
        case "pink":
            generatePinkNoise(data);
            break;
        case "brown":
            generateBrownNoise(data);
            break;
        default:
            generateWhiteNoise(data);
            break;
    }
    return buffer;
}
const sampleCache = new Map();
async function loadSample(ctx, url) {
    const cached = sampleCache.get(url);
    if (cached) return cached;
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const decoded = await ctx.decodeAudioData(data);
    sampleCache.set(url, decoded);
    return decoded;
}
function buildOscillatorSource(ctx, src, t, duration) {
    const osc = ctx.createOscillator();
    osc.type = src.type;
    if (typeof src.frequency === "number") {
        osc.frequency.setValueAtTime(src.frequency, t);
    } else {
        osc.frequency.setValueAtTime(src.frequency.start, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(src.frequency.end, 1), t + duration);
    }
    if (src.detune) {
        osc.detune.value = src.detune;
    }
    osc.start(t);
    osc.stop(t + duration + 0.1);
    let fmMod;
    if (src.fm) {
        const carrierFreq = typeof src.frequency === "number" ? src.frequency : src.frequency.start;
        fmMod = ctx.createOscillator();
        fmMod.type = "sine";
        fmMod.frequency.value = carrierFreq * src.fm.ratio;
        const modGain = ctx.createGain();
        modGain.gain.value = src.fm.depth;
        fmMod.connect(modGain);
        modGain.connect(osc.frequency);
        fmMod.start(t);
        fmMod.stop(t + duration + 0.1);
    }
    return {
        node: osc,
        scheduled: osc,
        frequencyParam: osc.frequency,
        detuneParam: osc.detune
    };
}
function buildNoiseSource(ctx, src, t, duration) {
    var _src_color;
    const color = (_src_color = src.color) != null ? _src_color : "white";
    const buffer = createNoiseBuffer(ctx, color, duration + 0.1);
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.start(t);
    node.stop(t + duration + 0.1);
    return {
        node,
        scheduled: node
    };
}
function buildWavetableSource(ctx, src, t, duration) {
    const real = new Float32Array(src.harmonics.length + 1);
    const imag = new Float32Array(src.harmonics.length + 1);
    real[0] = 0;
    imag[0] = 0;
    for(let i = 0; i < src.harmonics.length; i++){
        real[i + 1] = 0;
        imag[i + 1] = src.harmonics[i];
    }
    const wave = ctx.createPeriodicWave(real, imag, {
        disableNormalization: false
    });
    const osc = ctx.createOscillator();
    osc.setPeriodicWave(wave);
    if (typeof src.frequency === "number") {
        osc.frequency.setValueAtTime(src.frequency, t);
    } else {
        osc.frequency.setValueAtTime(src.frequency.start, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(src.frequency.end, 1), t + duration);
    }
    osc.start(t);
    osc.stop(t + duration + 0.1);
    return {
        node: osc,
        scheduled: osc,
        frequencyParam: osc.frequency,
        detuneParam: osc.detune
    };
}
function buildSampleSource(ctx, src, t) {
    const node = ctx.createBufferSource();
    if (src.playbackRate !== undefined) {
        node.playbackRate.value = src.playbackRate;
    }
    if (src.detune !== undefined) {
        node.detune.value = src.detune;
    }
    if (src.loop) {
        node.loop = true;
        if (src.loopStart !== undefined) node.loopStart = src.loopStart;
        if (src.loopEnd !== undefined) node.loopEnd = src.loopEnd;
    }
    if (src.buffer) {
        node.buffer = src.buffer;
        node.start(t);
    } else if (src.url) {
        loadSample(ctx, src.url).then((buf)=>{
            node.buffer = buf;
            node.start(Math.max(t, ctx.currentTime));
        });
    }
    return {
        node,
        scheduled: node,
        detuneParam: node.detune,
        playbackRateParam: node.playbackRate
    };
}
function buildStreamSource(ctx, src) {
    const node = ctx.createMediaStreamSource(src.stream);
    return {
        node
    };
}
function buildConstantSource(ctx, src, t, duration) {
    var _src_offset;
    const node = ctx.createConstantSource();
    node.offset.value = (_src_offset = src.offset) != null ? _src_offset : 1;
    node.start(t);
    node.stop(t + duration + 0.1);
    return {
        node,
        scheduled: node
    };
}
function buildSource(ctx, src, t, duration) {
    switch(src.type){
        case "sine":
        case "triangle":
        case "square":
        case "sawtooth":
            return buildOscillatorSource(ctx, src, t, duration);
        case "noise":
            return buildNoiseSource(ctx, src, t, duration);
        case "wavetable":
            return buildWavetableSource(ctx, src, t, duration);
        case "sample":
            return buildSampleSource(ctx, src, t);
        case "stream":
            return buildStreamSource(ctx, src);
        case "constant":
            return buildConstantSource(ctx, src, t, duration);
    }
}
function buildBiquadFilter(ctx, filter, t) {
    var _filter_resonance;
    const node = ctx.createBiquadFilter();
    node.type = filter.type;
    node.frequency.setValueAtTime(filter.frequency, t);
    node.Q.value = (_filter_resonance = filter.resonance) != null ? _filter_resonance : 1;
    if (filter.gain !== undefined) {
        node.gain.value = filter.gain;
    }
    if (filter.envelope) {
        var _env_attack;
        const env = filter.envelope;
        const attackEnd = t + ((_env_attack = env.attack) != null ? _env_attack : 0);
        node.frequency.setValueAtTime(filter.frequency, t);
        node.frequency.linearRampToValueAtTime(env.peak, attackEnd);
        node.frequency.exponentialRampToValueAtTime(Math.max(filter.frequency, 1), attackEnd + env.decay);
    }
    return {
        node,
        frequencyParam: node.frequency
    };
}
function buildIIRFilter(ctx, filter) {
    const node = ctx.createIIRFilter(filter.feedforward, filter.feedback);
    return {
        node
    };
}
function buildSingleFilter(ctx, filter, t) {
    if (filter.type === "iir") {
        const { node } = buildIIRFilter(ctx, filter);
        return {
            node
        };
    }
    const { node, frequencyParam } = buildBiquadFilter(ctx, filter, t);
    return {
        node,
        frequencyParam,
        detuneParam: node.detune,
        QParam: node.Q,
        gainParam: node.gain
    };
}
function buildFilters(ctx, filters, t) {
    const arr = Array.isArray(filters) ? filters : [
        filters
    ];
    return arr.map((f)=>buildSingleFilter(ctx, f, t));
}
function buildEnvelope(ctx, envelope, gain, t) {
    var _envelope_attack, _envelope_sustain, _envelope_release;
    const node = ctx.createGain();
    if (!envelope) {
        node.gain.setValueAtTime(gain, t);
        node.gain.setTargetAtTime(SILENCE, t, 0.15);
        return {
            node,
            duration: 0.5
        };
    }
    const attack = (_envelope_attack = envelope.attack) != null ? _envelope_attack : 0;
    const decay = envelope.decay;
    const sustain = (_envelope_sustain = envelope.sustain) != null ? _envelope_sustain : 0;
    const release = (_envelope_release = envelope.release) != null ? _envelope_release : 0;
    const sustainLevel = Math.max(sustain * gain, SILENCE);
    const decayTC = decay / 3;
    node.gain.setValueAtTime(SILENCE, t);
    if (attack > 0) {
        node.gain.linearRampToValueAtTime(gain, t + attack);
    } else {
        node.gain.setValueAtTime(gain, t);
    }
    if (sustain > 0) {
        node.gain.setTargetAtTime(sustainLevel, t + attack, decayTC);
        if (release > 0) {
            const releaseTC = release / 3;
            node.gain.setTargetAtTime(SILENCE, t + attack + decay, releaseTC);
        }
    } else {
        node.gain.setTargetAtTime(SILENCE, t + attack, decayTC);
    }
    return {
        node,
        duration: attack + decay + release
    };
}
function buildLFO(ctx, lfo, t, duration, targets) {
    const osc = ctx.createOscillator();
    osc.type = lfo.type;
    osc.frequency.value = lfo.frequency;
    const gain = ctx.createGain();
    gain.gain.value = lfo.depth;
    osc.connect(gain);
    let target = null;
    switch(lfo.target){
        case "frequency":
            var _targets_source_frequencyParam;
            target = (_targets_source_frequencyParam = targets.source.frequencyParam) != null ? _targets_source_frequencyParam : null;
            break;
        case "detune":
            var _targets_source_detuneParam;
            target = (_targets_source_detuneParam = targets.source.detuneParam) != null ? _targets_source_detuneParam : null;
            break;
        case "gain":
            target = targets.envNode.gain;
            break;
        case "pan":
            var _ref;
            var _targets_panner;
            target = (_ref = (_targets_panner = targets.panner) == null ? void 0 : _targets_panner.pan) != null ? _ref : null;
            break;
        case "playbackRate":
            var _targets_source_playbackRateParam;
            target = (_targets_source_playbackRateParam = targets.source.playbackRateParam) != null ? _targets_source_playbackRateParam : null;
            break;
        case "filter.frequency":
            var _ref1;
            var _targets_filters_;
            target = (_ref1 = (_targets_filters_ = targets.filters[0]) == null ? void 0 : _targets_filters_.frequencyParam) != null ? _ref1 : null;
            break;
        case "filter.detune":
            var _ref2;
            var _targets_filters_1;
            target = (_ref2 = (_targets_filters_1 = targets.filters[0]) == null ? void 0 : _targets_filters_1.detuneParam) != null ? _ref2 : null;
            break;
        case "filter.Q":
            var _ref3;
            var _targets_filters_2;
            target = (_ref3 = (_targets_filters_2 = targets.filters[0]) == null ? void 0 : _targets_filters_2.QParam) != null ? _ref3 : null;
            break;
        case "filter.gain":
            var _ref4;
            var _targets_filters_3;
            target = (_ref4 = (_targets_filters_3 = targets.filters[0]) == null ? void 0 : _targets_filters_3.gainParam) != null ? _ref4 : null;
            break;
    }
    if (target) {
        gain.connect(target);
        osc.start(t);
        osc.stop(t + duration + 0.1);
        return osc;
    }
    return null;
}
function buildPanner3D(ctx, config) {
    var _config_panningModel, _config_distanceModel;
    const panner = ctx.createPanner();
    panner.panningModel = (_config_panningModel = config.panningModel) != null ? _config_panningModel : "HRTF";
    panner.distanceModel = (_config_distanceModel = config.distanceModel) != null ? _config_distanceModel : "inverse";
    panner.positionX.value = config.positionX;
    panner.positionY.value = config.positionY;
    panner.positionZ.value = config.positionZ;
    if (config.orientationX !== undefined) panner.orientationX.value = config.orientationX;
    if (config.orientationY !== undefined) panner.orientationY.value = config.orientationY;
    if (config.orientationZ !== undefined) panner.orientationZ.value = config.orientationZ;
    if (config.maxDistance !== undefined) panner.maxDistance = config.maxDistance;
    if (config.refDistance !== undefined) panner.refDistance = config.refDistance;
    if (config.rolloffFactor !== undefined) panner.rolloffFactor = config.rolloffFactor;
    if (config.coneInnerAngle !== undefined) panner.coneInnerAngle = config.coneInnerAngle;
    if (config.coneOuterAngle !== undefined) panner.coneOuterAngle = config.coneOuterAngle;
    if (config.coneOuterGain !== undefined) panner.coneOuterGain = config.coneOuterGain;
    return panner;
}
function buildEffectsChain(ctx, effects, destination) {
    if (effects.length === 0) {
        return {
            input: destination,
            output: destination,
            dispose () {}
        };
    }
    const nodes = effects.map((e)=>createEffect(ctx, e));
    for(let i = 0; i < nodes.length - 1; i++){
        nodes[i].output.connect(nodes[i + 1].input);
    }
    nodes[nodes.length - 1].output.connect(destination);
    return {
        input: nodes[0].input,
        output: nodes[nodes.length - 1].output,
        dispose () {
            for (const n of nodes)n.dispose == null ? void 0 : n.dispose.call(n);
        }
    };
}
/**
 * Renders a {@link SoundDefinition} into the Web Audio graph and starts playback.
 *
 * Builds sources, filters, envelopes, LFOs, panners, and effects for every
 * layer, connects them to `destination`, and returns a {@link VoiceHandle}
 * that can stop the sound mid-flight.
 *
 * @param ctx - The `BaseAudioContext` to build nodes in
 * @param definition - A single-layer or multi-layer sound definition
 * @param opts - Runtime overrides (volume, pan, detune, velocity, etc.)
 * @param baseTime - Scheduled start time in seconds (`ctx.currentTime` if omitted)
 * @param destination - Target node to connect to (`ctx.destination` if omitted)
 * @returns A handle with a `stop()` method for cancelling the voice
 */ function render(ctx, definition, opts, baseTime, destination) {
    var _ref;
    const { layers, effects } = normalize(definition);
    const dest = destination != null ? destination : ctx.destination;
    const chain = buildEffectsChain(ctx, effects != null ? effects : [], dest);
    const t0 = baseTime != null ? baseTime : ctx.currentTime;
    const velocity = (_ref = opts == null ? void 0 : opts.velocity) != null ? _ref : 1;
    const jitter = opts == null ? void 0 : opts.jitter;
    const detuneJitter = (jitter == null ? void 0 : jitter.detune) ? (Math.random() * 2 - 1) * jitter.detune : 0;
    const volumeJitter = (jitter == null ? void 0 : jitter.volume) ? 1 + (Math.random() * 2 - 1) * jitter.volume : 1;
    const rateJitter = (jitter == null ? void 0 : jitter.playbackRate) ? 1 + (Math.random() * 2 - 1) * jitter.playbackRate : 1;
    const allDisposers = [
        chain.dispose
    ];
    const allSourceNodes = [];
    const allEnvNodes = [];
    for (const layer of layers){
        var _layer_delay, _layer_gain, _ref1, _ref2;
        const layerStart = t0 + ((_layer_delay = layer.delay) != null ? _layer_delay : 0);
        const baseGain = ((_layer_gain = layer.gain) != null ? _layer_gain : 0.5) * ((_ref1 = opts == null ? void 0 : opts.volume) != null ? _ref1 : 1) * velocity * volumeJitter;
        const { node: envNode, duration: envDuration } = buildEnvelope(ctx, layer.envelope, baseGain, layerStart);
        allEnvNodes.push(envNode);
        const sourceResult = buildSource(ctx, layer.source, layerStart, envDuration);
        if (sourceResult.detuneParam && ((opts == null ? void 0 : opts.detune) || detuneJitter !== 0)) {
            var _ref3;
            sourceResult.detuneParam.value += ((_ref3 = opts == null ? void 0 : opts.detune) != null ? _ref3 : 0) + detuneJitter;
        }
        if (sourceResult.playbackRateParam && ((opts == null ? void 0 : opts.playbackRate) || rateJitter !== 1)) {
            var _ref4;
            sourceResult.playbackRateParam.value *= ((_ref4 = opts == null ? void 0 : opts.playbackRate) != null ? _ref4 : 1) * rateJitter;
        }
        let tail = sourceResult.node;
        const filterResults = [];
        if (layer.filter) {
            const builtFilters = buildFilters(ctx, layer.filter, layerStart);
            for (const f of builtFilters){
                tail.connect(f.node);
                tail = f.node;
                filterResults.push(f);
                if (velocity < 1 && f.frequencyParam) {
                    const baseFreq = f.frequencyParam.value;
                    f.frequencyParam.setValueAtTime(baseFreq * (0.5 + 0.5 * velocity), layerStart);
                }
            }
        }
        tail.connect(envNode);
        let cursor = envNode;
        const layerDisposers = [];
        if (layer.effects && layer.effects.length > 0) {
            const layerFxNodes = layer.effects.map((e)=>createEffect(ctx, e));
            for(let i = 0; i < layerFxNodes.length - 1; i++){
                layerFxNodes[i].output.connect(layerFxNodes[i + 1].input);
            }
            cursor.connect(layerFxNodes[0].input);
            cursor = layerFxNodes[layerFxNodes.length - 1].output;
            for (const n of layerFxNodes){
                if (n.dispose) layerDisposers.push(n.dispose);
            }
        }
        let stereoPanner;
        const effectivePan = (_ref2 = opts == null ? void 0 : opts.pan) != null ? _ref2 : layer.pan;
        if (layer.panner) {
            const panner3d = buildPanner3D(ctx, layer.panner);
            cursor.connect(panner3d);
            cursor = panner3d;
        } else if (effectivePan !== undefined && effectivePan !== 0) {
            stereoPanner = ctx.createStereoPanner();
            stereoPanner.pan.value = effectivePan;
            cursor.connect(stereoPanner);
            cursor = stereoPanner;
        }
        cursor.connect(chain.input);
        if (layer.lfo) {
            const lfos = Array.isArray(layer.lfo) ? layer.lfo : [
                layer.lfo
            ];
            for (const l of lfos){
                buildLFO(ctx, l, layerStart, envDuration, {
                    source: sourceResult,
                    filters: filterResults,
                    envNode,
                    panner: stereoPanner
                });
            }
        }
        if (sourceResult.scheduled) {
            allSourceNodes.push(sourceResult.scheduled);
            const nodesToDisconnect = [
                sourceResult.node,
                envNode,
                ...filterResults.map((f)=>f.node),
                ...stereoPanner ? [
                    stereoPanner
                ] : []
            ];
            sourceResult.scheduled.onended = ()=>{
                for (const n of nodesToDisconnect){
                    try {
                        n.disconnect();
                    } catch (_) {}
                }
                for (const d of layerDisposers)d();
            };
        }
        allDisposers.push(...layerDisposers);
    }
    return {
        stop (releaseTime) {
            const now = ctx.currentTime;
            const fade = releaseTime != null ? releaseTime : 0.015;
            for (const env of allEnvNodes){
                env.gain.cancelScheduledValues(now);
                env.gain.setValueAtTime(env.gain.value, now);
                env.gain.setTargetAtTime(SILENCE, now, fade / 3);
            }
            for (const src of allSourceNodes){
                try {
                    src.stop(now + fade + 0.05);
                } catch (_) {}
            }
        }
    };
}

function createPatchInstance(data) {
    const soundNames = Object.keys(data.sounds);
    return {
        ready: true,
        name: data.name,
        author: data.author,
        version: data.version,
        description: data.description,
        tags: data.tags,
        sounds: soundNames,
        play (name, opts) {
            const def = data.sounds[name];
            if (!def) throw new Error(`Sound "${name}" not found in patch "${data.name}"`);
            const ctx = getContext();
            return render(ctx, def, opts, undefined, getDestination());
        },
        get (name) {
            return data.sounds[name];
        },
        toJSON () {
            return structuredClone(data);
        }
    };
}
/**
 * Loads a sound patch from a URL or an in-memory object.
 *
 * When `source` is a string, it is fetched as JSON and decoded into a
 * {@link SoundPatch}. When it is already a `SoundPatch`, it is used directly.
 *
 * @param source - URL string or `SoundPatch` object
 * @returns A promise that resolves to a ready-to-play {@link AudioPatch}
 * @throws {Error} If the network request fails
 */ async function loadPatch(source) {
    if (typeof source === "string") {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Failed to load patch from ${source}: ${response.status}`);
        const data = await response.json();
        return createPatchInstance(data);
    }
    return createPatchInstance(source);
}

function isDefinition(sound) {
    return typeof sound !== "function";
}
function resolveStepTimes(steps) {
    const times = [];
    let cursor = 0;
    for(let i = 0; i < steps.length; i++){
        const step = steps[i];
        if (step.at !== undefined) {
            cursor = step.at;
        } else if (step.wait !== undefined) {
            cursor += step.wait;
        } else if (i === 0) {
            cursor = 0;
        }
        times.push(cursor);
    }
    return times;
}
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.1;
function scheduleOnce(ctx, steps, times, opts, baseTime, scheduled) {
    const handles = [];
    for(let i = 0; i < steps.length; i++){
        var _step_volume;
        if (scheduled.has(i)) continue;
        const stepTime = baseTime + times[i];
        if (stepTime > ctx.currentTime + SCHEDULE_AHEAD) continue;
        scheduled.add(i);
        const step = steps[i];
        const volume = (_step_volume = step.volume) != null ? _step_volume : opts == null ? void 0 : opts.volume;
        if (isDefinition(step.sound)) {
            const handle = render(ctx, step.sound, volume !== undefined ? {
                volume
            } : opts, stepTime, getDestination());
            handles.push(handle);
        } else {
            const fn = step.sound;
            const delay = (stepTime - ctx.currentTime) * 1000;
            if (delay <= 0) {
                const result = fn(volume !== undefined ? {
                    volume
                } : opts);
                if (result) handles.push(result);
            } else {
                setTimeout(()=>fn(volume !== undefined ? {
                        volume
                    } : opts), delay);
            }
        }
    }
    return handles;
}
/**
 * Schedules and plays a sequence of sounds using a lookahead timer.
 *
 * Steps are positioned in time via `at` (absolute) or `wait` (relative)
 * fields. When `options.loop` is true the sequence repeats indefinitely
 * using `options.duration` as the loop length.
 *
 * @param ctx - The real-time `AudioContext`
 * @param steps - Ordered list of {@link SequenceStep}s
 * @param options - Loop and duration settings
 * @param opts - Runtime overrides applied to every step
 * @returns A stop function that halts playback, or `undefined` if empty
 */ function playSequence(ctx, steps, options, opts) {
    var _options_duration;
    const times = resolveStepTimes(steps);
    if (!(options == null ? void 0 : options.loop)) {
        const scheduled = new Set();
        const handles = [];
        const tick = ()=>{
            const h = scheduleOnce(ctx, steps, times, opts, ctx.currentTime, scheduled);
            handles.push(...h);
            if (scheduled.size < steps.length) {
                timerId = setTimeout(tick, LOOKAHEAD_MS);
            }
        };
        let timerId = null;
        tick();
        return ()=>{
            if (timerId !== null) clearTimeout(timerId);
            for (const h of handles)h.stop();
        };
    }
    const duration = (_options_duration = options.duration) != null ? _options_duration : 1;
    let stopped = false;
    let timerId = null;
    let loopBase = ctx.currentTime;
    let scheduled = new Set();
    const handles = [];
    const tick = ()=>{
        if (stopped) return;
        const h = scheduleOnce(ctx, steps, times, opts, loopBase, scheduled);
        handles.push(...h);
        if (scheduled.size >= steps.length) {
            if (ctx.currentTime >= loopBase + duration - SCHEDULE_AHEAD) {
                loopBase += duration;
                scheduled = new Set();
            }
        }
    };
    timerId = setInterval(tick, LOOKAHEAD_MS);
    tick();
    return ()=>{
        stopped = true;
        if (timerId !== null) clearInterval(timerId);
        for (const h of handles)h.stop();
    };
}

function subscribeToReducedMotion(cb) {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", cb);
    return ()=>mql.removeEventListener("change", cb);
}
function getReducedMotionSnapshot() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getReducedMotionServerSnapshot() {
    return false;
}
function usePrefersReducedMotion() {
    return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, getReducedMotionServerSnapshot);
}
const DEFAULT_STATE = {
    enabled: true,
    volume: 1
};
const NOOP_ACTIONS = {
    setEnabled () {},
    setVolume () {}
};
const SoundContext = /*#__PURE__*/ createContext({
    state: DEFAULT_STATE,
    actions: NOOP_ACTIONS
});
/**
 * Context provider that controls global sound state for all descendant hooks.
 *
 * Wrap your app (or a subtree) with `<SoundProvider>` to enable
 * {@link useSound}, {@link useSequence}, and {@link usePatch} to respect
 * a shared enabled/volume state.
 *
 * @param props.enabled - Whether sounds are allowed to play. @defaultValue `true`
 * @param props.volume - Master volume multiplier (0 – 1). @defaultValue `1`
 * @param props.onEnabledChange - Called when a child requests an enabled change
 * @param props.onVolumeChange - Called when a child requests a volume change
 *
 * @example
 * ```tsx
 * <SoundProvider enabled={soundsOn} volume={0.8}>
 *   <App />
 * </SoundProvider>
 * ```
 */ function SoundProvider({ children, enabled = true, volume = 1, onEnabledChange, onVolumeChange }) {
    const state = useMemo(()=>({
            enabled,
            volume
        }), [
        enabled,
        volume
    ]);
    const onEnabledChangeRef = useRef(onEnabledChange);
    onEnabledChangeRef.current = onEnabledChange;
    const onVolumeChangeRef = useRef(onVolumeChange);
    onVolumeChangeRef.current = onVolumeChange;
    const actions = useMemo(()=>({
            setEnabled: (v)=>onEnabledChangeRef.current == null ? void 0 : onEnabledChangeRef.current.call(onEnabledChangeRef, v),
            setVolume: (v)=>onVolumeChangeRef.current == null ? void 0 : onVolumeChangeRef.current.call(onVolumeChangeRef, v)
        }), []);
    const value = useMemo(()=>({
            state,
            actions
        }), [
        state,
        actions
    ]);
    return /*#__PURE__*/ React.createElement(SoundContext, {
        value: value
    }, children);
}
/**
 * Returns a stable callback that plays the given sound definition.
 *
 * Respects the nearest {@link SoundProvider}'s enabled/volume state and
 * the user's `prefers-reduced-motion` preference. The callback reference
 * never changes between renders (values are read from refs).
 *
 * @param definition - The sound to play
 * @param opts - Default play options (can be overridden at call time)
 * @returns A function that triggers the sound and returns a {@link VoiceHandle}, or `undefined` if muted
 *
 * @example
 * ```tsx
 * const play = useSound({
 *   source: { type: "sine", frequency: 440 },
 *   envelope: { decay: 0.1 },
 * });
 *
 * <button onClick={play}>Beep</button>
 * ```
 */ function useSound(definition, opts) {
    const { state } = use(SoundContext);
    const reducedMotion = usePrefersReducedMotion();
    const stateRef = useRef(state);
    stateRef.current = state;
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;
    const defRef = useRef(definition);
    defRef.current = definition;
    const optsRef = useRef(opts);
    optsRef.current = opts;
    return useCallback(()=>{
        var _ref;
        var _optsRef_current;
        const { enabled, volume } = stateRef.current;
        if (!enabled || reducedMotionRef.current) return undefined;
        const audio = getContext();
        const v = ((_ref = (_optsRef_current = optsRef.current) == null ? void 0 : _optsRef_current.volume) != null ? _ref : 1) * volume;
        return render(audio, defRef.current, _extends({}, optsRef.current, {
            volume: v
        }), undefined, getDestination());
    }, []);
}
/**
 * Returns stable `play` and `stop` callbacks for a sound sequence.
 *
 * Calling `play()` starts the sequence; calling `stop()` halts it.
 * Both callbacks are referentially stable across renders.
 *
 * @param steps - Ordered list of {@link SequenceStep}s
 * @param options - Loop and duration settings
 * @returns An object with `play` and `stop` functions
 */ function useSequence(steps, options) {
    const { state } = use(SoundContext);
    const reducedMotion = usePrefersReducedMotion();
    const stopRef = useRef(null);
    const stateRef = useRef(state);
    stateRef.current = state;
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;
    const stepsRef = useRef(steps);
    stepsRef.current = steps;
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const play = useCallback(()=>{
        const { enabled, volume } = stateRef.current;
        if (!enabled || reducedMotionRef.current) return;
        stopRef.current == null ? void 0 : stopRef.current.call(stopRef);
        const audio = getContext();
        const result = playSequence(audio, stepsRef.current, optionsRef.current, {
            volume
        });
        if (typeof result === "function") {
            stopRef.current = result;
        }
    }, []);
    const stop = useCallback(()=>{
        stopRef.current == null ? void 0 : stopRef.current.call(stopRef);
        stopRef.current = null;
    }, []);
    return useMemo(()=>({
            play,
            stop
        }), [
        play,
        stop
    ]);
}
/**
 * Creates and returns an {@link AudioAnalyser} connected to the master bus.
 *
 * The analyser is initialized once (lazy state) and automatically disposed
 * when the component unmounts.
 *
 * @param opts - FFT size, smoothing, and dB range overrides
 */ function useAnalyser(opts) {
    const optsRef = useRef(opts);
    const [analyser] = useState(()=>createMasterAnalyser(optsRef.current));
    useEffect(()=>{
        return ()=>analyser.dispose();
    }, [
        analyser
    ]);
    return analyser;
}
const emptyPatch = {
    ready: false,
    name: "",
    sounds: [],
    play () {
        return {
            stop () {}
        };
    },
    get () {
        return undefined;
    },
    toJSON () {
        return {
            name: "",
            sounds: {}
        };
    }
};
/**
 * Loads a sound patch and returns a context-aware {@link AudioPatch}.
 *
 * The returned patch's `play()` method automatically respects the nearest
 * {@link SoundProvider}'s enabled/volume state and reduced-motion preference.
 * While the patch is loading, an empty no-op patch is returned (`ready: false`).
 *
 * @param source - URL string or in-memory {@link SoundPatch} object
 * @returns An `AudioPatch` (initially empty until loaded)
 *
 * @example
 * ```tsx
 * const patch = usePatch("https://example.com/ui.json");
 *
 * <button onClick={() => patch.play("click")}>Click</button>
 * ```
 */ function usePatch(source) {
    const { state } = use(SoundContext);
    const reducedMotion = usePrefersReducedMotion();
    const [patch, setPatch] = useState(()=>typeof source !== "string" ? createPatchInstance(source) : null);
    const stateRef = useRef(state);
    stateRef.current = state;
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;
    useEffect(()=>{
        if (typeof source !== "string") return;
        let cancelled = false;
        loadPatch(source).then((p)=>{
            if (!cancelled) setPatch(p);
        }).catch(()=>{});
        return ()=>{
            cancelled = true;
        };
    }, [
        source
    ]);
    return useMemo(()=>{
        if (!patch) return emptyPatch;
        return _extends({}, patch, {
            play (name, opts) {
                var _ref;
                const { enabled, volume } = stateRef.current;
                if (!enabled || reducedMotionRef.current) return {
                    stop () {}
                };
                const v = ((_ref = opts == null ? void 0 : opts.volume) != null ? _ref : 1) * volume;
                return patch.play(name, _extends({}, opts, {
                    volume: v
                }));
            }
        });
    }, [
        patch
    ]);
}
/**
 * Synchronizes the 3D audio listener with the given position and orientation.
 *
 * The effect only re-runs when individual primitive values change, not when
 * the `listener` object reference changes.
 *
 * @param listener - Listener position and orientation
 */ function useListener(listener) {
    const { positionX, positionY, positionZ, forwardX, forwardY, forwardZ, upX, upY, upZ } = listener;
    useEffect(()=>{
        setListener({
            positionX,
            positionY,
            positionZ,
            forwardX,
            forwardY,
            forwardZ,
            upX,
            upY,
            upZ
        });
    }, [
        positionX,
        positionY,
        positionZ,
        forwardX,
        forwardY,
        forwardZ,
        upX,
        upY,
        upZ
    ]);
}

export { SoundProvider, useAnalyser, useListener, usePatch, useSequence, useSound };
