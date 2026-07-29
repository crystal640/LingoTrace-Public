import { MorandiTheme, Quote, LearningStats, CalendarDayRecord, WordItem, GrammarErrorItem, PhrasePatternItem, UserSettings, DailyReport } from '../types';

export const INITIAL_DAILY_REPORT: DailyReport = {
  dateStr: '2026-07-25',
  syncTime: '已从 7 月 25 日对话导入',
  syncStatus: 'synced',
  speakingMinutes: 40,
  totalMinutes: 90,
  overallScore: 85,
  dimensions: {
    fluency: 90,
    grammar: 70,
    vocabulary: 80,
    naturalness: 82,
    communication: 100
  },
  topics: [
    '创意编程项目：互动壁纸',
    '暑假与日常生活',
    '香港硕士申请准备',
    '比较带来的焦虑',
    '英语学习',
    'BL 小说与故事表达'
  ],
  thought: {
    zh: '我意识到，自己的焦虑并不是真的来自学习本身，而是来自把自己的进度与身边亲近的人比较。停止比较时，我才能真正享受创作、阅读和英语练习。',
    en: "Today I realized that my anxiety isn't really caused by studying itself. What actually makes me anxious is comparing my pace with someone close to me.",
    isSaved: false
  },
  strengths: [
    '能够自然讨论抽象话题，而不只局限于日常生活',
    '可以清晰、有逻辑地解释自己的情绪和技术项目',
    '忘词时仍能继续表达，保持了很好的口语习惯',
    '沟通能力明显强于语法准确度，但始终能让对方理解'
  ],
  improvements: [
    {
      id: 'imp_1',
      category: '语法准确度',
      issue: '第三人称单数仍然容易遗漏，例如 My friend studies / She makes。',
      actionLabel: '查看纠错',
      targetTab: 'error'
    },
    {
      id: 'imp_2',
      category: '自然表达与选词',
      issue: '避免 lowest capital、feel an anxious 等直译，改用 cheapest way、low-cost、feel anxious。',
      actionLabel: '生成练习',
      targetTab: 'phrase'
    },
    {
      id: 'imp_3',
      category: '短句表达',
      issue: '表达抽象想法时，练习使用更短、更自然的句子。',
      actionLabel: '加入复习',
      targetTab: 'vocab'
    }
  ],
  newContentSummary: {
    newWordsCount: 6,
    naturalExprCount: 5,
    sentencePatternsCount: 6,
    correctedErrorsCount: 3,
    previewWords: ['premise', 'chemistry', 'emotional arc', 'payoff', 'twitch', 'keep up with'],
    previewPhrases: ['It\'s not really about A, it\'s more about B.', 'It makes me feel like...', 'I\'ve realized that...']
  },
  qualitativeReview: '已经能够用英语讨论深入话题，长时间持续表达且信心很好。沟通复杂想法是最突出的优势；下一步应重点提高表达自然度和语法准确性。',
  memorizingSentences: [],
  nextSuggestions: [
    '使用更短、更自然的句子表达抽象想法',
    '完成第三人称单数和自然选词的专项练习',
    '下次话题：我想成为怎样的人（The kind of person I want to become）'
  ]
};

