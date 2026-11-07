// Interface text in English, Hausa and Arabic.
// The English text is the key. Hausa is a first draft: please correct it here.
// {name} placeholders are filled in by t(key, {name: value}).
const I18N = {
  ha: {
    "Previous verse": "Ayar baya",
    // review fixes
    "Tap 🎙 and recite anywhere — or double-tap a word to start from it": "Taɓa 🎙 ka karanta daga ko'ina — ko ka taɓa kalma sau biyu don farawa daga gare ta",
    "The microphone is blocked. Allow it for this page in Chrome: tap the lock icon next to the address, then Permissions → Microphone → Allow.": "An toshe makirufo. Ka ba da izini a Chrome: taɓa alamar makulli kusa da adireshin, sannan Izini → Makirufo → Bari.",
    "▶ Start here": "▶ Fara daga nan",
    "👁 Hide text": "👁 Ɓoye rubutu",
    "👁 Show text": "👁 Nuna rubutu",
    "Cancel": "Soke",
    "Yes": "Eh",
    "The whole text is shown.": "Ana nuna dukkan rubutun.",
    "Only each verse's first word is shown; the rest appears as you recite. Tap a word to peek.": "Kalmar farko ta kowace aya kawai ake nunawa; sauran suna bayyana yayin da kake karantawa. Taɓa kalma don lekawa.",
    "Each verse's first and last words are shown; the rest appears as you recite. Tap a word to peek.": "Ana nuna kalmomin farko da na ƙarshe na kowace aya; sauran suna bayyana yayin da kake karantawa. Taɓa kalma don lekawa.",
    "The text is hidden and appears as you recite. Tap a word to peek.": "An ɓoye rubutun, yana bayyana yayin da kake karantawa. Taɓa kalma don lekawa.",
    "That place is not in the Qur'an.": "Wannan wuri ba ya cikin Alƙur'ani.",
    "Something went wrong — please try again": "Wani abu ya faru ba daidai ba — sake gwadawa",
    "Storage is full — delete some old sessions": "Ma'ajiya ta cika — goge wasu tsofaffin zama",
    "Save my recordings": "Adana rikodina",
    "▶ Play session": "▶ Kunna zaman",
    "Practise these": "Yi bitar waɗannan",
    "▶ My recording": "▶ Rikodina",
    "Nothing to practise — Mā shāʾ Allāh": "Babu abin bita — Mā shā' Allāh",
    "{n} verses to practise": "Ayoyi {n} don bita",
    "Mā shāʾ Allāh — that was the last one": "Mā shā' Allāh — wannan ce ta ƙarshe",
    // sessions
    "🗂 Sessions": "🗂 Zama-zamai",
    "⏹ End session": "⏹ Kammala zama",
    "Sessions": "Zama-zamai",
    "Back to now": "Koma yanzu",
    "Memorise: first word": "Haddace: kalmar farko",
    "Memorise: first + last": "Haddace: farko + ƙarshe",
    "Memorise: hidden": "Haddace: a ɓoye",
    "Mixed": "Gauraye",
    "now": "yanzu",
    "{n} min": "minti {n}",
    "Review": "Duba",
    "Delete": "Goge",
    "Delete this session?": "A goge wannan zama?",
    "No sessions yet. Tap 🎙 and recite to start one.": "Babu zama tukuna. Taɓa 🎙 ka karanta don farawa.",
    "Reviewing {x}": "Ana duba {x}",
    "Session saved. The next one starts fresh.": "An adana zaman. Na gaba zai fara sabo.",
    // header, sections, menu
    "Read": "Karanta",
    "Practise": "Bita",
    "Go to a surah or page": "Zapa sura ko shafi",
    "More": "Ƙari",
    "View": "Yanayi",
    "Pages": "Shafuka",
    "Scroll": "Gungurawa",
    "Memorise": "Haddace",
    "Off": "A kashe",
    "First word": "Kalmar farko",
    "First + last": "Farko + ƙarshe",
    "Hidden": "A ɓoye",
    "Pace": "Sauri",
    "Any valid pace": "Kowane sauri mai inganci",
    "Ḥadr (fast)": "Hadr (da sauri)",
    "Tadwīr (medium)": "Tadwir (matsakaici)",
    "Taḥqīq (slow)": "Tahqiq (a hankali)",
    "Language": "Harshe",
    "❔ How it works": "❔ Yadda yake aiki",
    "◐ Light / dark": "◐ Haske / duhu",
    "🎧 Play a recording": "🎧 Kunna rikodi",
    "↺ Clear all colours": "↺ Goge duk launuka",
    "correct": "daidai",
    "you are here": "kana nan",
    "tajweed detail": "ƙaramin kuskuren tajwidi",
    "check this word": "duba wannan kalma",
    "Page {n}": "Shafi {n}",
    "Next page": "Shafi na gaba",
    "Previous page": "Shafin baya",
    "Start reciting": "Fara karatu",
    "Stop": "Tsaya",
    // status (including the server's)
    "Connecting…": "Ana haɗawa…",
    "Ready — tap 🎙 and recite": "An shirya — taɓa 🎙 ka fara karatu",
    "Ready. Start reciting anywhere.": "An shirya — taɓa 🎙 ka fara karatu",
    "Not connected — retrying…": "Babu haɗi — ana sake gwadawa…",
    "Listening… start anywhere": "Ana saurare… fara daga ko'ina",
    "Listening…": "Ana saurare…",
    "Listening… (no match yet)": "Ana saurare… (ba a gano ba tukuna)",
    "Matches {n} places — keep going…": "Ya dace da wurare {n} — ci gaba…",
    "Found you: {x}": "An gano ka: {x}",
    "Start from here: {x}": "Fara daga nan: {x}",
    "Finding your place nearby…": "Ana neman inda kake a kusa…",
    "End of the Qur'an. Ma shaa Allah!": "Ƙarshen Alƙur'ani. Mā shā' Allāh!",
    "Playing {x}…": "Ana kunna {x}…",
    "Microphone: {x}": "Makirufo: {x}",
    // resume, toasts
    "Continue from {x}?": "Ci gaba daga {x}?",
    "Continue": "Ci gaba",
    "Found you — {x}": "An gano ka — {x}",
    "Listening — recite from here": "Ana saurare — karanta daga nan",
    "Double-tap a word to start there": "Taɓa kalma sau biyu don farawa daga nan",
    "Mā shāʾ Allāh — page done": "Mā shā' Allāh — an gama shafi",
    "at-Tawbah is recited without the basmala": "Ana karanta Suratut Tauba ba tare da basmala ba",
    "Your madd lengths changed within this verse — try to keep one pace": "Tsawon maddodinka ya canza a cikin wannan aya — ka riƙe sauri ɗaya",
    "Couldn't play: {x}": "Ba a iya kunnawa ba: {x}",
    "Clear all colours and saved progress on this device?": "A goge duk launuka da ci gaban da aka adana a wannan na'ura?",
    // the word sheet
    "Try this word again": "Sake gwada wannan kalma",
    "A tajweed detail to polish": "Ƙaramin gyara na tajwidi",
    "This word was missed": "An tsallake wannan kalma",
    "Read at {p} pace — you chose {q}": "An karanta da saurin {p} — ka zaɓi {q}",
    "▶ Listen": "▶ Saurara",
    "Show sounds": "Nuna sautuka",
    "Hide sounds": "Ɓoye sautuka",
    "Expected:": "Abin da ake so:",
    "We heard:": "Abin da muka ji:",
    "Close": "Rufe",
    // picker
    "Surah name or number, or 18:10": "Sunan sura ko lamba, ko 18:10",
    "Page": "Shafi",
    "Surah": "Sura",
    "Juz": "Juzu'i",
    "Juz {n}": "Juzu'i {n}",
    "‹ All surahs": "‹ Duk surori",
    "Verse": "Aya",
    "of {n}": "cikin {n}",
    "{n} verses": "ayoyi {n}",
    "Show": "Nuna",
    "🎙 Recite from here": "🎙 Karanta daga nan",
    "Practise this verse": "Yi bitar wannan aya",
    // guide
    "Tap the mic and recite": "Taɓa makirufo ka karanta",
    "Start anywhere in the Qur'an. The page opens where you are and follows you.": "Fara daga ko'ina a cikin Alƙur'ani. Shafin zai buɗe inda kake, ya bi ka.",
    "Double-tap a word": "Taɓa kalma sau biyu",
    "Start, or pick up again, from exactly that word. The mic comes on by itself. Tap a verse number ﴿ ﴾ to practise that verse.": "Ka fara, ko ka ci gaba, daidai daga wannan kalma. Makirufo zai kunna da kansa. Taɓa lambar aya ﴿ ﴾ don yin bitarta.",
    "What the colours mean": "Ma'anar launuka",
    "Tap a coloured word to see it and hear it read correctly.": "Taɓa kalma mai launi don ganinta da jin karatunta daidai.",
    "Skip": "Tsallake",
    "Next": "Gaba",
    "Start": "Fara",
    // practise
    "Reciter": "Mai karatu",
    "Listen": "Saurara",
    "times": "sau",
    "Start: listen, then recite": "Fara: saurara, sannan ka karanta",
    "Try again: listen, then recite": "Sake gwadawa: saurara, sannan ka karanta",
    "🎙 My turn": "🎙 Lokacina",
    "Next verse": "Aya ta gaba",
    "Start over": "Sake farawa",
    "Verse {a} of {n}": "Aya ta {a} cikin {n}",
    "Listen to the reciter, then it's your turn.": "Saurari mai karatu, sannan lokacinka ne.",
    "Listening {i} of {n}…": "Ana saurare {i} cikin {n}…",
    "Your turn — recite the verse": "Lokacinka ne — karanta ayar",
    "Mā shāʾ Allāh. Recite it again, or move on.": "Mā shā' Allāh. Sake karantawa, ko ka ci gaba.",
    "Listen to this part.": "Saurari wannan sashe.",
    "Listen to these parts.": "Saurari waɗannan sassa.",
    "It sounds like a word was missed. Listen to this part.": "Da alama an tsallake wata kalma. Saurari wannan sashe.",
    "It sounds like the verse was not finished.": "Da alama ba a gama ayar ba.",
    "Now recite the whole verse again.": "Yanzu sake karanta ayar gaba ɗaya.",
    "Practise this one with your teacher.": "Ka yi bitar wannan tare da malaminka.",
    "Mā shāʾ Allāh. Move on when you're ready.": "Mā shā' Allāh. Ci gaba idan ka shirya.",
    "That sounds like a different verse. Listen again.": "Da alama wata aya ce daban. Sake sauraro.",
    "Now recite this verse.": "Yanzu karanta wannan ayar.",
    "Tap 🎙 My turn when ready.": "Taɓa 🎙 Lokacina idan ka shirya.",
    "Everything happens on this device; your recitation is never sent anywhere or saved.": "Komai yana faruwa a wannan na'ura; ba a aika karatunka ko'ina, ba a kuma adana shi.",
    "A companion between lessons — not a replacement for your teacher.": "Abokin bita tsakanin darussa — ba madadin malaminka ba.",
    "Recite the verse when you're ready.": "Karanta ayar idan ka shirya.",  // DRAFT: please correct
    "That sounds like a different verse.": "Kamar wata aya ce daban.",  // DRAFT: please correct
    "It sounds like a word was missed. Tap the coloured words to see them.": "Kamar an tsallake wata kalma. Taɓa kalmomin masu launi don ganin su.",  // DRAFT: please correct
    "Tap the coloured words to see them, then recite the verse again.": "Taɓa kalmomin masu launi don ganin su, sannan ka sake karanta ayar.",  // DRAFT: please correct
    "Try again": "Sake gwadawa",  // DRAFT: please correct
    "Delete all": "Share duka",  // DRAFT: please correct
    "No saved sessions to delete.": "Babu zaman da aka adana da za a share.",  // DRAFT: please correct
    "Delete all {n} saved sessions? This can't be undone.": "A share duk zama {n} da aka adana? Ba za a iya dawo da su ba.",  // DRAFT: please correct
    "All saved sessions deleted.": "An share duk zaman da aka adana.",  // DRAFT: please correct
    "Repeat again": "Sake maimaitawa",  // DRAFT: please correct
    "Same verses and counts as before. Press Start.": "Ayoyi da adadi iri ɗaya da na baya. Danna Fara.",  // DRAFT: please correct
    "Reading options": "Zaɓuɓɓukan karatu",  // DRAFT: please correct
    "Text": "Rubutu",  // DRAFT: please correct
    "Shown": "A bayyane",  // DRAFT: please correct
    "Layout": "Tsari",  // DRAFT: please correct
    "Clear all colours": "Goge duk launuka",
    "Light / dark": "Haske / duhu",
    "How it works": "Yadda yake aiki",
    "Play a recording": "Kunna rikodi",
    "Tap the mic and recite anywhere — or double-tap a word to start from it": "Taɓa makirufo ka karanta daga ko'ina — ko ka taɓa kalma sau biyu don farawa daga gare ta",  // DRAFT: please correct
    "Practise a verse": "Gwada aya",  // DRAFT: please correct
    "Tries": "Gwaje-gwaje",  // DRAFT: please correct
    "My turn": "Lokacina",
    "Options": "Zaɓuɓɓuka",  // DRAFT: please correct
    "Fewer times": "Ƙasa da haka",  // DRAFT: please correct
    "More times": "Fiye da haka",  // DRAFT: please correct
    "Hide text": "Ɓoye rubutu",
    "Listen once": "Saurara sau ɗaya",  // DRAFT: please correct
    "Automatic feedback can be wrong; it does not replace your teacher.": "Binciken na'ura na iya yin kuskure; ba ya maye gurbin malaminka.",  // DRAFT: please correct
    "Repeat verses": "Maimaita ayoyi",  // DRAFT: please correct
    "Mode": "Hanya",  // DRAFT: please correct
    "Section": "Sashe",  // DRAFT: please correct
    "My recording": "Rikodina",
    "Start here": "Fara daga nan",
    "Go to": "Je zuwa",  // DRAFT: please correct
    "Surah, or surah:verse": "Sura, ko sura:aya",  // DRAFT: please correct
    "Verse number": "Lambar aya",  // DRAFT: please correct
    "End this session now": "Gama wannan zama yanzu",  // DRAFT: please correct
    "Play session": "Kunna zaman",
    "Close review": "Rufe bita",  // DRAFT: please correct
    "No sessions yet. Tap the mic and recite to start one.": "Babu zama tukuna. Taɓa makirufo ka karanta don farawa.",  // DRAFT: please correct
    "Repeat": "Maimaita",  // DRAFT: please correct
    "From verse": "Daga aya",  // DRAFT: please correct
    "To verse": "Zuwa aya",  // DRAFT: please correct
    "Loop": "Zagaye",  // DRAFT: please correct
    "Cascade": "Tari",  // DRAFT: please correct
    "Times": "Sau",  // DRAFT: please correct
    "Each verse": "Kowace aya",  // DRAFT: please correct
    "Together": "Tare",  // DRAFT: please correct
    "🎙 Start": "🎙 Fara",  // DRAFT: please correct
    "⏹ Stop": "⏹ Tsaya",  // DRAFT: please correct
    "Recite the whole range again and again.": "Karanta duka ayoyin akai-akai.",  // DRAFT: please correct
    "Each verse on its own, then everything so far together, one verse more each time.": "Kowace aya ita kaɗai, sannan duk abin da ya gabata tare, ana ƙara aya ɗaya kowane lokaci.",  // DRAFT: please correct
    "Verse {a}": "Aya {a}",  // DRAFT: please correct
    "Verses {a}–{b}": "Ayoyi {a}–{b}",  // DRAFT: please correct
    "Verses {a}–{b} of {n}": "Ayoyi {a}–{b} cikin {n}",  // DRAFT: please correct
    "{what} · {i} of {n}": "{what} · {i} cikin {n}",  // DRAFT: please correct
    "step {i} of {n}": "mataki {i} cikin {n}",  // DRAFT: please correct
    "{n} to check": "{n} a duba",  // DRAFT: please correct
    "{n} tajweed": "{n} tajwidi",  // DRAFT: please correct
    "clean": "babu kuskure",  // DRAFT: please correct
    "All done.": "An gama duka.",  // DRAFT: please correct
    "Stopped.": "An tsaya.",  // DRAFT: please correct
    "Next: {what}": "Na gaba: {what}",  // DRAFT: please correct
    "Lost your place — this pass starts again": "An rasa inda kake — za a sake fara wannan zagayen",  // DRAFT: please correct
    "Choose the verses, then Start.": "Zaɓi ayoyin, sannan ka fara.",  // DRAFT: please correct
    "The colours come from an automatic check and can be wrong. Suwayhib does not replace a qualified teacher.": "Launukan sun fito ne daga binciken na'ura kuma suna iya yin kuskure. Suwayhib ba ya maye gurbin malami ƙwararre.",  // DRAFT: please correct
  },
  ar: {
    "Previous verse": "الآية السابقة",
    "Tap 🎙 and recite anywhere — or double-tap a word to start from it": "اضغط 🎙 واتلُ من أي موضع — أو انقر الكلمة مرتين لتبدأ منها",
    "The microphone is blocked. Allow it for this page in Chrome: tap the lock icon next to the address, then Permissions → Microphone → Allow.": "الميكروفون محظور. اسمح به لهذه الصفحة في كروم: اضغط رمز القفل بجانب العنوان، ثم الأذونات ← الميكروفون ← سماح.",
    "▶ Start here": "▶ ابدأ من هنا", "👁 Hide text": "👁 إخفاء النص", "👁 Show text": "👁 إظهار النص", "Cancel": "إلغاء", "Yes": "نعم",
    "The whole text is shown.": "يظهر النص كاملًا.",
    "Only each verse's first word is shown; the rest appears as you recite. Tap a word to peek.": "تظهر أول كلمة من كل آية فقط، ويظهر الباقي مع التلاوة. انقر كلمة لتلقي نظرة.",
    "Each verse's first and last words are shown; the rest appears as you recite. Tap a word to peek.": "تظهر أول كلمات كل آية وآخرها، ويظهر الباقي مع التلاوة. انقر كلمة لتلقي نظرة.",
    "The text is hidden and appears as you recite. Tap a word to peek.": "النص مخفي ويظهر مع التلاوة. انقر كلمة لتلقي نظرة.",
    "That place is not in the Qur'an.": "هذا الموضع ليس في القرآن.", "Something went wrong — please try again": "حدث خطأ — حاول مرة أخرى",
    "Storage is full — delete some old sessions": "التخزين ممتلئ — احذف بعض الجلسات القديمة",
    "Save my recordings": "احفظ تسجيلاتي", "▶ Play session": "▶ تشغيل الجلسة", "Practise these": "تدرّب على هذه", "▶ My recording": "▶ تسجيلي",
    "Nothing to practise — Mā shāʾ Allāh": "لا شيء للتدريب — ما شاء الله", "{n} verses to practise": "{n} آيات للتدريب",
    "Mā shāʾ Allāh — that was the last one": "ما شاء الله — كانت هذه الأخيرة",
    "🗂 Sessions": "🗂 الجلسات", "⏹ End session": "⏹ إنهاء الجلسة", "Sessions": "الجلسات", "Back to now": "العودة إلى الآن",
    "Memorise: first word": "الحفظ: أول كلمة", "Memorise: first + last": "الحفظ: الأولى + الأخيرة", "Memorise: hidden": "الحفظ: مخفي",
    "Mixed": "مختلطة", "now": "الآن", "{n} min": "{n} دقيقة", "Review": "مراجعة", "Delete": "حذف", "Delete this session?": "حذف هذه الجلسة؟",
    "No sessions yet. Tap 🎙 and recite to start one.": "لا جلسات بعد. اضغط 🎙 واتلُ لتبدأ.", "Reviewing {x}": "مراجعة {x}",
    "Session saved. The next one starts fresh.": "حُفظت الجلسة. الجلسة التالية تبدأ من جديد.",
    "Read": "القراءة", "Practise": "التدريب", "Go to a surah or page": "انتقل إلى سورة أو صفحة", "More": "المزيد",
    "View": "العرض", "Pages": "صفحات", "Scroll": "تمرير", "Memorise": "الحفظ", "Off": "إيقاف", "First word": "أول كلمة", "First + last": "الأولى + الأخيرة",
    "Hidden": "مخفي", "Pace": "مرتبة القراءة", "Any valid pace": "أي مرتبة صحيحة", "Ḥadr (fast)": "الحدر (سريع)",
    "Tadwīr (medium)": "التدوير (متوسط)", "Taḥqīq (slow)": "التحقيق (متأنٍّ)", "Language": "اللغة",
    "❔ How it works": "❔ طريقة الاستخدام", "◐ Light / dark": "◐ فاتح / داكن", "🎧 Play a recording": "🎧 تشغيل تسجيل",
    "↺ Clear all colours": "↺ مسح كل الألوان", "correct": "صحيح", "you are here": "أنت هنا", "tajweed detail": "ملاحظة تجويد",
    "check this word": "راجع هذه الكلمة", "Page {n}": "صفحة {n}", "Next page": "الصفحة التالية", "Previous page": "الصفحة السابقة",
    "Start reciting": "ابدأ التلاوة", "Stop": "توقف",
    "Connecting…": "جارٍ الاتصال…", "Ready — tap 🎙 and recite": "جاهز — اضغط 🎙 واتلُ", "Ready. Start reciting anywhere.": "جاهز — اضغط 🎙 واتلُ",
    "Not connected — retrying…": "غير متصل — إعادة المحاولة…", "Listening… start anywhere": "أستمع… ابدأ من أي موضع",
    "Listening…": "أستمع…", "Listening… (no match yet)": "أستمع… (لم أجد الموضع بعد)", "Matches {n} places — keep going…": "يطابق {n} مواضع — واصل…",
    "Found you: {x}": "وجدتك: {x}", "Start from here: {x}": "ابدأ من هنا: {x}", "Finding your place nearby…": "أبحث عن موضعك قريبًا…",
    "End of the Qur'an. Ma shaa Allah!": "ختمت القرآن. ما شاء الله!", "Playing {x}…": "تشغيل {x}…", "Microphone: {x}": "الميكروفون: {x}",
    "Continue from {x}?": "متابعة من {x}؟", "Continue": "متابعة", "Found you — {x}": "وجدتك — {x}", "Listening — recite from here": "أستمع — اتلُ من هنا",
    "Double-tap a word to start there": "انقر الكلمة مرتين لتبدأ منها", "Mā shāʾ Allāh — page done": "ما شاء الله — أتممت الصفحة",
    "at-Tawbah is recited without the basmala": "سورة التوبة تُقرأ بلا بسملة",
    "Your madd lengths changed within this verse — try to keep one pace": "تغيّر مقدار المدود في هذه الآية — حاول الالتزام بمرتبة واحدة",
    "Couldn't play: {x}": "تعذّر التشغيل: {x}", "Clear all colours and saved progress on this device?": "مسح كل الألوان والتقدّم المحفوظ على هذا الجهاز؟",
    "Try this word again": "أعد هذه الكلمة", "A tajweed detail to polish": "ملاحظة تجويد للتحسين", "This word was missed": "فاتتك هذه الكلمة",
    "Read at {p} pace — you chose {q}": "قُرئت بمرتبة {p} — اخترت {q}", "▶ Listen": "▶ استمع", "Show sounds": "إظهار الأصوات",
    "Hide sounds": "إخفاء الأصوات", "Expected:": "المطلوب:", "We heard:": "ما سمعناه:", "Close": "إغلاق",
    "Surah name or number, or 18:10": "اسم السورة أو رقمها، أو 18:10", "Page": "صفحة", "Surah": "سورة", "Juz": "جزء", "Juz {n}": "الجزء {n}",
    "‹ All surahs": "‹ كل السور", "Verse": "الآية", "of {n}": "من {n}", "{n} verses": "{n} آية", "Show": "عرض",
    "🎙 Recite from here": "🎙 اتلُ من هنا", "Practise this verse": "تدرّب على هذه الآية",
    "Tap the mic and recite": "اضغط الميكروفون واتلُ", "Start anywhere in the Qur'an. The page opens where you are and follows you.": "ابدأ من أي موضع في القرآن، فتُفتح الصفحة عند موضعك وتتبعك.",
    "Double-tap a word": "انقر الكلمة مرتين", "Start, or pick up again, from exactly that word. The mic comes on by itself. Tap a verse number ﴿ ﴾ to practise that verse.": "ابدأ أو تابع من تلك الكلمة نفسها، ويعمل الميكروفون تلقائيًا. انقر رقم الآية ﴿ ﴾ لتتدرّب عليها.",
    "What the colours mean": "معنى الألوان", "Tap a coloured word to see it and hear it read correctly.": "انقر كلمة ملوّنة لتراها وتسمعها مقروءة صحيحة.",
    "Skip": "تخطٍّ", "Next": "التالي", "Start": "ابدأ",
    "Reciter": "القارئ", "Listen": "استمع", "times": "مرات", "Start: listen, then recite": "ابدأ: استمع ثم اتلُ",
    "Try again: listen, then recite": "أعد: استمع ثم اتلُ", "🎙 My turn": "🎙 دوري", "Next verse": "الآية التالية", "Start over": "ابدأ من جديد",
    "Verse {a} of {n}": "الآية {a} من {n}", "Listen to the reciter, then it's your turn.": "استمع إلى القارئ، ثم يأتي دورك.",
    "Listening {i} of {n}…": "الاستماع {i} من {n}…", "Your turn — recite the verse": "دورك — اتلُ الآية",
    "Mā shāʾ Allāh. Recite it again, or move on.": "ما شاء الله. أعدها أو انتقل.", "Listen to this part.": "استمع إلى هذا الموضع.",
    "Listen to these parts.": "استمع إلى هذه المواضع.", "It sounds like a word was missed. Listen to this part.": "يبدو أن كلمة فاتتك. استمع إلى هذا الموضع.",
    "It sounds like the verse was not finished.": "يبدو أن الآية لم تكتمل.", "Now recite the whole verse again.": "الآن أعد الآية كاملة.",
    "Practise this one with your teacher.": "تدرّب على هذه مع شيخك.", "Mā shāʾ Allāh. Move on when you're ready.": "ما شاء الله. انتقل حين تستعد.",
    "That sounds like a different verse. Listen again.": "يبدو أنها آية أخرى. استمع مرة أخرى.", "Now recite this verse.": "الآن اتلُ هذه الآية.",
    "Tap 🎙 My turn when ready.": "اضغط 🎙 دوري حين تستعد.",
    "Everything happens on this device; your recitation is never sent anywhere or saved.": "كل شيء يجري على هذا الجهاز؛ لا تُرسل تلاوتك إلى أي مكان ولا تُحفظ.",
    "A companion between lessons — not a replacement for your teacher.": "رفيق بين الدروس — لا يغني عن شيخك.",
    "Recite the verse when you're ready.": "اقرأ الآية حين تستعد.",
    "That sounds like a different verse.": "يبدو أنها آية أخرى.",
    "It sounds like a word was missed. Tap the coloured words to see them.": "يبدو أن كلمة فاتت. اضغط الكلمات الملوّنة لتراها.",
    "Tap the coloured words to see them, then recite the verse again.": "اضغط الكلمات الملوّنة لتراها، ثم اقرأ الآية مرة أخرى.",
    "Try again": "حاول مرة أخرى",
    "Delete all": "احذف الكل",
    "No saved sessions to delete.": "لا جلسات محفوظة للحذف.",
    "Delete all {n} saved sessions? This can't be undone.": "حذف كل الجلسات المحفوظة ({n})؟ لا يمكن التراجع.",
    "All saved sessions deleted.": "حُذفت كل الجلسات المحفوظة.",
    "Repeat again": "كرّر مرة أخرى",
    "Same verses and counts as before. Press Start.": "الآيات والأعداد نفسها كالمرة السابقة. اضغط ابدأ.",
    "Reading options": "خيارات القراءة",
    "Text": "النص",
    "Shown": "ظاهر",
    "Layout": "التخطيط",
    "Clear all colours": "مسح كل الألوان",
    "Light / dark": "فاتح / داكن",
    "How it works": "طريقة الاستخدام",
    "Play a recording": "تشغيل تسجيل",
    "Tap the mic and recite anywhere — or double-tap a word to start from it": "اضغط الميكروفون واقرأ من أي موضع — أو انقر كلمة مرتين لتبدأ منها",
    "Practise a verse": "تدرّب على آية",
    "Tries": "المحاولات",
    "My turn": "دوري",
    "Options": "خيارات",
    "Fewer times": "مرات أقل",
    "More times": "مرات أكثر",
    "Hide text": "إخفاء النص",
    "Listen once": "استمع مرة",
    "Automatic feedback can be wrong; it does not replace your teacher.": "قد يخطئ التقييم الآلي؛ ولا يغني عن شيخك.",
    "Repeat verses": "تكرار الآيات",
    "Mode": "الطريقة",
    "Section": "القسم",
    "My recording": "تسجيلي",
    "Start here": "ابدأ من هنا",
    "Go to": "انتقل إلى",
    "Surah, or surah:verse": "سورة، أو سورة:آية",
    "Verse number": "رقم الآية",
    "End this session now": "أنهِ هذه الجلسة الآن",
    "Play session": "تشغيل الجلسة",
    "Close review": "أغلق المراجعة",
    "No sessions yet. Tap the mic and recite to start one.": "لا جلسات بعد. اضغط الميكروفون واقرأ لتبدأ واحدة.",
    "Repeat": "تكرار",
    "From verse": "من الآية",
    "To verse": "إلى الآية",
    "Loop": "دوري",
    "Cascade": "تراكمي",
    "Times": "مرات",
    "Each verse": "كل آية",
    "Together": "معًا",
    "🎙 Start": "🎙 ابدأ",
    "⏹ Stop": "⏹ توقف",
    "Recite the whole range again and again.": "اقرأ المقطع كله مرة بعد مرة.",
    "Each verse on its own, then everything so far together, one verse more each time.": "كل آية وحدها، ثم كل ما سبق معًا، بزيادة آية في كل مرة.",
    "Verse {a}": "الآية {a}",
    "Verses {a}–{b}": "الآيات {a}–{b}",
    "Verses {a}–{b} of {n}": "الآيات {a}–{b} من {n}",
    "{what} · {i} of {n}": "{what} · {i} من {n}",
    "step {i} of {n}": "الخطوة {i} من {n}",
    "{n} to check": "{n} للمراجعة",
    "{n} tajweed": "{n} تجويد",
    "clean": "سليمة",
    "All done.": "انتهى الكل.",
    "Stopped.": "توقف.",
    "Next: {what}": "التالي: {what}",
    "Lost your place — this pass starts again": "ضاع موضعك — تبدأ هذه الجولة من جديد",
    "Choose the verses, then Start.": "اختر الآيات ثم ابدأ.",
    "The colours come from an automatic check and can be wrong. Suwayhib does not replace a qualified teacher.": "الألوان من فحص آلي وقد تخطئ. لا يغني سُوَيهِب عن شيخ متقن.",
  },
};
let LANG = (() => { try { return JSON.parse(localStorage.getItem("suwayhib.lang")) || "en"; } catch (e) { return "en"; } })();
function t(key, vars) {
  let s = (I18N[LANG] && I18N[LANG][key]) || key;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
  return s;
}
// the server's status lines come in English: match them to a key and translate
const SERVER_STATUS = [
  [/^Matches (\d+) places — keep going…$/, (m) => t("Matches {n} places — keep going…", { n: m[1] })],
  [/^Found you: (.+)$/, (m) => t("Found you: {x}", { x: m[1] })],
  [/^Start from here: (.+)$/, (m) => t("Start from here: {x}", { x: m[1] })],
];
function tStatus(text) {
  for (const [re, f] of SERVER_STATUS) { const m = text.match(re); if (m) return f(m); }
  return t(text);
}
// static text: elements with data-i18n (text), data-i18n-ph (placeholder), data-i18n-label (aria-label/title)
function applyLang() {
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => { const v = t(el.dataset.i18nLabel); el.setAttribute("aria-label", v); el.title = v; });
}
function setLang(l) {
  LANG = l; try { localStorage.setItem("suwayhib.lang", JSON.stringify(l)); } catch (e) {}
  applyLang();
  document.dispatchEvent(new Event("langchange"));
}
