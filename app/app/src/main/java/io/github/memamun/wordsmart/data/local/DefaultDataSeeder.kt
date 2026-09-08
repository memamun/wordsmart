package io.github.memamun.wordsmart.data.local

import io.github.memamun.wordsmart.data.local.entity.RootEntity
import io.github.memamun.wordsmart.data.local.entity.WordAntonymEntity
import io.github.memamun.wordsmart.data.local.entity.WordCollocationEntity
import io.github.memamun.wordsmart.data.local.entity.WordEntity
import io.github.memamun.wordsmart.data.local.entity.WordExampleEntity
import io.github.memamun.wordsmart.data.local.entity.WordRootCrossRef
import io.github.memamun.wordsmart.data.local.entity.WordSynonymEntity

object DefaultDataSeeder {
    fun getInitialWords(): List<WordEntity> = listOf(
        // Stage 1: Beginner Foundations I (Units 1-2)
        WordEntity(
            id = 1,
            word = "Eloquent",
            pronunciation = "/ˈel.ə.kwənt/",
            partOfSpeech = "adj",
            definition = "Fluent or persuasive in speaking or writing; vividly expressive.",
            bengaliMeaning = "বাগ্মী, প্রাঞ্জল ও হৃদয়গ্রাহী বক্তা",
            mnemonic = "Sounds like 'E-fluent' (electric fluent speaker).",
            level = "beginner",
            audio = "eloquent.mp3",
            stage = 1,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 2,
            word = "Benevolent",
            pronunciation = "/bəˈnev.əl.ənt/",
            partOfSpeech = "adj",
            definition = "Well meaning and kindly; serving a charitable purpose.",
            bengaliMeaning = "দয়ালু, পরোপকারী, বদান্য",
            mnemonic = "'Bene' means good, 'vol' means wish -> wishing good to others.",
            level = "beginner",
            audio = "benevolent.mp3",
            stage = 1,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 3,
            word = "Lucid",
            pronunciation = "/ˈluː.sɪd/",
            partOfSpeech = "adj",
            definition = "Expressed clearly; easy to understand; completely intelligible.",
            bengaliMeaning = "সহজবোধ্য, স্পষ্ট, পরিষ্কার",
            mnemonic = "'Lucy' shines bright light -> clear and bright.",
            level = "beginner",
            audio = "lucid.mp3",
            stage = 1,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 4,
            word = "Resilient",
            pronunciation = "/rɪˈzɪl.jənt/",
            partOfSpeech = "adj",
            definition = "Able to withstand or recover quickly from difficult conditions.",
            bengaliMeaning = "স্থিতিস্থাপক, প্রতিকূলতা জয় করতে সক্ষম",
            mnemonic = "Re-silient -> bounces back again and again.",
            level = "beginner",
            audio = "resilient.mp3",
            stage = 1,
            unit = 2,
            category = "general"
        ),
        WordEntity(
            id = 5,
            word = "Candid",
            pronunciation = "/ˈkæn.dɪd/",
            partOfSpeech = "adj",
            definition = "Truthful and straightforward; frank and unreserved.",
            bengaliMeaning = "অকপট, স্পষ্টবাদী, সরল",
            mnemonic = "A candid photograph is honest and unposed.",
            level = "beginner",
            audio = "candid.mp3",
            stage = 1,
            unit = 2,
            category = "general"
        ),

        // Stage 2: Beginner Foundations II (Units 1-2)
        WordEntity(
            id = 6,
            word = "Pragmatic",
            pronunciation = "/præɡˈmæt.ɪk/",
            partOfSpeech = "adj",
            definition = "Dealing with things sensibly and realistically in a practical way.",
            bengaliMeaning = "বাস্তবধর্মী, বাস্তবসম্মত",
            mnemonic = "PRA-ctical automatic approach.",
            level = "beginner",
            audio = "pragmatic.mp3",
            stage = 2,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 7,
            word = "Empathy",
            pronunciation = "/ˈem.pə.θi/",
            partOfSpeech = "n",
            definition = "The ability to understand and share the feelings of another.",
            bengaliMeaning = "সহমর্মিতা, অন্যের অনুভূতি উপলব্ধি করার ক্ষমতা",
            mnemonic = "Em (into) + Pathy (feelings) -> stepping into others' feelings.",
            level = "beginner",
            audio = "empathy.mp3",
            stage = 2,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 8,
            word = "Diligent",
            pronunciation = "/ˈdɪl.ɪ.dʒənt/",
            partOfSpeech = "adj",
            definition = "Having or showing care and conscientiousness in one's work.",
            bengaliMeaning = "পরিশ্রমী, অধ্যবসায়ী, যত্নবান",
            mnemonic = "Dili-gent (Delhi gents work tirelessly).",
            level = "beginner",
            audio = "diligent.mp3",
            stage = 2,
            unit = 2,
            category = "general"
        ),

        // Stage 3 & 4: Intermediate Core
        WordEntity(
            id = 9,
            word = "Circumspect",
            pronunciation = "/ˈsɜː.kəm.spekt/",
            partOfSpeech = "adj",
            definition = "Wary and unwilling to take risks; cautious and observant.",
            bengaliMeaning = "সতর্ক, দূরদর্শী, চতুর্দিকে দৃষ্টিসম্পন্ন",
            mnemonic = "Circum (around) + Spect (look) -> looking around cautiously.",
            level = "intermediate",
            audio = "circumspect.mp3",
            stage = 3,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 10,
            word = "Equivocate",
            pronunciation = "/ɪˈkwɪv.ə.keɪt/",
            partOfSpeech = "v",
            definition = "Use ambiguous language so as to conceal the truth or avoid committing oneself.",
            bengaliMeaning = "দ্ব্যর্থক কথা বলা, এড়িয়ে যাওয়ার ভঙ্গি করা",
            mnemonic = "Equi (equal) + Voice -> giving equal contradictory voices.",
            level = "intermediate",
            audio = "equivocate.mp3",
            stage = 4,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 11,
            word = "Anachronism",
            pronunciation = "/əˈnæk.rə.nɪ.zəm/",
            partOfSpeech = "n",
            definition = "A thing belonging or appropriate to a period other than that in which it exists.",
            bengaliMeaning = "কালবৈষম্য, সময়াভাব, বেমানান কালপ্রক্ষেপণ",
            mnemonic = "Ana (against) + Chron (time) -> against current timeline.",
            level = "intermediate",
            audio = "anachronism.mp3",
            stage = 4,
            unit = 2,
            category = "general"
        ),

        // Stage 5 & 6: Intermediate & Advanced Bridge
        WordEntity(
            id = 12,
            word = "Belligerent",
            pronunciation = "/bəˈlɪdʒ.ər.ənt/",
            partOfSpeech = "adj",
            definition = "Hostile and aggressive; engaged in war or conflict.",
            bengaliMeaning = "যুদ্ধংদেহী, আক্রমণাত্মক, বিবাদপ্রিয়",
            mnemonic = "Belli (war) + Gerent (carrying) -> carrying war intent.",
            level = "intermediate",
            audio = "belligerent.mp3",
            stage = 5,
            unit = 1,
            category = "general"
        ),
        WordEntity(
            id = 13,
            word = "Ephemeral",
            pronunciation = "/ɪˈfem.ər.əl/",
            partOfSpeech = "adj",
            definition = "Lasting for a very short time; transitory; fleeting.",
            bengaliMeaning = "ক্ষণস্থায়ী, স্বল্পায়ু",
            mnemonic = "Sounds like 'funeral' - life is fleeting.",
            level = "intermediate",
            audio = "ephemeral.mp3",
            stage = 6,
            unit = 1,
            category = "general"
        ),

        // Stage 7 & 8: Advanced Mastery
        WordEntity(
            id = 14,
            word = "Enervate",
            pronunciation = "/ˈen.ə.veɪt/",
            partOfSpeech = "v",
            definition = "Cause someone to feel drained of energy or vitality; weaken.",
            bengaliMeaning = "দুর্বল করা, শক্তিহীন করা",
            mnemonic = "Opposite of 'energize' -> drain nerve and energy.",
            level = "advanced",
            audio = "enervate.mp3",
            stage = 7,
            unit = 1,
            category = "hitparade"
        ),
        WordEntity(
            id = 15,
            word = "Loquacious",
            pronunciation = "/ləˈkweɪ.ʃəs/",
            partOfSpeech = "adj",
            definition = "Tending to talk a great deal; talkative; garrulous.",
            bengaliMeaning = "বাচাল, অতিরিক্ত কথা বলে এমন",
            mnemonic = "Loqu (speech) -> overflowing with words.",
            level = "advanced",
            audio = "loquacious.mp3",
            stage = 7,
            unit = 2,
            category = "hitparade"
        ),
        WordEntity(
            id = 16,
            word = "Ubiquitous",
            pronunciation = "/juːˈbɪk.wɪ.təs/",
            partOfSpeech = "adj",
            definition = "Present, appearing, or found everywhere; omnipresent.",
            bengaliMeaning = "সর্বব্যাপী, সর্বত্র বিরাজমান",
            mnemonic = "Ubi (where) + quitous -> everywhere you look.",
            level = "advanced",
            audio = "ubiquitous.mp3",
            stage = 8,
            unit = 1,
            category = "hitparade"
        ),

        // Stage 9 & 10: Advanced Mastery Virtuoso
        WordEntity(
            id = 17,
            word = "Pernicious",
            pronunciation = "/pəˈnɪʃ.əs/",
            partOfSpeech = "adj",
            definition = "Having a harmful effect, especially in a gradual or subtle way.",
            bengaliMeaning = "মারাত্মক ক্ষতিকর, অতি অনিষ্টকর",
            mnemonic = "Per-VICIOUS -> completely vicious in subtle disguise.",
            level = "advanced",
            audio = "pernicious.mp3",
            stage = 9,
            unit = 1,
            category = "hitparade"
        ),
        WordEntity(
            id = 18,
            word = "Esoteric",
            pronunciation = "/ˌes.əˈter.ɪk/",
            partOfSpeech = "adj",
            definition = "Intended for or likely to be understood by only a small number of people with specialized knowledge.",
            bengaliMeaning = "গূঢ়, নিগূঢ়, দুর্বোধ্য তত্ত্বীয়",
            mnemonic = "Historic/exotic secrets known to only an elite few.",
            level = "advanced",
            audio = "esoteric.mp3",
            stage = 10,
            unit = 1,
            category = "philosophy"
        ),

        // Specialized Vocab: Business
        WordEntity(
            id = 19,
            word = "Amortization",
            pronunciation = "/əˌmɔː.tɪˈzeɪ.ʃən/",
            partOfSpeech = "n",
            definition = "The action or process of gradually writing off the initial cost of an asset or loan repayment.",
            bengaliMeaning = "পরিশোধ কিস্তি, ঋণ বা মূলধনের ক্রমহ্রাসকরণ",
            mnemonic = "Mortic (death of debt) over scheduled intervals.",
            level = "advanced",
            audio = "amortization.mp3",
            stage = 6,
            unit = 2,
            category = "business"
        ),

        // Specialized Vocab: Legal
        WordEntity(
            id = 20,
            word = "Affidavit",
            pronunciation = "/ˌæf.ɪˈdeɪ.vɪt/",
            partOfSpeech = "n",
            definition = "A written statement confirmed by oath or affirmation, for use as evidence in court.",
            bengaliMeaning = "হলফনামা, শপথপত্র",
            mnemonic = "Affirm + David's testimony under oath.",
            level = "intermediate",
            audio = "affidavit.mp3",
            stage = 5,
            unit = 2,
            category = "legal"
        ),

        // Specialized Vocab: Medical
        WordEntity(
            id = 21,
            word = "Prognosis",
            pronunciation = "/prɒɡˈnəʊ.sɪs/",
            partOfSpeech = "n",
            definition = "The likely course of a disease or ailment; a forecast of the outcome.",
            bengaliMeaning = "রোগের ভবিষ্যৎ সম্ভাবনা বা পরিণতি পূর্বাভাস",
            mnemonic = "Pro (before) + Gnosis (knowing) -> knowing diagnosis outcome in advance.",
            level = "intermediate",
            audio = "prognosis.mp3",
            stage = 5,
            unit = 3,
            category = "medical"
        ),

        // Specialized Vocab: Literature
        WordEntity(
            id = 22,
            word = "Catharsis",
            pronunciation = "/kəˈθɑː.sɪs/",
            partOfSpeech = "n",
            definition = "The process of releasing, and thereby providing relief from, strong or repressed emotions.",
            bengaliMeaning = "আবেগের পরিশুদ্ধি, আত্মিক মোক্ষণ",
            mnemonic = "Cleansing the heart through artistic release.",
            level = "advanced",
            audio = "catharsis.mp3",
            stage = 8,
            unit = 2,
            category = "literature"
        )
    )

