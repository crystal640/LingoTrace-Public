import type { CalendarDayRecord, DailyReport, GrammarErrorItem, LearningStats, PhrasePatternItem, UserSettings, WordItem } from '../types';

export const GUEST_DAILY_REPORT: DailyReport = {
  dateStr: '2026-07-28',
  syncTime: '访客演示数据',
  syncStatus: 'synced',
  speakingMinutes: 18,
  totalMinutes: 30,
  overallScore: 78,
  dimensions: { fluency: 75, grammar: 75, vocabulary: 80, naturalness: 75, communication: 85 },
  topics: ['personal growth', 'learning strategies', 'future planning'],
  thought: {
    zh: '持续学习不仅需要积累知识，也需要建立自己的思考方式。',
    en: 'Continuous learning is not only about acquiring knowledge, but also about developing my own way of thinking.',
    isSaved: false,
  },
  strengths: [
    '能够表达抽象观点，而不仅限于描述日常事件。',
    '能够解释观点背后的原因和影响。',
    '面对表达困难时能够通过换一种方式继续沟通。',
  ],
  improvements: [
    { id: 'guest-imp-1', category: '表达结构', issue: '长篇表达时可以使用更明显的逻辑连接，例如 firstly, more importantly, as a result。', actionLabel: '复习句型', targetTab: 'phrase' },
    { id: 'guest-imp-2', category: '语法', issue: '注意复杂句中的时态一致性以及从句结构。', actionLabel: '查看纠错', targetTab: 'error' },
    { id: 'guest-imp-3', category: '词汇', issue: '可以增加表达观点、分析问题和提出建议时使用的高级词汇。', actionLabel: '复习单词', targetTab: 'vocab' },
  ],
  newContentSummary: {
    newWordsCount: 4,
    naturalExprCount: 10,
    sentencePatternsCount: 10,
    correctedErrorsCount: 2,
    previewWords: ['perspective', 'adaptability', 'persuasive', 'overcome'],
    previewPhrases: ['From my perspective...', 'I used to think that...', 'One of the biggest challenges is that...'],
  },
  qualitativeReview: '本次练习围绕个人成长、学习方法和未来规划展开。用户能够表达较复杂的观点，并尝试解释自己的原因和价值判断。主要提升空间在于组织长段表达时需要更清晰的结构，例如先提出观点，再补充原因和例子。',
  memorizingSentences: [],
  nextSuggestions: [
    '练习使用更复杂的连接词组织观点。',
    '尝试用一分钟完整表达一个观点并保持逻辑清晰。',
    '积累更多适用于 IELTS Speaking Part 3 的高级表达。',
  ],
};

export const GUEST_TODAY_STATS: LearningStats = {
  overallScore: 78, vocabScore: 80, grammarScore: 75, expressionScore: 75,
  reviewScore: 0, studyTimeMinutes: 30, reviewWordsCount: 4, newPhrasesCount: 10, errorsCorrectedCount: 2,
};

export const GUEST_CALENDAR_RECORDS: CalendarDayRecord[] = [{
  dateStr: '2026-07-28', dayNumber: 28, hasRecord: true, score: 78, isFullyReviewed: false,
  studyMinutes: 30, reviewWords: 4, correctedErrors: 2, newPhrases: 10,
  aiSummary: '围绕个人成长、学习方法和未来规划进行英语表达练习。',
}];

export const GUEST_WORDS: WordItem[] = [
  ['perspective', '/pərˈspektɪv/', 'noun', '观点；视角', 'Traveling can broaden my perspective and help me understand different cultures.', '旅行可以拓宽我的视角，帮助我理解不同文化。', "broaden one's perspective", '适用于表达个人成长和观点变化。', ['opinion', 'IELTS']],
  ['adaptability', '/əˌdæptəˈbɪləti/', 'noun', '适应能力', 'Adaptability is an important skill in a rapidly changing world.', '在快速变化的世界里，适应能力是一项重要技能。', 'develop adaptability', '适用于讨论个人能力和未来发展。', ['personal growth']],
  ['persuasive', '/pərˈsweɪsɪv/', 'adjective', '有说服力的', 'A persuasive argument should be supported by clear evidence.', '有说服力的观点应该有清晰证据支持。', 'a persuasive argument', '适用于表达观点和辩论。', ['communication']],
  ['overcome', '/ˌoʊvərˈkʌm/', 'verb', '克服', 'Everyone needs to overcome challenges during personal growth.', '每个人在成长过程中都需要克服挑战。', 'overcome difficulties', '适用于描述成长经历。', ['emotion', 'growth']],
].map(([word, ipa, pos, meaning, exampleEn, exampleZh, collocation, sourceDialogue, tags], index) => ({
  id: `guest-word-${index + 1}`, word: word as string, ipa: ipa as string, pos: pos as string,
  meaning: meaning as string, exampleEn: exampleEn as string, exampleZh: exampleZh as string,
  collocation: collocation as string, sourceDialogue: sourceDialogue as string, tags: tags as string[],
  status: 'to_review' as const, reviewCount: 0, lastReviewed: '尚未复习', isFavorite: false,
}));

