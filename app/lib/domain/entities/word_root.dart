class WordRoot {
  final String root;
  final String meaning;

  const WordRoot({
    required this.root,
    required this.meaning,
  }) : assert(root.length > 0, 'Root cannot be empty.'),
       assert(meaning.length > 0, 'Root meaning cannot be empty.');
}