    fun getInitialExamples(): List<WordExampleEntity> = listOf(
        WordExampleEntity(wordId = 1, exampleText = "Her **eloquent** defense of human rights moved the entire auditorium to a standing ovation.", translation = "মানবাধিকারের পক্ষে তাঁর প্রাঞ্জল বক্তব্য পুরো মিলনায়তনকে অভিভূত করেছিল।"),
        WordExampleEntity(wordId = 1, exampleText = "The diplomat delivered an **eloquent** plea for peace across the border.", translation = "কূটনীতিক সীমান্তের ওপারে শান্তির জন্য একটি হৃদয়গ্রাহী আবেদন উপস্থাপন করেছিলেন।"),
        WordExampleEntity(wordId = 2, exampleText = "The **benevolent** donor funded fifty university scholarships for underprivileged students.", translation = "দয়ালু দাতা সুবিধাবঞ্চিত শিক্ষার্থীদের জন্য পঞ্চাশটি বিশ্ববিদ্যালয় বৃত্তি প্রদান করেছিলেন।"),
        WordExampleEntity(wordId = 3, exampleText = "The professor provided a **lucid** explanation of quantum entanglement without mathematical jargon.", translation = "অধ্যাপক কোনো জটিলতা ছাড়াই কোয়ান্টাম এনট্যাঙ্গলমেন্টের একটি সহজবোধ্য ব্যাখ্যা দিয়েছিলেন।"),
        WordExampleEntity(wordId = 4, exampleText = "Local economies proved remarkably **resilient** despite the prolonged global downturn.", translation = "দীর্ঘস্থায়ী বৈশ্বিক মন্দা সত্ত্বেও স্থানীয় অর্থনীতি আশ্চর্যজনকভাবে ঘুরে দাঁড়াতে পেরেছে।"),
        WordExampleEntity(wordId = 5, exampleText = "In a **candid** interview, the CEO admitted the company made strategic missteps.", translation = "একটি অকপট সাক্ষাৎকারে প্রধান নির্বাহী স্বীকার করেছেন যে প্রতিষ্ঠানটি কৌশলগত ভুল করেছে।"),
        WordExampleEntity(wordId = 6, exampleText = "We need a **pragmatic** solution that can be deployed today, rather than theoretical perfection.", translation = "তাত্ত্বিক নিখুঁততার চেয়ে আমাদের আজই কার্যকর করার মতো একটি বাস্তবসম্মত সমাধান দরকার।"),
        WordExampleEntity(wordId = 7, exampleText = "Active listening builds genuine **empathy** between divergent community groups.", translation = "মনোযোগ সহকারে শোনা বিভিন্ন জনগোষ্ঠীর মধ্যে পারস্পরিক সহমর্মিতা গড়ে তোলে।"),
        WordExampleEntity(wordId = 8, exampleText = "Her **diligent** research uncovered forgotten historical records from the archives.", translation = "তাঁর অধ্যবসায়ী গবেষণা আর্কাইভ থেকে বিস্মৃত ঐতিহাসিক নথি উদ্ধার করেছে।"),
        WordExampleEntity(wordId = 9, exampleText = "Officials took a **circumspect** approach before approving the experimental drug trial.", translation = "পরীক্ষামূলক ওষুধের ট্রায়াল অনুমোদনের আগে কর্মকর্তারা অত্যন্ত সতর্ক দৃষ্টিভঙ্গি গ্রহণ করেছিলেন।"),
        WordExampleEntity(wordId = 10, exampleText = "When asked about the budget deficit, the politician began to **equivocate**.", translation = "বাজেট ঘাটতি সম্পর্কে জিজ্ঞাসা করা হলে রাজনীতিবিদ দ্ব্যর্থকভাবে কথা বলতে শুরু করলেন।"),
        WordExampleEntity(wordId = 11, exampleText = "A sword depicted in a 19th-century tank battle was a glaring historical **anachronism**.", translation = "ঊনবিংশ শতাব্দীর ট্যাঙ্ক যুদ্ধে তলোয়ারের উপস্থিতি ছিল একটি স্পষ্ট ঐতিহাসিক কালবৈষম্য।"),
        WordExampleEntity(wordId = 12, exampleText = "The spokesperson's **belligerent** rhetoric escalated tensions at the summit.", translation = "মুখপাত্রের যুদ্ধংদেহী বক্তব্য সম্মেলনে উত্তেজনা বাড়িয়ে দিয়েছিল।"),
        WordExampleEntity(wordId = 13, exampleText = "The beauty of cherry blossoms is cherished precisely because it is so **ephemeral**.", translation = "চেরি ফুলের সৌন্দর্য এতো ক্ষণস্থায়ী বলেই তা এতো গভীরভাবে সমাদৃত হয়।"),
        WordExampleEntity(wordId = 14, exampleText = "The scorching tropical heat threatened to **enervate** the expedition crew.", translation = "প্রচণ্ড গ্রীষ্মমণ্ডলীয় তাপ অভিযাত্রী দলকে ক্লান্ত ও দুর্বল করে ফেলার উপক্রম করেছিল।"),
        WordExampleEntity(wordId = 15, exampleText = "The **loquacious** host kept the podcast lively with unending anecdotes.", translation = "বাচাল উপস্থাপক অফুরন্ত গল্প দিয়ে পডকাস্টকে প্রাণবন্ত রেখেছিলেন।"),
        WordExampleEntity(wordId = 16, exampleText = "Smartphones have become almost **ubiquitous** across modern urban life.", translation = "আধুনিক নগরজীবনে স্মার্টফোন এখন সর্বত্র বিরাজমান হয়ে উঠেছে।"),
        WordExampleEntity(wordId = 17, exampleText = "The **pernicious** influence of fake news eroded public trust in institutions.", translation = "ভুয়া সংবাদের মারাত্মক ক্ষতিকর প্রভাব প্রতিষ্ঠানের প্রতি জনগণের বিশ্বাসকে বিনষ্ট করেছে।"),
        WordExampleEntity(wordId = 18, exampleText = "Quantum chromodynamics remains an **esoteric** branch of theoretical physics.", translation = "কোয়ান্টাম ক্রোমোডাইনামিক্স তাত্ত্বিক পদার্থবিজ্ঞানের একটি নিগূঢ় ও দুর্বোধ্য শাখা।"),
        WordExampleEntity(wordId = 19, exampleText = "The loan agreement specifies an **amortization** schedule over twenty-five years.", translation = "ঋণ চুক্তিতে পঁচিশ বছরের ক্রমহ্রাসমান কিস্তি তালিকা নির্দিষ্ট করা হয়েছে।"),
        WordExampleEntity(wordId = 20, exampleText = "She signed a sworn **affidavit** confirming the authenticity of the contract.", translation = "তিনি চুক্তির সত্যতা নিশ্চিত করে একটি শপথপত্রে স্বাক্ষর করেছেন।"),
        WordExampleEntity(wordId = 21, exampleText = "With early diagnosis and treatment, the patient's **prognosis** is excellent.", translation = "দ্রুত রোগ নির্ণয় ও চিকিৎসার ফলে রোগীর আরোগ্যের সম্ভাবনা চমৎকার।"),
        WordExampleEntity(wordId = 22, exampleText = "Watching the tragic opera provided an overwhelming sense of emotional **catharsis**.", translation = "বিয়োগান্তক অপেরা দেখা দর্শকদের মাঝে এক গভীর মানসিক ও আত্মিক মুক্তির অনুভূতি এনে দেয়।")
    )

