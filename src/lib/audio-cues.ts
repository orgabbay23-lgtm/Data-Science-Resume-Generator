const WAV_HEADER_SIZE = 44

const encodeTone = (frequency: number, durationMs: number, volume = 0.16) => {
  const sampleRate = 22050
  const frameCount = Math.max(1, Math.floor((sampleRate * durationMs) / 1000))
  const pcm = new Int16Array(frameCount)

  for (let index = 0; index < frameCount; index += 1) {
    const envelope = Math.sin((Math.PI * index) / frameCount)
    const sample =
      Math.sin((2 * Math.PI * frequency * index) / sampleRate) * envelope * volume

    pcm[index] = Math.max(-1, Math.min(1, sample)) * 0x7fff
  }

  const buffer = new ArrayBuffer(WAV_HEADER_SIZE + pcm.length * 2)
  const view = new DataView(buffer)

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + pcm.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, pcm.length * 2, true)

  pcm.forEach((sample, index) => {
    view.setInt16(WAV_HEADER_SIZE + index * 2, sample, true)
  })

  let binary = ''
  const bytes = new Uint8Array(buffer)

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }

  return `data:audio/wav;base64,${btoa(binary)}`
}

const cueLibrary = {
  stepComplete: encodeTone(720, 110),
  softClick: encodeTone(480, 75, 0.1),
}

export const createAudioCuePlayer = () => {
  const cache = new Map<keyof typeof cueLibrary, HTMLAudioElement>()

  return (name: keyof typeof cueLibrary) => {
    try {
      const audio = cache.get(name) ?? new Audio(cueLibrary[name])
      audio.currentTime = 0
      audio.volume = name === 'stepComplete' ? 0.28 : 0.18
      cache.set(name, audio)
      void audio.play()
    } catch {
      // Ignore autoplay and playback errors to keep navigation unblocked.
    }
  }
}