export const MORANDI_THEMES: Record<string, MorandiTheme> = {
  sage: {
    id: 'sage',
    name: '鼠尾草绿',
    enName: 'Sage Green',
    colors: {
      c900: '#223B27',
      c700: '#3D5E43',
      c500: '#658B6C',
      c300: '#A0C2A7',
      c150: '#D8E6DB',
      c075: '#EEF5EF'
    },
    primaryHex: '#3D5E43',
    lightBg: '#D8E6DB',
    darkHex: '#223B27',
    darkLightBg: 'rgba(61, 94, 67, 0.18)',
    badgeBg: '#A0C2A7',
    badgeText: '#223B27',
    chartGradient: ['#3D5E43', '#A0C2A7']
  },
  fog: {
    id: 'fog',
    name: '雾霾蓝',
    enName: 'Fog Blue',
    colors: {
      c900: '#1E3447',
      c700: '#365470',
      c500: '#587B9B',
      c300: '#95B3CF',
      c150: '#D5E2EC',
      c075: '#ECF2F7'
    },
    primaryHex: '#365470',
    lightBg: '#D5E2EC',
    darkHex: '#1E3447',
    darkLightBg: 'rgba(54, 84, 112, 0.18)',
    badgeBg: '#95B3CF',
    badgeText: '#1E3447',
    chartGradient: ['#365470', '#95B3CF']
  },
  rose: {
    id: 'rose',
    name: '灰粉色',
    enName: 'Dusty Rose',
    colors: {
      c900: '#A95A70',
      c700: '#C87888',
      c500: '#DFA0AA',
      c300: '#F2CDD2',
      c150: '#F8E8EA',
      c075: '#FCF3F4'
    },
    primaryHex: '#C87888',
    lightBg: '#F8E8EA',
    darkHex: '#A95A70',
    darkLightBg: 'rgba(200, 120, 136, 0.18)',
    badgeBg: '#F2CDD2',
    badgeText: '#7F4053',
    chartGradient: ['#C87888', '#F2CDD2']
  },
  oatmeal: {
    id: 'oatmeal',
    name: '燕麦棕',
    enName: 'Oatmeal Brown',
    colors: {
      c900: '#3F2F23',
      c700: '#68513E',
      c500: '#8D735E',
      c300: '#C3B09D',
      c150: '#EAE0D6',
      c075: '#F6F2EC'
    },
    primaryHex: '#68513E',
    lightBg: '#EAE0D6',
    darkHex: '#3F2F23',
    darkLightBg: 'rgba(104, 81, 62, 0.18)',
    badgeBg: '#C3B09D',
    badgeText: '#3F2F23',
    chartGradient: ['#68513E', '#C3B09D']
  },
  lavender: {
    id: 'lavender',
    name: '薰衣草紫',
    enName: 'Lavender Purple',
    colors: {
      c900: '#342540',
      c700: '#5A426B',
      c500: '#7F6492',
      c300: '#B39DC4',
      c150: '#E3DAEB',
      c075: '#F3EEF7'
    },
    primaryHex: '#5A426B',
    lightBg: '#E3DAEB',
    darkHex: '#342540',
    darkLightBg: 'rgba(90, 66, 107, 0.18)',
    badgeBg: '#B39DC4',
    badgeText: '#342540',
    chartGradient: ['#5A426B', '#B39DC4']
  }
};

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'q1',
    en: "Great things are done by a series of small things brought together.",
    zh: "伟大之事，皆由微小之事相聚而成。",
    author: "Vincent van Gogh",
    category: "BOOK",
    isFavorite: true
  },
  {
    id: 'q2',
    en: "It is never too late to be what you might have been.",
    zh: "成为你本可以成为的人，任何时候都不算晚。",
    author: "George Eliot",
    category: "POETRY",
    isFavorite: false
  },
  {
    id: 'q3',
    en: "We accept the love we think we deserve.",
    zh: "我们只接受我们认为配得上的爱。",
    author: "The Perks of Being a Wallflower",
    category: "MOVIE",
    isFavorite: true
  },
  {
    id: 'q4',
    en: "To live is the rarest thing in the world. Most people exist, that is all.",
    zh: "生活是世上最罕见的事。大多数人只是活着，仅此而已。",
    author: "Oscar Wilde",
    category: "PHILOSOPHY",
    isFavorite: false
  }
];

export const INITIAL_TODAY_STATS: LearningStats = {
  overallScore: 84,
  vocabScore: 88,
  grammarScore: 78,
  expressionScore: 86,
  reviewScore: 84,
  studyTimeMinutes: 38,
  reviewWordsCount: 12,
  newPhrasesCount: 2,
  errorsCorrectedCount: 3
};

