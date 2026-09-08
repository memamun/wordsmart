package io.github.memamun.wordsmart

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import io.github.memamun.wordsmart.data.local.WordSmartDatabase
import io.github.memamun.wordsmart.data.repository.UserStatsRepository
import io.github.memamun.wordsmart.data.repository.WordRepository
import io.github.memamun.wordsmart.ui.components.TtsHelper
import io.github.memamun.wordsmart.ui.navigation.WordSmartNavHost
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private var ttsHelper: TtsHelper? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val database = WordSmartDatabase.getInstance(this)
        val wordRepository = WordRepository(
            wordDao = database.wordDao(),
            progressDao = database.progressDao(),
            mcqQuizDao = database.mcqQuizDao(),
            contextualStoryDao = database.contextualStoryDao(),
            rootDao = database.rootDao()
        )
        val userStatsRepository = UserStatsRepository(this)
        val tts = TtsHelper(this)
        ttsHelper = tts

        setContent {
            val themeMode by userStatsRepository.themeModeFlow.collectAsState(initial = "dark")
            val systemDark = isSystemInDarkTheme()
            val isDark = when (themeMode) {
                "light" -> false
                "dark" -> true
                else -> systemDark
            }
            val coroutineScope = rememberCoroutineScope()

            LaunchedEffect(isDark) {
                enableEdgeToEdge(
                    statusBarStyle = if (isDark) {
                        SystemBarStyle.dark(android.graphics.Color.TRANSPARENT)
                    } else {
                        SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT)
                    },
                    navigationBarStyle = if (isDark) {
                        SystemBarStyle.dark(android.graphics.Color.TRANSPARENT)
                    } else {
                        SystemBarStyle.light(android.graphics.Color.TRANSPARENT, android.graphics.Color.TRANSPARENT)
                    }
                )
            }

            WordSmartTheme(darkTheme = isDark) {
                WordSmartNavHost(
                    wordRepository = wordRepository,
                    userStatsRepository = userStatsRepository,
                    ttsHelper = tts,
                    isDarkTheme = isDark,
                    onToggleTheme = {
                        coroutineScope.launch {
                            val newMode = if (isDark) "light" else "dark"
                            userStatsRepository.setThemeMode(newMode)
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ttsHelper?.shutdown()
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(text = "Hello $name!", modifier = modifier)
}