const guestSentences = [
  ['From my perspective, the most important thing is to keep improving myself.', '在我看来，最重要的是不断提升自己。', 'From my perspective, success requires continuous improvement.', '在我看来，成功需要持续进步。', 'opinion', 'personal growth'],
  ['I used to think that..., but now I realize that...', '我过去认为……，但现在意识到……', 'I used to think mistakes were failures, but now I realize they are opportunities to learn.', '我过去认为错误代表失败，但现在意识到错误是学习机会。', 'opinion', 'reflection'],
  ['One of the biggest challenges is that...', '最大的挑战之一是……', 'One of the biggest challenges is maintaining motivation over time.', '最大的挑战之一是长期保持动力。', 'opinion', 'IELTS'],
  ['The reason why I believe this is that...', '我这样认为的原因是……', 'The reason why I believe this is that experience shapes our understanding.', '我这样认为是因为经历塑造我们的理解。', 'opinion', 'argument'],
  ['It is not just about..., it is also about...', '这不仅仅是关于……，也是关于……', 'Learning is not just about memorizing information, it is also about developing critical thinking.', '学习不仅是记忆信息，也是培养批判性思维。', 'opinion', 'learning'],
  ['I would argue that...', '我认为……', 'I would argue that creativity is essential in modern society.', '我认为创造力在现代社会非常重要。', 'opinion', 'IELTS'],
  ['What matters most is whether...', '最重要的是是否……', 'What matters most is whether we can learn from experience.', '最重要的是我们是否能从经验中学习。', 'opinion', 'reflection'],
  ['I gradually realized that...', '我逐渐意识到……', 'I gradually realized that confidence comes from practice.', '我逐渐意识到自信来自练习。', 'emotion', 'growth'],
  ['There is a balance between A and B.', 'A 和 B 之间需要保持平衡。', 'There is a balance between ambition and maintaining a healthy lifestyle.', '野心和保持健康生活方式之间需要平衡。', 'opinion', 'discussion'],
  ['Looking back, I think I have learned a lot from this experience.', '回顾过去，我认为我从这段经历中学到了很多。', 'Looking back, I think I have learned a lot from my challenges.', '回顾过去，我认为我从挑战中学到了很多。', 'emotion', 'reflection'],
] as const;

export const GUEST_PHRASES: PhrasePatternItem[] = guestSentences.map((item, index) => ({
  id: `guest-phrase-${index + 1}`, pattern: item[0], meaningZh: item[1], exampleEn: item[2], exampleZh: item[3],
  category: item[4], categoryLabel: item[4] === 'emotion' ? '情感表达' : '观点表达', sourceTag: `#${item[5]}`,
  masteryLevel: 1, isFavorite: false,
}));

export const GUEST_ERRORS: GrammarErrorItem[] = [
  { id: 'guest-error-1', category: 'grammar', categoryLabel: '语法', originalSentence: 'I think this experience can helps me improve.', errorHighlight: 'can helps', correctedSentence: 'I think this experience can help me improve.', correctedHighlight: 'can help', explanation: '情态动词 can 后面需要使用动词原形。记忆提示：can/must/should + 动词原形。', occurrenceCount: 1, tag: '情态动词', dateAdded: '2026-07-28' },
  { id: 'guest-error-2', category: 'naturalness', categoryLabel: '自然表达', originalSentence: 'I want to make my ability become better.', errorHighlight: 'make my ability become better', correctedSentence: 'I want to improve my ability.', correctedHighlight: 'improve my ability', explanation: '英语中 improve ability 比 make ability become better 更自然。', occurrenceCount: 1, tag: '自然表达', dateAdded: '2026-07-28' },
];

export const GUEST_USER_SETTINGS: UserSettings = {
  name: 'Guest', avatar: '/icon-192.png', dailyGoalMinutes: 30, reminderTime: '20:00', dailyWordTarget: 10,
  themeId: 'sage', isDarkMode: false, fontSize: 'normal', isChatGptConnected: false, lastSyncTime: '访客演示数据',
};
