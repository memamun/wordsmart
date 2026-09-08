package io.github.memamun.wordsmart.data.repository

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "user_stats_prefs")

data class UserStats(
    val xp: Int = 420,
    val coins: Int = 150,
    val streakDays: Int = 4,
    val hearts: Int = 5,
    val wordsLearnedToday: Int = 14,
    val dailyGoalTarget: Int = 20,
    val lastActiveTimestamp: Long = System.currentTimeMillis()
)

class UserStatsRepository(private val context: Context) {
    companion object {
        private val KEY_XP = intPreferencesKey("key_xp")
        private val KEY_COINS = intPreferencesKey("key_coins")
        private val KEY_STREAK = intPreferencesKey("key_streak")
        private val KEY_HEARTS = intPreferencesKey("key_hearts")
        private val KEY_WORDS_TODAY = intPreferencesKey("key_words_today")
        private val KEY_LAST_ACTIVE = longPreferencesKey("key_last_active")
        private val KEY_THEME_MODE = stringPreferencesKey("key_theme_mode")
    }

    val themeModeFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_THEME_MODE] ?: "dark"
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_THEME_MODE] = mode
        }
    }

    val userStatsFlow: Flow<UserStats> = context.dataStore.data.map { prefs ->
        UserStats(
            xp = prefs[KEY_XP] ?: 420,
            coins = prefs[KEY_COINS] ?: 150,
            streakDays = prefs[KEY_STREAK] ?: 4,
            hearts = prefs[KEY_HEARTS] ?: 5,
            wordsLearnedToday = prefs[KEY_WORDS_TODAY] ?: 14,
            dailyGoalTarget = 20,
            lastActiveTimestamp = prefs[KEY_LAST_ACTIVE] ?: System.currentTimeMillis()
        )
    }

    suspend fun addXp(amount: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_XP] ?: 420
            prefs[KEY_XP] = current + amount
        }
    }

    suspend fun addCoins(amount: Int) {
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_COINS] ?: 150
            prefs[KEY_COINS] = current + amount
        }
    }

    suspend fun incrementStreak() {
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_STREAK] ?: 4
            prefs[KEY_STREAK] = current + 1
            prefs[KEY_LAST_ACTIVE] = System.currentTimeMillis()
        }
    }

    suspend fun deductHeart(): Boolean {
        var hasHeartsRemaining = false
        context.dataStore.edit { prefs ->
            val current = prefs[KEY_HEARTS] ?: 5
            if (current > 0) {
                prefs[KEY_HEARTS] = current - 1
                hasHeartsRemaining = (current - 1) > 0
            } else {
                hasHeartsRemaining = false
            }
        }
        return hasHeartsRemaining
    }

    suspend fun refillHearts() {
        context.dataStore.edit { prefs ->
            prefs[KEY_HEARTS] = 5
        }
    }

    suspend fun resetAllProgress() {
        context.dataStore.edit { prefs ->
            prefs[KEY_XP] = 0
            prefs[KEY_COINS] = 50
            prefs[KEY_STREAK] = 1
            prefs[KEY_HEARTS] = 5
            prefs[KEY_LAST_ACTIVE] = System.currentTimeMillis()
        }
    }
}
