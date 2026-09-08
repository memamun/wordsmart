package io.github.memamun.wordsmart.util

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

/**
 * Lightweight, zero-latency SoundPool audio manager for WordSmart.
 * Programmatically synthesizes polished, harmonious sound cues to ensure 100% offline reliability.
 */
class SoundEffectHelper private constructor(context: Context) {
    private val soundPool: SoundPool
    private var correctSoundId: Int = 0
    private var wrongSoundId: Int = 0
    private var flipSoundId: Int = 0
    private var tickSoundId: Int = 0
    private var isReady: Boolean = false

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(6)
            .setAudioAttributes(audioAttributes)
            .build()

        soundPool.setOnLoadCompleteListener { _, _, status ->
            if (status == 0) {
                isReady = true
            }
        }

        try {
            val cacheDir = context.cacheDir
            val correctFile = generateWav(cacheDir, "wordsmart_chime.wav", ::synthesizeHarmoniousChime)
            val wrongFile = generateWav(cacheDir, "wordsmart_thud.wav", ::synthesizeLowThud)
            val flipFile = generateWav(cacheDir, "wordsmart_whoosh.wav", ::synthesizeWhoosh)
            val tickFile = generateWav(cacheDir, "wordsmart_tick.wav", ::synthesizeSubtleTick)

            correctSoundId = soundPool.load(correctFile.absolutePath, 1)
            wrongSoundId = soundPool.load(wrongFile.absolutePath, 1)
            flipSoundId = soundPool.load(flipFile.absolutePath, 1)
            tickSoundId = soundPool.load(tickFile.absolutePath, 1)
        } catch (e: Exception) {
            Log.e("SoundEffectHelper", "Failed to initialize synthesized audio cues", e)
        }
    }

    /** Harmonious melodic chime for correct answers and mastery achievements */
    fun playCorrect() {
        if (correctSoundId != 0) {
            soundPool.play(correctSoundId, 0.9f, 0.9f, 2, 0, 1.0f)
        }
    }

    /** Gentle low thud for incorrect answers or 'Again' rating */
    fun playWrong() {
        if (wrongSoundId != 0) {
            soundPool.play(wrongSoundId, 0.8f, 0.8f, 2, 0, 1.0f)
        }
    }

    /** Crisp card whoosh for 3D flip card interactions */
    fun playFlip() {
        if (flipSoundId != 0) {
            soundPool.play(flipSoundId, 0.7f, 0.7f, 1, 0, 1.0f)
        }
    }

    /** Subtle countdown tick in the final 10 seconds of Time Blitz */
    fun playTick() {
        if (tickSoundId != 0) {
            soundPool.play(tickSoundId, 0.6f, 0.6f, 1, 0, 1.0f)
        }
    }

    fun release() {
        soundPool.release()
    }

    companion object {
        @Volatile
        private var instance: SoundEffectHelper? = null

        fun getInstance(context: Context): SoundEffectHelper {
            return instance ?: synchronized(this) {
                instance ?: SoundEffectHelper(context.applicationContext).also { instance = it }
            }
        }

        private const val SAMPLE_RATE = 44100

        private fun generateWav(dir: File, fileName: String, synth: () -> ShortArray): File {
            val file = File(dir, fileName)
            if (file.exists() && file.length() > 44) return file
            val samples = synth()
            val byteCount = samples.size * 2
            val totalSize = 36 + byteCount

            val buffer = ByteBuffer.allocate(44 + byteCount).order(ByteOrder.LITTLE_ENDIAN)
            // RIFF header
            buffer.put("RIFF".toByteArray())
            buffer.putInt(totalSize)
            buffer.put("WAVE".toByteArray())
            // fmt chunk
            buffer.put("fmt ".toByteArray())
            buffer.putInt(16) // Subchunk1Size for PCM
            buffer.putShort(1) // AudioFormat: PCM = 1
            buffer.putShort(1) // NumChannels: Mono = 1
            buffer.putInt(SAMPLE_RATE) // SampleRate
            buffer.putInt(SAMPLE_RATE * 2) // ByteRate: SampleRate * NumChannels * BitsPerSample/8
            buffer.putShort(2) // BlockAlign: NumChannels * BitsPerSample/8
            buffer.putShort(16) // BitsPerSample: 16 bits
            // data chunk
            buffer.put("data".toByteArray())
            buffer.putInt(byteCount)
            for (sample in samples) {
                buffer.putShort(sample)
            }

            FileOutputStream(file).use { fos ->
                fos.write(buffer.array())
            }
            return file
        }

        /** C Major triad arpeggio chime (C5 523Hz, E5 659Hz, G5 784Hz, C6 1046Hz) */
        private fun synthesizeHarmoniousChime(): ShortArray {
            val durationSec = 0.45
            val sampleCount = (SAMPLE_RATE * durationSec).toInt()
            val samples = ShortArray(sampleCount)
            val freqs = doubleArrayOf(523.25, 659.25, 783.99, 1046.50)

            for (i in 0 until sampleCount) {
                val t = i.toDouble() / SAMPLE_RATE
                var mixed = 0.0
                for ((idx, f) in freqs.withIndex()) {
                    val noteStart = idx * 0.06
                    if (t >= noteStart) {
                        val noteT = t - noteStart
                        val envelope = exp(-noteT * 7.5) * sin(2.0 * PI * f * noteT)
                        mixed += envelope
                    }
                }
                mixed = (mixed / freqs.size).coerceIn(-1.0, 1.0)
                samples[i] = (mixed * 28000).toInt().toShort()
            }
            return samples
        }

        /** Gentle, warm low thud (140Hz downward sweep to 60Hz) */
        private fun synthesizeLowThud(): ShortArray {
            val durationSec = 0.22
            val sampleCount = (SAMPLE_RATE * durationSec).toInt()
            val samples = ShortArray(sampleCount)

            for (i in 0 until sampleCount) {
                val t = i.toDouble() / SAMPLE_RATE
                val freq = 140.0 - (80.0 * (t / durationSec))
                val envelope = exp(-t * 16.0)
                val wave = sin(2.0 * PI * freq * t) * envelope
                samples[i] = (wave.coerceIn(-1.0, 1.0) * 24000).toInt().toShort()
            }
            return samples
        }

        /** Quick card flip whoosh */
        private fun synthesizeWhoosh(): ShortArray {
            val durationSec = 0.14
            val sampleCount = (SAMPLE_RATE * durationSec).toInt()
            val samples = ShortArray(sampleCount)

            for (i in 0 until sampleCount) {
                val t = i.toDouble() / durationSec
                // Smooth bell curve envelope
                val envelope = sin(PI * t)
                val noise = (Math.random() * 2.0 - 1.0) * 0.4
                val centerFreq = 500.0 + 800.0 * sin(PI * t)
                val wave = sin(2.0 * PI * centerFreq * (i.toDouble() / SAMPLE_RATE)) * 0.6
                val total = (noise + wave) * envelope
                samples[i] = (total.coerceIn(-1.0, 1.0) * 22000).toInt().toShort()
            }
            return samples
        }

        /** Subtle clock tick click (1200Hz transient burst) */
        private fun synthesizeSubtleTick(): ShortArray {
            val durationSec = 0.02
            val sampleCount = (SAMPLE_RATE * durationSec).toInt()
            val samples = ShortArray(sampleCount)

            for (i in 0 until sampleCount) {
                val t = i.toDouble() / durationSec
                val envelope = exp(-t * 8.0)
                val wave = sin(2.0 * PI * 1200.0 * (i.toDouble() / SAMPLE_RATE)) * envelope
                samples[i] = (wave.coerceIn(-1.0, 1.0) * 20000).toInt().toShort()
            }
            return samples
        }
    }
}
