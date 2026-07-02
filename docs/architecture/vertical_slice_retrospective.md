# Vertical Slice Retrospective - Slice 1 (Search & Word Details)

### 1. Search screen-এ কোন component reuse করা গেল?
*   `WordSearchBar` (সার্চ ইনপুট ও স্টেট হ্যান্ডলিং)।
*   `SectionHeader` (হেডার সেকশন লেবেল)।
*   `FeaturedWordCard` (এক্সাক্ট ম্যাচ প্রদর্শনের মূল কার্ড)।
*   `WordListTile` (সার্চ রেজাল্ট লিস্ট আইটেম)।

### 2. Word Details-এ কোন widget generic করা যায়?
*   `BookmarkButton` এবং `AudioButton` সম্পূর্ণ জেনেরিক করা হয়েছে। এগুলো যেকোনো ওয়ার্ড ভিউ বা কার্ডে সরাসরি ব্যবহারযোগ্য।
*   `PrimaryButton` (ফিল্ড এবং আউটলাইন্ড স্টাইল সাপোর্ট করে যা স্টাডি ও কুইজ সেশনে সরাসরি রিইউজ হবে)।

### 3. কোন provider অন্য feature-এ ব্যবহারযোগ্য?
*   `wordDetailsNotifierProvider`: এটি পরবর্তী ফিচার স্লাইসগুলোতে (যেমন: Stories রিডার বা Study Session Drills) যেকোনো শব্দ ট্যাপ করলে ডিটেইলস পপআপ বা বটমশিট লোড করার জন্য সরাসরি রিইউজ করা যাবে।

### 4. Design System-এ নতুন token যোগ করা দরকার?
*   ১০% হোয়াইট ওভারলে সহ ব্যাকড্রপ ব্লার (10px) ও গ্লাস ইফেক্ট টোকেনটি গ্লোবাল ডিজাইন সিস্টেমে অফিসিয়ালি যুক্ত করা প্রয়োজন।

### 5. কোন API awkward লাগছে?
*   শুরুতে ডাটাবেজে উদাহরণ বাক্যের অনুবাদের জন্য আলাদা কুয়েরি (`getExampleTranslationsForWord`) চালানো হচ্ছিল। ডাটাবেজ মাইগ্রেশন আপডেট করে সরাসরি `word_examples` টেবিলে `translation` কলাম যোগ করার ফলে ডাটা লোডিং অত্যন্ত স্বাভাবিক ও ক্লিন হয়েছে।

### 6. কোন repository method split করা উচিত?
*   `WordRepository`-এর `getRandomCoreWord` মেথডটি ভবিষ্যতে `StudyRepository` বা `ReviewRepository`-তে সরানো যেতে পারে যদি আমরা ডিকশনারি রিপোজিটরির দায়ভার শুধুমাত্র শব্দ খোঁজার মধ্যে সীমাবদ্ধ রাখতে চাই। তবে প্রাথমিক বিল্ডের জন্য এটি এখানে রাখা উপযুক্ত।

### 7. কোন widget ভবিষ্যতে Home screen-এ reuse হবে?
*   `FeaturedWordCard`: হোম স্ক্রিনের "Word of the Day ⭐" ব্লকে শব্দটিকে হাইলাইট করতে ব্যবহৃত হবে।
*   `WordSearchBar`: হোম স্ক্রিনের শীর্ষে সার্চ ট্রিগার করার জন্য রিইউজ করা হবে।

---

# Vertical Slice Retrospective - Slice 2 (Review Engine)

### 1. What should remain unchanged?
- The decoupled **pure Dart domain model** strategy (`SM2Engine`, `LearningSignalAnalyzer`, `ReviewScheduler`, `ReviewQueueBuilder`) has zero Flutter/Riverpod/SQLite references. It is highly testable and must remain unchanged.

### 2. What became reusable?
- The `QueuePolicy` strategy interface and `DailyReviewPolicy` are reusable. We can create SAT, GRE, or Weak Words focus policies without changing `ReviewQueueBuilder`.
- The `ReviewRating` enum (quality scores 0-5) is reusable across quiz attempts and other vertical slices.

### 3. What should move to core?
- **Failure classes**: `DatabaseFailure` should be standardized in `core/error/failures.dart`.
- The **3D perspective rotation matrix utility** (`Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(value)`) should be moved to a shared design system animation utility class.

### 4. What slowed development?
- Distinguishing between "new words" (never reviewed) and "scheduled cards" in SQLite left joins. Standardizing a flat `ReviewCardModel` database read mapping resolved this complexity.

### 5. Which abstractions proved unnecessary?
- Creating a separate `DashboardRepository` or `DashboardEntity` was avoided. Composing dynamic stats inside the presentation layer from single-responsibility use cases worked perfectly.

### 6. What should Slice 3 inherit?
- The use case structure returns clean `Either<Failure, TResult>` responses.
- The separation of raw SQL strings into a dedicated queries file (`ReviewQueries`) for auditability.
- AutoDispose state-machine Riverpod Notifiers that orchestrate UI flow without containing mathematical formula calculations.