    fun getInitialSynonyms(): List<WordSynonymEntity> = listOf(
        WordSynonymEntity(wordId = 1, synonym = "Articulate"),
        WordSynonymEntity(wordId = 1, synonym = "Fluent"),
        WordSynonymEntity(wordId = 1, synonym = "Expressive"),
        WordSynonymEntity(wordId = 2, synonym = "Kindhearted"),
        WordSynonymEntity(wordId = 2, synonym = "Altruistic"),
        WordSynonymEntity(wordId = 2, synonym = "Philanthropic"),
        WordSynonymEntity(wordId = 3, synonym = "Transparent"),
        WordSynonymEntity(wordId = 3, synonym = "Coherent"),
        WordSynonymEntity(wordId = 4, synonym = "Tenacious"),
        WordSynonymEntity(wordId = 4, synonym = "Tough"),
        WordSynonymEntity(wordId = 5, synonym = "Frank"),
        WordSynonymEntity(wordId = 5, synonym = "Unfiltered"),
        WordSynonymEntity(wordId = 6, synonym = "Utilitarian"),
        WordSynonymEntity(wordId = 6, synonym = "Realistic"),
        WordSynonymEntity(wordId = 9, synonym = "Prudent"),
        WordSynonymEntity(wordId = 9, synonym = "Vigilant"),
        WordSynonymEntity(wordId = 10, synonym = "Prevaricate"),
        WordSynonymEntity(wordId = 10, synonym = "Vacillate"),
        WordSynonymEntity(wordId = 12, synonym = "Combative"),
        WordSynonymEntity(wordId = 12, synonym = "Pugnacious"),
        WordSynonymEntity(wordId = 13, synonym = "Transient"),
        WordSynonymEntity(wordId = 13, synonym = "Fleeting"),
        WordSynonymEntity(wordId = 14, synonym = "Debilitate"),
        WordSynonymEntity(wordId = 14, synonym = "Exhaust"),
        WordSynonymEntity(wordId = 15, synonym = "Garrulous"),
        WordSynonymEntity(wordId = 15, synonym = "Voluble"),
        WordSynonymEntity(wordId = 16, synonym = "Omnipresent"),
        WordSynonymEntity(wordId = 16, synonym = "Pervasive"),
        WordSynonymEntity(wordId = 17, synonym = "Deleterious"),
        WordSynonymEntity(wordId = 17, synonym = "Noxious"),
        WordSynonymEntity(wordId = 18, synonym = "Arcane"),
        WordSynonymEntity(wordId = 18, synonym = "Recondite")
    )