export const INITIAL_WORDS: WordItem[] = [
  {
    id: 'import_20260725_w1', word: 'premise', ipa: '', pos: 'n.', meaning: '故事设定；前提',
    exampleEn: 'The premise is about two stepbrothers.', exampleZh: '故事设定围绕两个继兄弟展开。',
    collocation: 'the premise of a story', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '故事表达'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'import_20260725_w2', word: 'chemistry', ipa: '', pos: 'n.', meaning: '人物之间的化学反应；默契',
    exampleEn: 'I love the chemistry between them.', exampleZh: '我喜欢他们之间的化学反应。',
    collocation: 'chemistry between people', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '人物关系'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'import_20260725_w3', word: 'emotional arc', ipa: '', pos: 'n.', meaning: '情感发展线',
    exampleEn: 'The emotional arc is amazing.', exampleZh: '这条情感发展线非常精彩。',
    collocation: 'character emotional arc', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '故事表达'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'import_20260725_w4', word: 'payoff', ipa: '', pos: 'n.', meaning: '情绪回报；铺垫后的回报',
    exampleEn: 'The confession scene is the payoff.', exampleZh: '告白场景就是前期铺垫的情绪回报。',
    collocation: 'emotional payoff', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '故事表达'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'import_20260725_w5', word: 'twitch', ipa: '', pos: 'v.', meaning: '（眼皮或肌肉）抽动',
    exampleEn: 'My left eyelid keeps twitching.', exampleZh: '我的左眼皮一直跳。',
    collocation: 'eyelid keeps twitching', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '日常生活'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'import_20260725_w6', word: 'keep up with', ipa: '', pos: 'phr.', meaning: '跟上；保持同样的进度',
    exampleEn: "I'm worried I can't keep up with the class.", exampleZh: '我担心自己跟不上课程。',
    collocation: 'keep up with the class', sourceDialogue: '2026-07-25 ChatGPT 口语对话',
    status: 'to_review', tags: ['7月25日', '固定搭配'], reviewCount: 0, lastReviewed: '2026-07-25'
  },
  {
    id: 'w1',
    word: 'Serendipity',
    ipa: '/ˌser.ənˈdɪp.ə.ti/',
    pos: 'n.',
    meaning: '意外发现珍奇事物的本领；机缘巧合；不期而至的幸运',
    exampleEn: "We found this charming cafe purely by serendipity during our evening walk.",
    exampleZh: "我们在晚间散步时，纯属机缘巧合发现了一家迷人的咖啡馆。",
    collocation: 'pure serendipity, happy serendipity',
    sourceDialogue: "ChatGPT: 'Living in a foreign city often brings unexpected serendipity.'",
    status: 'to_review',
    tags: ['雅思写作', '日常美词'],
    reviewCount: 3,
    lastReviewed: '2026-07-25'
  },
  {
    id: 'w2',
    word: 'Meticulous',
    ipa: '/məˈtɪk.jə.ləs/',
    pos: 'adj.',
    meaning: '严谨的；极注意细节的；一丝不苟的',
    exampleEn: "He was meticulous about keeping his daily language learning notes organized.",
    exampleZh: "他对整理每日语言学习笔记极为严谨细致。",
    collocation: 'meticulous attention, meticulous planning',
    sourceDialogue: "ChatGPT: 'She paid meticulous care to grammar rules during editing.'",
    status: 'to_review',
    tags: ['职场英语', '精准描述'],
    reviewCount: 2,
    lastReviewed: '2026-07-24'
  },
  {
    id: 'w3',
    word: 'Resilience',
    ipa: '/rɪˈzɪl.jəns/',
    pos: 'n.',
    meaning: '韧性；恢复力；适应能力',
    exampleEn: "Developing language fluency requires emotional resilience when making mistakes.",
    exampleZh: "培养语言流利度需要面对犯错时的心理韧性。",
    collocation: 'build resilience, emotional resilience',
    sourceDialogue: "ChatGPT: 'Language learners exhibit great resilience through continuous practice.'",
    status: 'vague',
    tags: ['高频动名词', '情绪表达'],
    reviewCount: 4,
    lastReviewed: '2026-07-23'
  },
  {
    id: 'w4',
    word: 'Articulate',
    ipa: '/ɑːrˈtɪk.jə.leɪt/',
    pos: 'v. / adj.',
    meaning: '清晰地表达 (v.)；善于表达的，口齿伶俐的 (adj.)',
    exampleEn: "She was able to articulate her ideas clearly during the international video call.",
    exampleZh: "她在跨国视频会议上能够清晰流畅地表达自己的观点。",
    collocation: 'articulate thoughts, highly articulate',
    sourceDialogue: "ChatGPT: 'Try using 'articulate' instead of 'express clearly' for precision.'",
    status: 'to_review',
    tags: ['商务英语', '表达升级'],
    reviewCount: 1,
    lastReviewed: '2026-07-26'
  },
  {
    id: 'w5',
    word: 'Quintessential',
    ipa: '/ˌkwɪn.təˈsen.ʃəl/',
    pos: 'adj.',
    meaning: '最典型的；最具代表性的',
    exampleEn: "Drinking afternoon tea in Covent Garden is a quintessential British experience.",
    exampleZh: "在柯文特花园喝下午茶是极其典型的英式体验。",
    collocation: 'quintessential example, quintessential feature',
    sourceDialogue: "ChatGPT: 'This idiomatic phrase is the quintessential representation of English politeness.'",
    status: 'to_review',
    tags: ['高级描述', '文学地道'],
    reviewCount: 2,
    lastReviewed: '2026-07-22'
  },
  {
    id: 'w6',
    word: 'Pragmatic',
    ipa: '/præɡˈmæt.ɪk/',
    pos: 'adj.',
    meaning: '重实效的；务实的；讲究实用的',
    exampleEn: "We need a pragmatic approach to improve our spoken English skills every week.",
    exampleZh: "我们需要一种务实的方法来每周提升我们的英语口语能力。",
    collocation: 'pragmatic solution, pragmatic mindset',
    sourceDialogue: "ChatGPT: 'Taking small, pragmatic steps yields better long-term memory.'",
    status: 'mastered',
    tags: ['职场英语', '高频核心'],
    reviewCount: 5,
    lastReviewed: '2026-07-21'
  }
];

