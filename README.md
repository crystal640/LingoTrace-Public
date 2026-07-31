# LingoTrace

> 把每一次 ChatGPT 英语对话，沉淀成可追踪、可复习、可行动的个人学习记录。

[在线体验](https://lingo-trace.vercel.app/) · [快速开始](docs/getting-started.md) · [产品白皮书](docs/product-whitepaper.md) · [技术说明](docs/technical-architecture.md) · [配套 ChatGPT 项目指令](LingoTrace-英语口语项目指令.md)

LingoTrace 是一个移动端优先的英语学习记录 PWA。它不替代 ChatGPT 的语音或文字对话能力，而是负责对话之后更容易被忽略的一步：将学习表现整理成结构化日报，并把其中的单词、句型、纠错与改进建议持续积累为个人学习档案。

## 为什么做 LingoTrace

和 ChatGPT 练口语很方便，但聊天结束后，真正值得复习的内容往往散落在长对话里：今天说得怎么样、哪些错误反复出现、哪些词需要记住、下次应该练什么，都很难长期追踪。

LingoTrace 将流程拆成一个闭环：

```text
与 ChatGPT 进行英语练习
        ↓
输入“生成 LingoTrace 日报”
        ↓
ChatGPT 输出 LINGOTRACE_REPORT_V1 JSON
        ↓
在 LingoTrace 中导入并校验
        ↓
查看日报、历史趋势、单词、句型和纠错
        ↓
完成复习与针对性练习
```

## 核心功能

- **结构化日报导入**：导入并合并 `LINGOTRACE_REPORT_V1` JSON，保存练习时间、五维评分、主题、优点、改进建议与下次目标。
- **历史记录与成长回顾**：按日期查看以往练习报告和学习数据，避免每次练习都从零开始。
- **个人单词库**：收集本次对话中真正需要复习的词和短语，保留释义、音标、词性、例句、搭配、语境和标签。
- **句型库**：将对话主题转化为可复用的自然表达，按日常、工作、旅行、观点和情绪分类。
- **纠错库**：并排查看原句、修改句、错误位置、解释和记忆提示，集中处理语法、拼写、选词、搭配与自然度问题。
- **针对性练习**：根据个人纠错生成三道四选一练习；Gemini 不可用时提供本地规则回退。
- **复习状态管理**：记录待复习、模糊、忘记和已掌握等状态，支持轻量间隔复习。
- **移动端与 PWA**：适合手机使用，可安装到主屏幕并以独立应用形式打开。
- **云端账户与数据隔离**：通过 Google 登录和 Supabase Row Level Security 保护每位用户的数据边界。

## 三分钟上手

1. 打开 [LingoTrace 在线版](https://lingo-trace.vercel.app/)并登录。
2. 打开仓库中的 `LingoTrace-英语口语项目指令.md`，将**全部内容复制**到 ChatGPT 项目的“项目指令”中。不要只上传文件。
3. 在这个 ChatGPT 项目中进行一次英语口语或文字练习。
4. 练习结束后输入：`生成 LingoTrace 日报`。
5. ChatGPT 应只返回一个合法 JSON 对象。复制完整 JSON。
6. 回到 LingoTrace，打开导入入口，粘贴 JSON，检查后确认导入。
7. 在首页查看当日报告，并进入“单词”“纠错”“句型”继续复习。

详细操作、常见错误与 PWA 安装方法见 [新手使用指南](docs/getting-started.md)。

## JSON 数据契约

当前导入格式为 `LINGOTRACE_REPORT_V1`。关键约束包括：

- `schema_version` 必须为 `LINGOTRACE_REPORT_V1`；
- `scores` 包含 fluency、grammar、vocabulary、naturalness、communication 和 overall；
- `overall` 是五个维度的算术平均值；
- `sentences` 恰好包含 10 条；
- `vocabulary`、`corrections`、`improvements` 即使为空也必须保留为数组；
- 最终内容必须是纯 JSON，不能带 Markdown 代码围栏或额外说明。

完整字段、分类枚举和真实性规则以仓库中的配套项目指令为准。

## 文档

- [新手使用指南](docs/getting-started.md)：从配置 ChatGPT 到导入、复习与排错。
- [产品与学习闭环白皮书](docs/product-whitepaper.md)：产品定位、问题定义、设计原则、用户旅程与边界。
- [技术架构说明](docs/technical-architecture.md)：前后端架构、数据流、安全模型、AI 练习和本地部署。
- [ChatGPT 项目指令](LingoTrace-英语口语项目指令.md)：生成兼容日报 JSON 的唯一规范来源。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite、Tailwind CSS、Motion、Lucide React |
| 身份与数据 | Supabase Auth、Postgres、Row Level Security |
| 服务端能力 | Supabase Edge Functions |
| AI 练习 | Gemini API（仅从 Edge Function 调用） |
| 应用形态 | 响应式 Web App、PWA、Service Worker |
| 部署 | Vercel（前端）与 Supabase（后端） |

## 本地开发

### 环境要求

- Node.js
- pnpm
- Supabase CLI（需要部署 Edge Function 时）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置前端环境变量

将 `.env.example` 复制为 `.env.local`：

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_your_key"
```

`VITE_` 变量会进入浏览器包。这里只能放 Supabase 可公开的 publishable key，绝不能放 service-role key 或 Gemini API key。

### 3. 初始化数据库

按照文件名顺序，将 `supabase/migrations/` 中的 SQL 迁移应用到你的 Supabase 项目。

### 4. 配置并部署练习函数

将 `GEMINI_API_KEY` 添加到 Supabase Edge Function Secrets，然后部署：

```bash
supabase functions deploy generate-grammar-practice
```

可选配置 `GEMINI_MODEL`；未配置时使用项目内的默认模型。若 Gemini 请求失败，函数会回退到本地生成的练习题。

### 5. 启动开发服务器

```bash
pnpm dev
```

常用命令：

```bash
pnpm lint
pnpm build
pnpm preview
```

## 仓库结构

```text
.
├── public/                  # PWA 图标、manifest、service worker 等静态文件
├── src/
│   ├── components/         # 首页、单词、纠错、句型、个人页与弹窗组件
│   ├── context/            # 登录状态与应用数据状态
│   ├── lib/                # Supabase 客户端等基础设施
│   ├── App.tsx             # 主界面、导航与模态框装配
│   ├── main.tsx            # React 入口与 service worker 注册
│   └── types.ts            # 学习记录和界面领域类型
├── supabase/
│   ├── migrations/         # 数据表、约束、策略与数据库迁移
│   └── functions/          # Gemini 练习生成 Edge Function
├── docs/                   # 使用指南、白皮书与技术说明
├── LingoTrace-英语口语项目指令.md
├── .env.example
└── package.json
```

## 隐私与安全

- 不要向公开仓库提交真实聊天记录、导出的学习 JSON、访问令牌或用户数据。
- `.env.local` 和其他本地环境文件不应提交到 Git。
- Gemini API key 只保存在 Supabase Edge Function Secrets 中，不进入浏览器。
- 浏览器使用 Supabase publishable key；真正的数据访问边界由登录身份和 owner-only RLS 策略控制。
- ChatGPT 生成的评分与建议属于辅助性学习反馈，不等同于标准化语言考试成绩或专业评估。

## 当前边界

- LingoTrace 当前依赖“ChatGPT 生成 JSON → 用户复制 → LingoTrace 导入”的手动流程，并未直接读取你的 ChatGPT 历史记录。
- 报告质量取决于当前对话中可见的真实样本、ChatGPT 对项目指令的遵循程度和用户是否完整复制 JSON。
- AI 生成内容可能出现偏差；重要语法结论建议结合可靠词典、语法资料或教师反馈复核。
- 项目仍处于早期阶段，数据结构和功能可能继续演进。

## 参与贡献

欢迎通过 Issue 提交 bug、建议、导入失败样例（请先移除个人信息）或文档改进意见。提交 Pull Request 前，请确保：

1. 未包含密钥、token、真实用户数据或私人对话；
2. `pnpm lint` 与 `pnpm build` 通过；
3. 如更改 JSON schema，同时更新配套 ChatGPT 指令和相关文档；
4. 如更改数据库结构，提供可重复执行的迁移与相应 RLS 策略。

## License

本仓库目前未明确声明开源许可证。在许可证文件加入前，代码默认仍受著作权保护；请勿假定可以自由复制、修改或商业使用。

---

如果 LingoTrace 对你有帮助，欢迎 Star 项目并分享你的使用反馈。