    fun getInitialAntonyms(): List<WordAntonymEntity> = listOf(
        WordAntonymEntity(wordId = 1, antonym = "Inarticulate"),
        WordAntonymEntity(wordId = 1, antonym = "Hesitant"),
        WordAntonymEntity(wordId = 2, antonym = "Malevolent"),
        WordAntonymEntity(wordId = 2, antonym = "Miserly"),
        WordAntonymEntity(wordId = 3, antonym = "Obscure"),
        WordAntonymEntity(wordId = 3, antonym = "Ambiguous"),
        WordAntonymEntity(wordId = 4, antonym = "Fragile"),
        WordAntonymEntity(wordId = 4, antonym = "Vulnerable"),
        WordAntonymEntity(wordId = 5, antonym = "Deceitful"),
        WordAntonymEntity(wordId = 5, antonym = "Guarded"),
        WordAntonymEntity(wordId = 6, antonym = "Idealistic"),
        WordAntonymEntity(wordId = 9, antonym = "Reckless"),
        WordAntonymEntity(wordId = 9, antonym = "Rash"),
        WordAntonymEntity(wordId = 10, antonym = "Confront"),
        WordAntonymEntity(wordId = 10, antonym = "Clarify"),
        WordAntonymEntity(wordId = 12, antonym = "Pacifist"),
        WordAntonymEntity(wordId = 12, antonym = "Peaceable"),
        WordAntonymEntity(wordId = 13, antonym = "Eternal"),
        WordAntonymEntity(wordId = 13, antonym = "Perpetual"),
        WordAntonymEntity(wordId = 14, antonym = "Invigorate"),
        WordAntonymEntity(wordId = 14, antonym = "Vitalize"),
        WordAntonymEntity(wordId = 15, antonym = "Taciturn"),
        WordAntonymEntity(wordId = 15, antonym = "Reticent"),
        WordAntonymEntity(wordId = 16, antonym = "Scarce"),
        WordAntonymEntity(wordId = 16, antonym = "Rare"),
        WordAntonymEntity(wordId = 17, antonym = "Beneficial"),
        WordAntonymEntity(wordId = 17, antonym = "Wholesome"),
        WordAntonymEntity(wordId = 18, antonym = "Commonplace"),
        WordAntonymEntity(wordId = 18, antonym = "Exoteric")
    )