export const INITIAL_ERRORS: GrammarErrorItem[] = [
  {
    id: 'import_20260725_e1', originalSentence: "I don't feel an anxietious.", errorHighlight: 'an anxietious',
    correctedSentence: "I don't feel anxious.", correctedHighlight: 'feel anxious',
    explanation: 'anxious 是形容词，放在 feel 后作表语，不使用冠词 an。', category: 'naturalness',
    categoryLabel: '自然表达', occurrenceCount: 1, tag: '#形容词用法', dateAdded: '2026-07-25'
  },
  {
    id: 'import_20260725_e2', originalSentence: 'Reading novels is the lowest capital to make me happy.', errorHighlight: 'the lowest capital',
    correctedSentence: 'Reading novels is one of the cheapest ways to make me happy.', correctedHighlight: 'one of the cheapest ways',
    explanation: '表达“低成本的方式”时用 low-cost way 或 one of the cheapest ways，而不是 lowest capital。', category: 'word_choice',
    categoryLabel: '用词错误', occurrenceCount: 1, tag: '#自然选词', dateAdded: '2026-07-25'
  },
  {
    id: 'import_20260725_e3', originalSentence: 'My friend study every day. She make mind maps.', errorHighlight: 'study / make',
    correctedSentence: 'My friend studies every day. She makes mind maps.', correctedHighlight: 'studies / makes',
    explanation: '一般现在时中，第三人称单数主语后的动词需要加 -s 或 -es。', category: 'grammar',
    categoryLabel: '语法错误', occurrenceCount: 2, tag: '#第三人称单数', dateAdded: '2026-07-25'
  },
  {
    id: 'e1',
    originalSentence: "I am looking forward to hear from your reply soon.",
    errorHighlight: "look forward to hear",
    correctedSentence: "I am looking forward to hearing from you soon.",
    correctedHighlight: "looking forward to hearing",
    explanation: "'look forward to' 中的 'to' 为介词，后面接动名词 (-ing) 或名词，不能接动词原形。",
    category: 'collocation',
    categoryLabel: '固定搭配',
    occurrenceCount: 5,
    tag: '#介词+动名词',
    dateAdded: '2026-07-27'
  },
  {
    id: 'e2',
    originalSentence: "If I was you, I will accept that job offer immediately.",
    errorHighlight: "If I was ... I will accept",
    correctedSentence: "If I were you, I would accept that job offer immediately.",
    correctedHighlight: "If I were ... I would accept",
    explanation: "表示与现在事实相反的虚拟语气时，条件句动词用 'were'，主句用 'would + 动词原形'。",
    category: 'grammar',
    categoryLabel: '语法错误',
    occurrenceCount: 4,
    tag: '#虚拟语气',
    dateAdded: '2026-07-26'
  },
  {
    id: 'e3',
    originalSentence: "The project manager explained us the new workflow during meeting.",
    errorHighlight: "explained us the new workflow",
    correctedSentence: "The project manager explained the new workflow to us during the meeting.",
    correctedHighlight: "explained the new workflow to us",
    explanation: "'explain' 是单宾语动词，接人称宾语时需要加介词 'to'（explain sth to sb）。",
    category: 'word_choice',
    categoryLabel: '用词错误',
    occurrenceCount: 3,
    tag: '#双宾语误用',
    dateAdded: '2026-07-25'
  },
  {
    id: 'e4',
    originalSentence: "I am agree with your opinion regarding the remote working policy.",
    errorHighlight: "am agree",
    correctedSentence: "I agree with your opinion regarding the remote working policy.",
    correctedHighlight: "I agree",
    explanation: "'agree' 是动词，不需要加 Be 动词（'I agree' 而非 'I am agree'）。",
    category: 'grammar',
    categoryLabel: '语法错误',
    occurrenceCount: 3,
    tag: '#Be动词冗余',
    dateAdded: '2026-07-24'
  },
  {
    id: 'e5',
    originalSentence: "He successfully completed his task accommodate to the tight budget.",
    errorHighlight: "accommodate to",
    correctedSentence: "He successfully completed his task despite the tight budget.",
    correctedHighlight: "despite",
    explanation: "'accommodate' 为动词，此处表达'尽管预算紧凑'应用介词 'despite' 或 'in spite of'。",
    category: 'word_choice',
    categoryLabel: '用词错误',
    occurrenceCount: 2,
    tag: '#介词搭配',
    dateAdded: '2026-07-22'
  }
];

