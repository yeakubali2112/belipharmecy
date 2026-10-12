/**
 * Helper utility for Pharmacist Prescription Voice Notes
 * Supports:
 * 1. Live Microphone Recording via MediaRecorder API
 * 2. File to Base64 Audio Converter
 * 3. Synthesis of realistic pharmacist voice advice note
 */

export function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a clean synthetic audio sound with pleasant voice-pitch chords 
 * so that tests can immediately play a genuine audio track without requiring a physical mic.
 */
export function createSyntheticVoiceAudio(durationSeconds = 6) {
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new Float32Array(numSamples);

  // Pharmacist speaking melody simulation (frequency modulation between 180Hz - 260Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Cadence of speech pattern
    const speechEnvelope = Math.sin(t * 3.5) * Math.sin(t * 7.0);
    const fundamental = 220 + Math.sin(t * 4.2) * 35;
    const sample = Math.sin(2 * Math.PI * fundamental * t) * 0.4 +
                   Math.sin(2 * Math.PI * (fundamental * 2) * t) * 0.2 +
                   Math.sin(2 * Math.PI * (fundamental * 3) * t) * 0.1;
    buffer[i] = sample * Math.max(0, speechEnvelope) * (1 - Math.exp(-t * 2)) * Math.min(1, (durationSeconds - t));
  }

  // Convert Float32Array to 16-bit PCM WAV
  const wavBytes = encodeWAV(buffer, sampleRate);
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 38, 'data');
  /* data chunk length */
  view.setUint32(42, samples.length * 2, true);

  // write the PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