    fun getInitialCollocations(): List<WordCollocationEntity> = listOf(
        WordCollocationEntity(wordId = 1, collocation = "Eloquent speaker"),
        WordCollocationEntity(wordId = 1, collocation = "Eloquent testimony"),
        WordCollocationEntity(wordId = 2, collocation = "Benevolent nature"),
        WordCollocationEntity(wordId = 2, collocation = "Benevolent dictator"),
        WordCollocationEntity(wordId = 3, collocation = "Lucid dream"),
        WordCollocationEntity(wordId = 3, collocation = "Lucid explanation"),
        WordCollocationEntity(wordId = 4, collocation = "Resilient community"),
        WordCollocationEntity(wordId = 4, collocation = "Resilient supply chain"),
        WordCollocationEntity(wordId = 6, collocation = "Pragmatic approach"),
        WordCollocationEntity(wordId = 6, collocation = "Pragmatic compromise"),
        WordCollocationEntity(wordId = 9, collocation = "Circumspect stance"),
        WordCollocationEntity(wordId = 12, collocation = "Belligerent tone"),
        WordCollocationEntity(wordId = 13, collocation = "Ephemeral pleasure"),
        WordCollocationEntity(wordId = 16, collocation = "Ubiquitous presence"),
        WordCollocationEntity(wordId = 17, collocation = "Pernicious effect")
    )