export const INITIAL_PHRASES: PhrasePatternItem[] = [
  {
    id: 'import_20260725_p1', pattern: "It's not really about A, it's more about B.", meaningZh: '重点并不真正在 A，而更多在于 B。',
    exampleEn: "It's not really about my friend. It's more about how I compare myself to her.", exampleZh: '问题并不真正在我的朋友，而更多在于我如何把自己和她比较。',
    category: 'opinion', categoryLabel: '观点表达', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'import_20260725_p2', pattern: 'It makes me feel like...', meaningZh: '它让我觉得……',
    exampleEn: "It makes me feel like I'm falling behind.", exampleZh: '它让我觉得自己正在落后。',
    category: 'emotion', categoryLabel: '情绪表达', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'import_20260725_p3', pattern: "I'm worried that I won't be able to...", meaningZh: '我担心自己将无法……',
    exampleEn: "I'm worried that I won't be able to keep up with my classes.", exampleZh: '我担心自己跟不上课程。',
    category: 'emotion', categoryLabel: '情绪表达', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'import_20260725_p4', pattern: 'Over time,...', meaningZh: '随着时间推移……',
    exampleEn: 'Over time, I became more confident speaking English.', exampleZh: '随着时间推移，我说英语变得更有信心。',
    category: 'daily', categoryLabel: '日常交流', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'import_20260725_p5', pattern: 'What I like most about... is...', meaningZh: '我最喜欢……的是……',
    exampleEn: 'What I like most about reading novels is that I can completely relax.', exampleZh: '我最喜欢读小说的一点是它能让我彻底放松。',
    category: 'opinion', categoryLabel: '观点表达', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'import_20260725_p6', pattern: "I've realized that...", meaningZh: '我意识到……',
    exampleEn: "I've realized that my anxiety often comes from comparison.", exampleZh: '我意识到自己的焦虑经常来自比较。',
    category: 'opinion', categoryLabel: '观点表达', sourceTag: '#7月25日对话', masteryLevel: 1, isFavorite: false
  },
  {
    id: 'p1',
    pattern: "It occurs to me that...",
    meaningZh: "我突然想到…… / 我意识到……",
    exampleEn: "It suddenly occurs to me that we could review our ChatGPT conversation logs every evening.",
    exampleZh: "我突然想到，我们每天晚上都可以复盘 ChatGPT 的对话记录。",
    category: 'opinion',
    categoryLabel: '观点表达',
    sourceTag: '#ChatGPT高频句型',
    masteryLevel: 4,
    isFavorite: true
  },
  {
    id: 'p2',
    pattern: "I would be grateful if you could...",
    meaningZh: "如果您能……我将不胜感激（礼貌请求）",
    exampleEn: "I would be grateful if you could provide a brief breakdown of my grammar mistakes.",
    exampleZh: "如果您能简要梳理我的语法错误，我将不胜感激。",
    category: 'work',
    categoryLabel: '工作交流',
    sourceTag: '#商务邮件必备',
    masteryLevel: 5,
    isFavorite: true
  },
  {
    id: 'p3',
    pattern: "On the flip side,...",
    meaningZh: "另一方面；换个角度来看……",
    exampleEn: "Learning online is convenient; on the flip side, it demands high self-discipline.",
    exampleZh: "线上学习非常方便；但另一方面，它对自律性要求很高。",
    category: 'opinion',
    categoryLabel: '观点表达',
    sourceTag: '#地道连词',
    masteryLevel: 3,
    isFavorite: false
  },
  {
    id: 'p4',
    pattern: "I'm torn between... and...",
    meaningZh: "我在……和……之间纠结 / 难以抉择",
    exampleEn: "I'm torn between spending the weekend reading English poetry or practicing listening.",
    exampleZh: "我在周末读英文诗歌还是练听力之间犹豫不决。",
    category: 'emotion',
    categoryLabel: '情绪表达',
    sourceTag: '#口语地道',
    masteryLevel: 4,
    isFavorite: true
  },
  {
    id: 'p5',
    pattern: "Could you recommend a local spot for...",
    meaningZh: "你能推荐一个当地地道的……地方吗？",
    exampleEn: "Could you recommend a local spot for tasting authentic roasted coffee?",
    exampleZh: "你能推荐一个品尝地道烘焙咖啡的当地好去处吗？",
    category: 'travel',
    categoryLabel: '旅行出游',
    sourceTag: '#出国旅行',
    masteryLevel: 5,
    isFavorite: false
  },
  {
    id: 'p6',
    pattern: "To cut a long story short,...",
    meaningZh: "长话短说；简而言之……",
    exampleEn: "To cut a long story short, ChatGPT helped me identify my prepositions blind spots.",
    exampleZh: "长话短说，ChatGPT 帮我指出了介词使用的盲区。",
    category: 'daily',
    categoryLabel: '日常交流',
    sourceTag: '#地道口语',
    masteryLevel: 4,
    isFavorite: false
  }
];

