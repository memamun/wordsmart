import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import './core/di/injection.dart' as di;
import './app.dart';

void main() async {
  // Ensure Flutter engine bindings are initialized prior to dependency injection setup
  WidgetsFlutterBinding.ensureInitialized();

  // Assemble Object Graph at Composition Root
  await di.init();

  runApp(const ProviderScope(child: WordSmartApp()));
}
