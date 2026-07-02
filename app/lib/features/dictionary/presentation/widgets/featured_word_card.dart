import 'dart:ui';
import 'package:flutter/material.dart';
import '../../domain/entities/word.dart';
import '../../../../core/design_system/buttons/audio_button.dart';
import '../../../../core/design_system/buttons/bookmark_button.dart';

class FeaturedWordCard extends StatelessWidget {
  final Word word;
  final bool isBookmarked;
  final ValueChanged<bool> onBookmarkToggle;
  final VoidCallback onAudioPressed;
  final VoidCallback onTap;

  const FeaturedWordCard({
    super.key,
    required this.word,
    required this.isBookmarked,
    required this.onBookmarkToggle,
    required this.onAudioPressed,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E).withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFFB900).withOpacity(0.06),
              blurRadius: 20,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(
            color: Colors.white.withOpacity(0.05),
            width: 1,
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Part of Speech Chip
                      if (word.partOfSpeech != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF26A69A).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            word.partOfSpeech!.toUpperCase(),
                            style: const TextStyle(
                              fontFamily: 'JetBrains Mono',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF26A69A),
                            ),
                          ),
                        )
                      else
                        const SizedBox.shrink(),
                      
                      // Actions (Audio & Bookmark)
                      Row(
                        children: [
                          AudioButton(onPressed: onAudioPressed),
                          const SizedBox(width: 8),
                          BookmarkButton(
                            isBookmarked: isBookmarked,
                            onToggle: onBookmarkToggle,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Word Headword
                  Text(
                    word.word.toUpperCase(),
                    style: const TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 40,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFFFB900), // Amber
                      letterSpacing: -0.5,
                    ),
                  ),
                  
                  // Phonetic Guide
                  if (word.pronunciation != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      word.pronunciation!,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF26A69A), // Teal
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: 16),
                  const Divider(color: Colors.white10, height: 1),
                  const SizedBox(height: 16),
                  
                  // Bengali Meaning
                  if (word.bengaliMeaning != null) ...[
                    Text(
                      word.bengaliMeaning!,
                      style: const TextStyle(
                        fontFamily: 'Hind Siliguri',
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFFF5F5F5), // off-white
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  
                  // English Definition
                  if (word.definition != null)
                    Text(
                      word.definition!,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: Color(0xFFB0B0B0), // muted definition
                        height: 1.4,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
