# LingoTrace 技术架构说明

## 1. 系统概览

LingoTrace 采用前后端分离的 Web/PWA 架构：React 客户端负责交互和学习内容展示；Supabase 提供认证、Postgres 数据库、Row Level Security 与 Edge Functions；Gemini 仅由服务端函数调用，用于基于纠错记录生成练习。

```text
ChatGPT 项目指令
  └─ 生成 LINGOTRACE_REPORT_V1 JSON
              ↓ 手动复制
React / TypeScript PWA
  ├─ JSON 校验与导入
  ├─ 日报、历史、单词、句型、纠错
  └─ Supabase JS Client
              ↓ 用户 JWT + publishable key
Supabase
  ├─ Auth（Google 登录）
  ├─ Postgres + owner-only RLS
  └─ Edge Function: generate-grammar-practice
              ↓ 服务端 secret
          Gemini API
```

## 2. 客户端

### 主要技术

- React 19 与 TypeScript；
- Vite 构建和开发服务器；
- Tailwind CSS 负责样式；
- Motion 提供界面动效；
- Lucide React 提供图标；
- Service Worker 与 manifest 提供 PWA 能力。

### 界面模块

`App.tsx` 装配五个主标签页：

- `HomeTab`：今日概览与日报入口；
- `WordTab`：单词复习库；
- `ErrorTab`：纠错库与练习入口；
- `PhraseTab`：句型库；
- `ProfileTab`：个人设置与账户相关能力。

同时包含历史记录、登录、练习、日报详情和报告导入等模态框。

### 领域类型

`src/types.ts` 定义主要前端对象，包括：

- `WordItem`；
- `GrammarErrorItem`；
- `PhrasePatternItem`；
- `DailyReport`；
- `LearningStats`；
- `CalendarDayRecord`；
- `UserSettings`。

将这些类型与导入 schema 分开是合理的：外部 JSON 使用稳定、可传输的 snake_case 契约；应用内部可以映射为适合 React 使用的 camelCase 类型。

## 3. 报告导入链路

### 输入

输入是由 ChatGPT 按项目指令生成的 `LINGOTRACE_REPORT_V1` JSON。客户端应在写入数据库前验证：

- JSON 可解析；
- schema 版本受支持；
- 必填字段存在；
- 数字范围和枚举合法；
- speaking_minutes 不大于 total_minutes；
- overall 与五项均值一致；
- sentences 数量为 10；
- ID 能用于幂等或重复检测。

### 建议的导入阶段

```text
原始文本
→ 去除首尾空白
→ JSON.parse
→ schema 校验
→ 规范化字段
→ 用户确认
→ 单事务写入/合并
→ 返回导入摘要
```

导入应尽量是原子的：日报写入失败时，不应留下部分单词或纠错；如现有实现分多步写入，应记录可恢复状态并提供清晰错误信息。

## 4. 身份、数据与安全

### 客户端配置

浏览器只使用：

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

publishable key 不是用户授权本身。每次受保护的数据操作还依赖 Supabase Auth 会话中的用户 JWT。

### Row Level Security

用户数据表应启用 RLS，并对 select、insert、update、delete 分别建立 owner-only 策略。典型原则为：

```sql
auth.uid() = user_id
```

不能只依赖前端过滤 `user_id`。前端代码可被修改，真正的数据隔离必须由数据库策略执行。

### 服务端秘密

以下内容不能出现在 `VITE_` 变量、客户端代码或公开 Git 历史中：

- `GEMINI_API_KEY`；
- Supabase service-role key；
- 第三方访问令牌；
- 真实用户导出与对话 JSON。

Gemini key 应仅保存在 Supabase Edge Function Secrets。

## 5. 语法练习 Edge Function

`generate-grammar-practice` 的主要流程：

1. 处理 CORS 预检；
2. 要求 `Authorization` 头并验证当前用户；
3. 读取 `correctionId`；
4. 按 Asia/Shanghai 计算当天日期；
5. 恢复当天未完成的同一纠错练习；
6. 对同一纠错执行每日组数限制；
7. 从数据库读取纠错记录；
8. 先构造本地回退题目；
9. 如存在 Gemini key，则请求模型生成恰好三道四选一题；
10. 严格解析题目数量、选项数量和答案索引；
11. AI 失败时继续使用本地回退；
12. 保存练习会话并返回剩余组数。

这种“先有可用回退，再尝试 AI 增强”的策略避免第三方模型暂时不可用时中断核心复习流程。

## 6. AI 输出约束

函数通过 JSON response schema 约束 Gemini 输出：

- questions 必须恰好 3 条；
- 每题包含 tag、title、context、options、correctIndex 和 explanation；
- options 必须恰好 4 个字符串；
- correctIndex 必须为 0–3 的整数。

服务端仍会再次验证模型结果。不能因为请求了 JSON 模式就假设输出永远可信。

## 7. PWA 生命周期

生产环境加载完成后注册 `/sw.js`，并设置 `updateViaCache: 'none'` 后主动检查更新。开发环境不注册 service worker，避免旧缓存干扰调试。

修改缓存策略时应重点测试：

- 首次访问和离线回访；
- 新版本部署后的更新提示或刷新行为；
- API 数据不会被错误缓存为静态资源；
- 登录退出后不残留其他用户的敏感页面数据。

## 8. 本地开发与部署

### 安装与检查

```bash
pnpm install
pnpm lint
pnpm build
pnpm dev
```

### Supabase

1. 创建项目并配置 Google OAuth；
2. 依文件名顺序应用 `supabase/migrations/`；
3. 检查所有用户数据表已启用 RLS；
4. 设置 `GEMINI_API_KEY`；
5. 部署 `generate-grammar-practice`；
6. 将公开 URL 与 publishable key 写入本地或部署平台环境变量。

### 前端部署

Vercel 等静态部署平台应执行 `pnpm build` 并发布 Vite 的构建目录。OAuth 回调 URL、站点 URL 和允许的重定向地址需要在 Supabase 控制台同步配置。

## 9. 测试建议

当前项目最值得优先建立的自动化测试包括：

- 合法与非法 `LINGOTRACE_REPORT_V1` fixture；
- 重复报告导入的幂等性；
- 报告、单词、句型和纠错的事务一致性；
- 每个 RLS 策略的跨用户拒绝测试；
- Edge Function 的未登录、缺失 ID、每日限制、未完成恢复和 Gemini 回退；
- service worker 更新；
- 手机尺寸下的关键导入与复习流程。

测试 fixture 必须使用虚构内容，不能复制真实用户对话。

## 10. 版本与兼容性建议

未来引入 `LINGOTRACE_REPORT_V2` 时，不应直接改变 V1 语义。建议：

1. 以 schema_version 路由解析器；
2. 保留 V1 导入测试；
3. 在边界层将 V1/V2 映射到统一内部模型；
4. 更新 ChatGPT 项目指令；
5. 提供迁移说明和回滚方案。

## 11. 可观测性建议

在不记录原始私人学习内容的前提下，可记录：

- 导入成功/失败事件与错误代码；
- schema 版本；
- Edge Function 延迟、回退率和模型错误类别；
- 数据库操作失败率；
- PWA 版本和更新状态。

日志中避免保存完整 JSON、原句、正确句、用户 token 和第三方 API key。

