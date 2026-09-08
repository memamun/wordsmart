package io.github.memamun.wordsmart

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import io.github.memamun.wordsmart.data.local.DefaultDataSeeder
import io.github.memamun.wordsmart.data.local.WordSmartDatabase
import io.github.memamun.wordsmart.domain.srs.SrsRating
import io.github.memamun.wordsmart.domain.srs.SuperMemo2Engine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("WordSmart", appName)
  }

  @Test
  fun `verify SuperMemo2Engine interval calculation on perfect recall`() {
    // Initial state: repetitions = 0, interval = 1, ease = 2.5
    val result1 = SuperMemo2Engine.calculate(
      previousRepetitions = 0,
      previousIntervalDays = 1,
      previousEasinessFactor = 2.5f,
      rating = SrsRating.EASY
    )
    assertEquals(1, result1.repetitionCount)
    assertEquals(1, result1.intervalDays)
    assertTrue(result1.easinessFactor >= 2.5f)

    // Second review
    val result2 = SuperMemo2Engine.calculate(
      previousRepetitions = result1.repetitionCount,
      previousIntervalDays = result1.intervalDays,
      previousEasinessFactor = result1.easinessFactor,
      rating = SrsRating.EASY
    )
    assertEquals(2, result2.repetitionCount)
    assertEquals(6, result2.intervalDays)

    // Third review
    val result3 = SuperMemo2Engine.calculate(
      previousRepetitions = result2.repetitionCount,
      previousIntervalDays = result2.intervalDays,
      previousEasinessFactor = result2.easinessFactor,
      rating = SrsRating.GOOD
    )
    assertEquals(3, result3.repetitionCount)
    assertTrue(result3.intervalDays >= 14)
  }

  @Test
  fun `verify SuperMemo2Engine reset on fail`() {
    val failedResult = SuperMemo2Engine.calculate(
      previousRepetitions = 4,
      previousIntervalDays = 30,
      previousEasinessFactor = 2.5f,
      rating = SrsRating.AGAIN
    )
    assertEquals(0, failedResult.repetitionCount)
    assertEquals(1, failedResult.intervalDays)
    assertTrue(failedResult.easinessFactor < 2.5f)
  }

  @Test
  fun `verify default seed data has words and roots`() {
    assertTrue(DefaultDataSeeder.getInitialWords().isNotEmpty())
    assertTrue(DefaultDataSeeder.getInitialRoots().isNotEmpty())
    assertTrue(DefaultDataSeeder.getInitialExamples().isNotEmpty())
    assertTrue(DefaultDataSeeder.getInitialSynonyms().isNotEmpty())
  }

  @Test
  fun `verify WordSmartDatabase can open and query asset database`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val db = WordSmartDatabase.getInstance(context)
    val words = kotlinx.coroutines.runBlocking { db.wordDao().getWordById(1) }
    org.junit.Assert.assertNotNull(words)
  }
}