    fun getInitialRoots(): List<RootEntity> = listOf(
        RootEntity(id = 1, root = "bene-", meaning = "Good, well", origin = "Latin"),
        RootEntity(id = 2, root = "loqu / loc", meaning = "To speak, talk", origin = "Latin"),
        RootEntity(id = 3, root = "chron", meaning = "Time", origin = "Greek"),
        RootEntity(id = 4, root = "spect", meaning = "To look, examine", origin = "Latin"),
        RootEntity(id = 5, root = "bell", meaning = "War, fight", origin = "Latin"),
        RootEntity(id = 6, root = "path", meaning = "Feeling, suffering, emotion", origin = "Greek"),
        RootEntity(id = 7, root = "luc / lum", meaning = "Light, clear", origin = "Latin")
    )

    fun getInitialWordRoots(): List<WordRootCrossRef> = listOf(
        WordRootCrossRef(wordId = 1, rootId = 2), // Eloquent -> loqu
        WordRootCrossRef(wordId = 2, rootId = 1), // Benevolent -> bene
        WordRootCrossRef(wordId = 3, rootId = 7), // Lucid -> luc
        WordRootCrossRef(wordId = 7, rootId = 6), // Empathy -> path
        WordRootCrossRef(wordId = 9, rootId = 4), // Circumspect -> spect
        WordRootCrossRef(wordId = 10, rootId = 2), // Equivocate -> loqu/voc
        WordRootCrossRef(wordId = 11, rootId = 3), // Anachronism -> chron
        WordRootCrossRef(wordId = 12, rootId = 5), // Belligerent -> bell
        WordRootCrossRef(wordId = 15, rootId = 2)  // Loquacious -> loqu
    )
}
