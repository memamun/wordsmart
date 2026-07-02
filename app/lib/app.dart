import 'package:flutter/material.dart';
import 'core/design_system/tokens/app_colors.dart';
import 'core/navigation/home_page.dart';

class WordSmartApp extends StatelessWidget {
  const WordSmartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WordSmart',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.canvas,
        colorScheme: ColorScheme.dark(
          primary: AppColors.primary,
          secondary: AppColors.warning,
          surface: AppColors.surface,
        ),
      ),
      home: const HomePage(),
    );
  }
}
