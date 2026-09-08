package io.github.memamun.wordsmart.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class LeaderboardEntry(
    val id: String,
    val name: String,
    val xp: Int,
    val level: Int = 1,
    val streak: Int = 0,
    val photoUrl: String? = null,
    val isCurrentUser: Boolean = false
)

data class LeaderboardResult(
    val entries: List<LeaderboardEntry>,
    val isFromCloud: Boolean
)

class LeaderboardRepository(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()
) {
    companion object {
        private const val FIRESTORE_USERS_URL =
            "https://firestore.googleapis.com/v1/projects/wordsmart-vocab-76/databases/(default)/documents/users?pageSize=50"
    }

    suspend fun fetchGlobalLeaderboard(
        currentUserXp: Int,
        currentStreak: Int,
        currentLevel: Int
    ): LeaderboardResult = withContext(Dispatchers.IO) {
        val userEntry = LeaderboardEntry(
            id = "current_user",
            name = "You (WordSmart Learner)",
            xp = currentUserXp,
            level = currentLevel,
            streak = currentStreak,
            isCurrentUser = true
        )

        try {
            val request = Request.Builder()
                .url(FIRESTORE_USERS_URL)
                .get()
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string().orEmpty()
                val json = JSONObject(responseBody)
                val docs = json.optJSONArray("documents")

                val fetchedList = mutableListOf<LeaderboardEntry>()
                if (docs != null) {
                    for (i in 0 until docs.length()) {
                        val doc = docs.getJSONObject(i)
                        val fullPath = doc.optString("name", "")
                        val docId = fullPath.substringAfterLast("/")
                        val fields = doc.optJSONObject("fields") ?: JSONObject()

                        val displayName = fields.optJSONObject("displayName")?.optString("stringValue")
                            ?.ifBlank { "WordSmart Learner" } ?: "WordSmart Learner"
                        val xp = fields.optJSONObject("xp")?.optString("integerValue")?.toIntOrNull() ?: 0
                        val level = fields.optJSONObject("level")?.optString("integerValue")?.toIntOrNull() ?: 1
                        val streak = fields.optJSONObject("streak")?.optString("integerValue")?.toIntOrNull() ?: 0
                        val photoUrl = fields.optJSONObject("photoURL")?.optString("stringValue")

                        fetchedList.add(
                            LeaderboardEntry(
                                id = docId,
                                name = displayName,
                                xp = xp,
                                level = level,
                                streak = streak,
                                photoUrl = photoUrl,
                                isCurrentUser = false
                            )
                        )
                    }
                }

                if (fetchedList.isNotEmpty()) {
                    val mergedList = fetchedList.filterNot { it.id == userEntry.id }.toMutableList()
                    mergedList.add(userEntry)
                    return@withContext LeaderboardResult(
                        entries = mergedList.sortedByDescending { it.xp },
                        isFromCloud = true
                    )
                }
            }
        } catch (e: Exception) {
            // Fallback to offline / default list gracefully
        }

        // Default / offline fallback list matching real test-takers
        val fallbackList = mutableListOf(
            LeaderboardEntry("1", "Dipto", 4635, 1, 1),
            LeaderboardEntry("2", "Ahir Taslim Supto", 3545, 3, 4),
            LeaderboardEntry("3", "Irfanur Rahman", 2575, 1, 3),
            LeaderboardEntry("4", "Sojib kumer", 1180, 1, 1),
            LeaderboardEntry("5", "soumyo chakma", 1115, 1, 1),
            LeaderboardEntry("6", "Mst. Najia Akther", 685, 1, 1),
            LeaderboardEntry("7", "Your Captain", 270, 1, 2)
        )
        fallbackList.add(userEntry)
        return@withContext LeaderboardResult(
            entries = fallbackList.sortedByDescending { it.xp },
            isFromCloud = false
        )
    }
}

