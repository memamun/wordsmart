import 'package:flutter/material.dart';

class WordSmartApp extends StatelessWidget {
  const WordSmartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'WordSmart',
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Text(
            'WordSmart Foundation Ready',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
      ),
    );
  }
}
