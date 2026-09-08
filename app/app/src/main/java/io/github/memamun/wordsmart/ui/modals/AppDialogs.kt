package io.github.memamun.wordsmart.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SheetState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.memamun.wordsmart.ui.theme.ThemeCyan
import io.github.memamun.wordsmart.ui.theme.ThemeOrange
import io.github.memamun.wordsmart.ui.theme.ThemePurple
import io.github.memamun.wordsmart.ui.theme.ThemeRed
import io.github.memamun.wordsmart.ui.theme.ThemeYellow
import io.github.memamun.wordsmart.ui.theme.WordSmartTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthGateModalSheet(
    sheetState: SheetState,
    onSignInWithGoogle: () -> Unit,
    onContinueAsGuest: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = WordSmartTheme.colors

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = colors.canvas,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .size(width = 36.dp, height = 4.dp)
                    .clip(CircleShape)
                    .background(colors.borderMuted)
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(colors.surfaceElevated)
                    .border(1.dp, ThemeCyan, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CloudSync,
                    contentDescription = "Sync",
                    tint = ThemeCyan,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Unlock WordSmart Cloud Sync",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = colors.textPrimary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Sign in to backup your Spaced Repetition SRS schedules, synchronize XP across web and mobile, and unlock Units 2 through 10 on the Prep Roadmap!",
                fontSize = 14.sp,
                color = colors.textSecondary,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = {
                    onSignInWithGoogle()
                    onDismiss()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ThemeCyan,
                    contentColor = if (colors.isDark) colors.canvas else Color.White
                )
            ) {
                Text(
                    text = "Continue with Google",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            TextButton(
                onClick = {
                    onContinueAsGuest()
                    onDismiss()
                }
            ) {
                Text(
                    text = "Continue Offline as Guest",
                    color = colors.textMuted,
                    fontSize = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
fun QuizExitConfirmDialog(
    onConfirmExit: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = WordSmartTheme.colors

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        titleContentColor = colors.textPrimary,
        textContentColor = colors.textSecondary,
        icon = {
            Icon(
                imageVector = Icons.Default.Warning,
                contentDescription = null,
                tint = ThemeOrange,
                modifier = Modifier.size(32.dp)
            )
        },
        title = {
            Text(
                text = "Leave Quiz?",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Text(
                text = "Your answers and streak multiplier for this test attempt will not be recorded if you leave now.",
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = ThemeCyan,
                    contentColor = if (colors.isDark) colors.canvas else Color.White
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Keep Going", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onConfirmExit) {
                Text("Quit Quiz", color = ThemeRed)
            }
        }
    )
}

@Composable
fun StartFreshDialog(
    onConfirmReset: () -> Unit,
    onDismiss: () -> Unit
) {
    val colors = WordSmartTheme.colors

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.surface,
        titleContentColor = colors.textPrimary,
        textContentColor = colors.textSecondary,
        icon = {
            Icon(
                imageVector = Icons.Default.Refresh,
                contentDescription = null,
                tint = ThemeRed,
                modifier = Modifier.size(32.dp)
            )
        },
        title = {
            Text(
                text = "Reset All Progress?",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        },
        text = {
            Text(
                text = "This will reset your Spaced Repetition SRS deck, current streak, and XP milestones back to Day 1. Are you sure you want to start fresh?",
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        },
        confirmButton = {
            Button(
                onClick = {
                    onConfirmReset()
                    onDismiss()
                },
                colors = ButtonDefaults.buttonColors(containerColor = ThemeRed, contentColor = Color.White),
                shape = RoundedCornerShape(10.dp)
            ) {
                Text("Reset Everything", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = colors.textMuted)
            }
        }
    )
}