// Generate calendar history for July 2026
export const INITIAL_CALENDAR_RECORDS: CalendarDayRecord[] = [
  { dateStr: '2026-07-01', dayNumber: 1, hasRecord: true, score: 76, isFullyReviewed: false, studyMinutes: 25, reviewWords: 8, correctedErrors: 2, newPhrases: 1, aiSummary: "初步建立了日常写作框架，名词复数需要更加细心。" },
  { dateStr: '2026-07-02', dayNumber: 2, hasRecord: true, score: 78, isFullyReviewed: true, studyMinutes: 30, reviewWords: 10, correctedErrors: 1, newPhrases: 2, aiSummary: "词汇掌握稳定，时态切换比昨天顺畅。" },
  { dateStr: '2026-07-03', dayNumber: 3, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "无学习记录" },
  { dateStr: '2026-07-04', dayNumber: 4, hasRecord: true, score: 80, isFullyReviewed: true, studyMinutes: 35, reviewWords: 12, correctedErrors: 3, newPhrases: 1, aiSummary: "强化了商务邮件常用句型，完成了第一轮单词复盘。" },
  { dateStr: '2026-07-05', dayNumber: 5, hasRecord: true, score: 79, isFullyReviewed: false, studyMinutes: 20, reviewWords: 6, correctedErrors: 1, newPhrases: 1, aiSummary: "复习了介词短语，建议保持连续练习。" },
  { dateStr: '2026-07-06', dayNumber: 6, hasRecord: true, score: 82, isFullyReviewed: true, studyMinutes: 40, reviewWords: 15, correctedErrors: 2, newPhrases: 3, aiSummary: "长难句拆解表现优秀，成功消化了3个新表达。" },
  { dateStr: '2026-07-07', dayNumber: 7, hasRecord: true, score: 81, isFullyReviewed: true, studyMinutes: 28, reviewWords: 10, correctedErrors: 2, newPhrases: 1, aiSummary: "拼写正确率大幅提升，保持良好势头。" },
  { dateStr: '2026-07-08', dayNumber: 8, hasRecord: true, score: 83, isFullyReviewed: true, studyMinutes: 32, reviewWords: 11, correctedErrors: 1, newPhrases: 2, aiSummary: "表达多样性有所扩展，尝试使用了两个动名词主语。" },
  { dateStr: '2026-07-09', dayNumber: 9, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "休息日" },
  { dateStr: '2026-07-10', dayNumber: 10, hasRecord: true, score: 80, isFullyReviewed: false, studyMinutes: 25, reviewWords: 9, correctedErrors: 2, newPhrases: 1, aiSummary: "重新拾起听力短句，完成单词卡翻转复习。" },
  { dateStr: '2026-07-11', dayNumber: 11, hasRecord: true, score: 82, isFullyReviewed: true, studyMinutes: 38, reviewWords: 14, correctedErrors: 3, newPhrases: 2, aiSummary: "虚拟语气初见成效，修改了之前的表达习惯。" },
  { dateStr: '2026-07-12', dayNumber: 12, hasRecord: true, score: 85, isFullyReviewed: true, studyMinutes: 45, reviewWords: 16, correctedErrors: 1, newPhrases: 4, aiSummary: "阅读理解与总结表达兼具，综合分创新高。" },
  { dateStr: '2026-07-13', dayNumber: 13, hasRecord: true, score: 83, isFullyReviewed: true, studyMinutes: 30, reviewWords: 10, correctedErrors: 2, newPhrases: 1, aiSummary: "稳定输出工作邮件句型，积累了职场地道用词。" },
  { dateStr: '2026-07-14', dayNumber: 14, hasRecord: true, score: 81, isFullyReviewed: false, studyMinutes: 22, reviewWords: 8, correctedErrors: 1, newPhrases: 1, aiSummary: "针对动词三单进行了专项纠错。" },
  { dateStr: '2026-07-15', dayNumber: 15, hasRecord: true, score: 84, isFullyReviewed: true, studyMinutes: 35, reviewWords: 12, correctedErrors: 2, newPhrases: 2, aiSummary: "完成了半月小结，各维能力均衡推进。" },
  { dateStr: '2026-07-16', dayNumber: 16, hasRecord: true, score: 82, isFullyReviewed: true, studyMinutes: 28, reviewWords: 10, correctedErrors: 1, newPhrases: 2, aiSummary: "熟练掌握了 2 个情绪表达句型。" },
  { dateStr: '2026-07-17', dayNumber: 17, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "无学习记录" },
  { dateStr: '2026-07-18', dayNumber: 18, hasRecord: true, score: 83, isFullyReviewed: true, studyMinutes: 30, reviewWords: 12, correctedErrors: 2, newPhrases: 1, aiSummary: "口语连读习惯纠正，表现平稳。" },
  { dateStr: '2026-07-19', dayNumber: 19, hasRecord: true, score: 86, isFullyReviewed: true, studyMinutes: 42, reviewWords: 15, correctedErrors: 3, newPhrases: 3, aiSummary: "对高级词汇 Serendipity 进行了深度语境理解。" },
  { dateStr: '2026-07-20', dayNumber: 20, hasRecord: true, score: 85, isFullyReviewed: true, studyMinutes: 36, reviewWords: 13, correctedErrors: 1, newPhrases: 2, aiSummary: "连续打卡第 3 天，语法稳步提高。" },
  { dateStr: '2026-07-21', dayNumber: 21, hasRecord: true, score: 84, isFullyReviewed: true, studyMinutes: 34, reviewWords: 11, correctedErrors: 2, newPhrases: 1, aiSummary: "复盘了工作中的介词固定搭配。" },
  { dateStr: '2026-07-22', dayNumber: 22, hasRecord: true, score: 83, isFullyReviewed: true, studyMinutes: 31, reviewWords: 10, correctedErrors: 1, newPhrases: 2, aiSummary: "整理了写作中的高频连词用法。" },
  { dateStr: '2026-07-23', dayNumber: 23, hasRecord: true, score: 85, isFullyReviewed: true, studyMinutes: 37, reviewWords: 13, correctedErrors: 2, newPhrases: 2, aiSummary: "词汇复习全对，熟练度大幅提升。" },
  { dateStr: '2026-07-24', dayNumber: 24, hasRecord: true, score: 86, isFullyReviewed: true, studyMinutes: 40, reviewWords: 14, correctedErrors: 2, newPhrases: 3, aiSummary: "对 ChatGPT 提问技巧及回答进行了沉淀。" },
  { dateStr: '2026-07-25', dayNumber: 25, hasRecord: true, score: 85, isFullyReviewed: false, studyMinutes: 90, reviewWords: 6, correctedErrors: 3, newPhrases: 6, aiSummary: "能够讨论抽象情绪与技术项目；沟通能力突出，下一步加强自然度与语法准确性。" },
  { dateStr: '2026-07-26', dayNumber: 26, hasRecord: true, score: 87, isFullyReviewed: true, studyMinutes: 45, reviewWords: 16, correctedErrors: 4, newPhrases: 3, aiSummary: "语法纠错效率奇高，突破了过去时的搭配问题。" },
  { dateStr: '2026-07-27', dayNumber: 27, hasRecord: true, score: 84, isFullyReviewed: true, studyMinutes: 38, reviewWords: 12, correctedErrors: 3, newPhrases: 2, aiSummary: "今天对过去时的使用更稳定了。需要继续留意介词搭配，明天会为你安排两组针对性练习。" },
  { dateStr: '2026-07-28', dayNumber: 28, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "" },
  { dateStr: '2026-07-29', dayNumber: 29, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "" },
  { dateStr: '2026-07-30', dayNumber: 30, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "" },
  { dateStr: '2026-07-31', dayNumber: 31, hasRecord: false, score: 0, isFullyReviewed: false, studyMinutes: 0, reviewWords: 0, correctedErrors: 0, newPhrases: 0, aiSummary: "" }
];

export const INITIAL_USER_SETTINGS: UserSettings = {
  name: "Learner",
  avatar: "/icon-192.png",
  dailyGoalMinutes: 25,
  reminderTime: "08:30",
  dailyWordTarget: 15,
  themeId: "sage",
  isDarkMode: false,
  fontSize: "normal",
  isChatGptConnected: false,
  lastSyncTime: "尚未同步"
};
