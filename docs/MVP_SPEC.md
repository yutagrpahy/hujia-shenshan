# 護家神山 — MVP 開發規格書

> 版本：0.6.0 MVP  
> 最後更新：2026-07-09
> 設計參照：[Material Design 3](https://m3.material.io/) + HeroUI + Nielsen Heuristics

---

## 1. 產品概述

| 項目 | 內容 |
|------|------|
| 產品名稱 | 護家神山 |
| 產品標語 | 全家一起守護，才是真保障 |
| 產品定位 | 跨世代家庭保障規劃平台 |
| 目標市場 | 台灣家庭（特別是多代同堂、高齡化家庭） |
| MVP 目標 | 幫助家庭輕鬆、視覺化地規劃與管理全家人的保障缺口。透過互動式情境模擬與家庭協作，讓「保障規劃」從複雜的財務議題，變成溫暖、有意義的家庭對話。 |
| 主要平台 | **響應式 Web App（Mobile-first）** |
| 次要平台 | 平板、桌機瀏覽器（M3 Expanded 斷點以上） |

---

## 2. 目標用戶與 User Story

### 2.1 目標用戶族群

| 族群 | 描述 | MVP 優先級 |
|------|------|-----------|
| 即將退休 / 已退休用戶 | 關注失能、長照理賠與退休保障 | P0 |
| 新婚 / 新手父母 | 關注意外保障與家庭財務影響 | P0 |
| 照顧高齡父母的子女 | 需與父母協作檢視保單、更新受益人 | P0 |
| 有成年子女的高齡父母 | 需簡易方式更新保單並通知家人 | P1 |
| 想為下一代做準備的用戶 | 需依人生階段獲得保障建議與教育 | P1 |

### 2.2 User Story

| # | 角色 | 需求 | 驗收標準（MVP） | 狀態 |
|---|------|------|----------------|------|
| US-01 | 即將退休或已退休用戶 | 清楚看到失能或長照時，家人每月能獲得多少理賠支持 | 總覽頁顯示每月理賠金；AI 顧問可模擬失能/長照情境 | ✅ MVP |
| US-02 | 新婚或新手父母 | 模擬「若今天發生意外，配偶與小孩生活受什麼影響」 | 情境模擬器支援意外/身故情境，顯示缺口與推薦保單 | ✅ MVP |
| US-03 | 照顧高齡父母的子女 | 與父母共同檢視保單、協作更新受益人、整理文件 | 成員頁可檢視保單/受益人；安全文件庫可上傳（UI） | ✅ MVP |
| US-04 | 有成年子女的高齡父母 | 簡易更新保單內容並讓家人看見狀態變化 | 理賠 Tab／系統待辦呈現保單作業狀態；完成待辦後各頁同步 | 🔶 部分（無實際編輯串接） |
| US-05 | 想為下一代做準備的用戶 | 依人生階段獲得保障建議與教育內容 | 總覽推薦內容區塊；教育文章/影片入口 | ✅ MVP |

---

## 3. 資訊架構（IA）

```
護家神山
├── 1. 總覽
│   ├── 問候橫幅 + 家庭保險健康分級入口
│   ├── 家庭保障總覽
│   │   ├── 保障健康度（依家庭保險健康分級滿分基準 + 保障缺口計算）
│   │   ├── 保障缺口（目前／目標分開標示 + 達成率 + 已投保成員）
│   │   ├── 壽險／醫療分域總覽（FamilyCoverageOverview）
│   │   └── 意外理賠分組（AccidentPayoutPanel）
│   ├── 待辦事件日曆（TodoCalendarPanel：週／月／年、紅點、詳情 Modal）
│   └── 推薦教育內容
│
├── 2. 理賠
│   ├── 分段：待處理｜進行中｜已完成
│   ├── 進度環 + 狀態標籤（續保提醒、待補件、申請中等）
│   ├── Tab badge：待處理項件數
│   └── 點擊卡片 → 保單詳情 Modal
│
├── 3. AI 顧問
│   ├── 歡迎引導區（AdvisorWelcome）
│   ├── 底部 Dock：對話｜情境模擬
│   └── 模擬結果 Modal
│
├── 4. 保障
│   └── 保障成員儀表板
│       ├── 成員列表 → 成員詳情
│       │   ├── 擁有保單（同業公會資訊系統 + 自行登載）
│       │   ├── 待辦提醒與保障規劃事件（MemberTodosSection）
│       │   ├── 已完成事件
│       │   └── 安全文件庫
│       └── 新增成員
│
└── 個人資料（右上角頭像進入，非 Tab）
    ├── 基本資料、健康分級、文件庫、同業公會資訊系統綁定
    └── 登出示意
```

> **已移除（v0.6.0）：** 獨立「提醒」Tab 與通知列表頁。保單到期、待補件、缺口補強等改由**系統待辦**（總覽日曆／成員待辦）與**理賠 Tab** 承載。

### 3.1 響應式導覽（M3 Breakpoints）

依 [Material Design 3 Layout](https://m3.material.io/foundations/layout/applying-layout/compact) 斷點規則：

| 斷點 | 視窗寬度 | 導覽形式 | 內容寬度 |
|------|---------|---------|---------|
| **Compact** | 0–599px | 底部導覽列（M3 Navigation Bar） | 全寬 |
| **Medium** | 600–839px | 頂部 Pill 導覽列 | 置中 `max-width: 45rem`（720px） |
| **Expanded** | 840px+ | 頂部 Pill 導覽列 + 寬鬆背景 | 置中 `max-width: 45rem`；總覽頁 `70rem` |

| Tab | 圖示 | 說明 |
|-----|------|------|
| 總覽 | LayoutDashboard | 首頁，家庭保障全貌 + 待辦日曆 |
| 理賠 | FileCheck2 | 出險／保單作業進度；待處理項 badge |
| AI 顧問 | Bot | 對話 + 情境模擬 |
| 保障 | Shield | 成員保單、待辦、保障規劃 |
| 個人資料 | 右上角頭像 | 獨立全頁視圖，非底部／頂部 Tab |

---

## 4. 功能規格

### 4.1 總覽頁

| 功能 | 規格 | MVP 實作 | 待補 |
|------|------|---------|------|
| 問候橫幅 | 個人化問候 + 健康分級入口；右下角山形裝飾圖（`hero-mountain-nobg.png`，寬 30%、去背） | ✅ `.hero-banner` | |
| 保障健康度 | 0–100 分圓環圖，依「家庭保險健康分級」滿分基準計算 | ✅ 五類缺口達成率平均 | 正式計算公式由 ______ 提供 |
| 家庭保險健康分級 | 五級問卷，定義滿分保障目標；總覽／個人資料可查看與重填 | ✅ | 問卷題庫擴充：______ |
| 保障缺口數值呈現 | 「目前 X 萬元／月」「目標 Y 萬元／月」分開標示 + 達成率 | ✅ `formatGapAmount` | |
| 保障缺口成員標示 | 每類缺口顯示已投保成員頭像與姓名 | ✅ 由保單資料推算 | |
| 固定保障額 | 非意外保單 `coverage` 加總 | ✅ | |
| 意外理賠 | 依事件類型分組（如就醫實支實付、意外身故／失能）；預設最多 5 類，可展開；點擊開啟詳情 Modal | ✅ `AccidentPayoutPanel` | |
| 保障缺口列表 | 5 類別進度條（含重大疾病保障）；0% 未達標以 coral 輔助色標示 | ✅ | 缺口類別與建議值公式：______ |
| 缺口詳情 Modal | 點擊缺口列開啟；顯示 `GapBreakdownDisplay` + `PolicyRecommendationPanel`（與情境模擬共用邏輯） | ✅ | |
| 待辦日曆 | 週／月／年視圖、紅點標示、點擊日期／待辦開啟詳情 Modal | ✅ `TodoCalendarPanel` | |
| 系統待辦 | 保單到期／待補件／缺口不足等由 `rulesEngine` 自動產生 | ✅ | |
| 缺口達標獎勵 | 達成目標時「已達標」徽章、漸層卡片、恭喜文案 | ✅ | |
| 推薦內容 | 3 則教育內容卡片 | ✅ 靜態 mock | CMS 串接：______ |

### 4.2 理賠頁

| 功能 | 規格 | MVP 實作 | 待補 |
|------|------|---------|------|
| 分段 Tab | 待處理｜進行中｜已完成 | ✅ `ClaimsPage` | |
| 狀態辨識 | 色彩標籤 + 左側色條 + 進度環 | ✅ | |
| 待處理 Badge | 底部／頂部「理賠」導覽顯示 `isError` 件數 | ✅ | |
| 動態列表 | 由 `buildFamilyClaims(members)` 依保單狀態產生 | ✅ | 同業公會資訊系統即時同步：______ |
| 續保／待補件 | `expiring`／`pending` 保單對應理賠態 | ✅ | |
| 保單詳情 | 點擊卡片開啟 `PolicyDetailModal` | ✅ | |
| 完成續保待辦後 | 保單改 `active` → 續保理賠項消失 | ✅ 規則引擎回寫 | |

### 4.3 待辦與歷史（分散於總覽／保障，無獨立 Tab）

| 功能 | 規格 | MVP 實作 | 待補 |
|------|------|---------|------|
| 總覽日曆 | 顯示有到期日之待辦、紅點、詳情 Modal | ✅ | |
| 成員待辦 | 保障 > 成員詳情：待辦 + 規劃事件同列表 | ✅ `MemberTodosSection` | |
| 系統待辦 | `source=system`，含續保、補件、缺口補強等 | ✅ `deriveSystemTodos` | |
| 事件待辦 | 新增保障規劃 → 自動建立同名待辦 | ✅ | |
| 手動待辦 | 使用者自行維護 | ✅ mock | |
| 勾選完成 | 移至 `historyTodos`；系統待辦可回寫保單 | ✅ `resolveTodoCompletion` | 推播通知：______ |
| 歷史事件 | 成員詳情「已完成」Modal | ✅ | |
| ~~獨立提醒頁~~ | — | ❌ 已移除 v0.6.0 | |
| ~~通知列表 UI~~ | — | ❌ 未實作；`AppNotification` 僅資料層預留 | P1 通知中心 |

### 4.4 AI 保障顧問頁

| 功能 | 規格 | MVP 實作 | 待補 |
|------|------|---------|------|
| 歡迎引導 | 首次進入（無使用者訊息）顯示 `AdvisorWelcome`：情境捷徑卡、建議提問列表 | ✅ | |
| AI 對話 | 自然語言提問 + 個人化建議；有對話後顯示訊息氣泡 + 建議 chip | ✅ 規則式 mock | LLM API / RAG：______ |
| 台灣稅務考量 | 遺產稅試算等 | ✅ mock 回覆 | 正式稅率表：______ |
| 長照資源 | 長照 2.0 給付說明 | ✅ mock 回覆 | |
| 遺產規劃 | 贈與免稅額、保險金不列入遺產 | ✅ mock 回覆 | |
| 底部 Dock | 圓角卡片式常駐區（`.advisor-dock`），頁籤「對話｜情境模擬」切換 | ✅ | |
| 頁籤樣式 | Segmented 切換按鈕；情境模擬區塊內 chip／表單保留左右呼吸留白，不貼邊 | ✅ | |
| 情境模擬表單 | Dock 內展開：成員、發生年齡滑桿、情境 chip、開始模擬 | ✅ `ScenarioSimulatorForm` compact | |
| 模擬輸出 | Bottom Modal：缺口試算 + 敘述 + 推薦保單 + 推薦顧問 | ✅ `PolicyRecommendationPanel` | 商品推薦引擎：______ |
| 支援情境 | 失能、長照、身故、意外、退休 | ✅ | |
| 手機鍵盤適配 | Compact 斷點 Dock 固定於底部導覽上方；`visualViewport` 偵測鍵盤高度並上移；`interactive-widget=resizes-content` | ✅ | |
| 缺口試算共用 | `computeGapFromMembers` / `simulateScenario` / 總覽缺口 Modal 共用同一套計算與呈現元件 | ✅ | |

### 4.5 保障頁

#### 4.5.1 個人基本資料

| 欄位 | 類型 | 必填 | MVP |
|------|------|------|-----|
| 姓名 | 文字 | ✅ | ✅ |
| 年齡 | 數字 | ✅ | ✅ |
| 職業 | 文字 | | ✅ |
| 電話 | 電話 | | ✅ |
| Email | Email | | ✅ |
| 月收入 | 金額 | | ✅ |
| 月支出 | 金額 | | ✅ |
| 身分證字號 | 文字 | | ⬜ 待補 |
| 地址 | 文字 | | ⬜ 待補 |
| 婚姻狀態 | 選項 | | ⬜ 待補 |
| 編輯功能 | — | — | ⬜ MVP 僅展示，未開放編輯 |
| 家庭保險健康分級 | 查看分級、重新填寫五級問卷 | ✅ | |
| 登出 | 示意按鈕 + 說明 Modal（依帳號顯示資料，不實際登出） | ✅ | |
| 進入方式 | **僅**右上角頭像點擊 | ✅ `isProfileView` |
| 保障頁個人資料 Tab | — | — | ❌ 已移除 |

#### 4.5.2 保障成員儀表板

| 功能 | MVP | 待補 |
|------|-----|------|
| 成員列表卡片（DiceBear 角色頭像） | ✅ | |
| 成員數同步 | 頂部「N 位成員」隨 `members.length` 更新 | ✅ | |
| 成員詳情（保單、受益人、待辦、保障規劃、文件庫） | ✅ | |
| 擁有保單 — 同業公會資訊系統 | 標示「同業公會資訊系統」chip；說明資料來自中華民國保險商業同業公會之資訊系統 | ✅ `source=union` | 正式 API：______ |
| 擁有保單 — 自行登載 | 「新增」按鈕（樣式同保障規劃）；虛線邊框卡片 +「自行登載」chip；Modal 表單登載 | ✅ `addManualPolicy` | |
| 保單來源區隔 | 同業公會資訊系統（teal + Link 圖示）vs 自行登載（sand 虛線 + Pen 圖示） | ✅ | |
| 保障規劃（原事件功能） | 成員詳情內區塊，可新增生命事件 | ✅ | |
| 瀏覽他人文件庫 | ✅ 僅供瀏覽標籤 | |
| 上傳文件（限本人） | ✅ 綠色系 accent 按鈕，依 `currentUserId` 判斷 | 後端權限：______ |
| 新增成員表單 | ✅ UI | 後端持久化：______ |
| 邀請成員（角色權限） | ⬜ | 邀請流程：______ |
| 受益人編輯 | ⬜ 僅展示 | 變更流程：______ |

#### 4.5.3 角色權限

| 角色 | 可檢視 | 可編輯 | 可邀請 | 可存取文件庫 |
|------|--------|--------|--------|--------------|
| 家庭管理者 (owner) | ⬜ | ⬜ | ⬜ | ⬜ |
| 配偶 (spouse) | ⬜ | ⬜ | ⬜ | ⬜ |
| 子女 (child) | ⬜ | ⬜ | ⬜ | ⬜ |
| 父母 (parent) | ⬜ | ⬜ | ⬜ | ⬜ |
| 檢視者 (viewer) | ⬜ | ⬜ | ⬜ | ⬜ |

#### 4.5.4 保障規劃（生命事件，合併至成員詳情）

| 欄位 | 類型 | 必填 | MVP |
|------|------|------|-----|
| 呈現位置 | 保障 > 保障成員 > 成員詳情 > 保障規劃 | — | ✅ |
| 事件名稱 | 文字 | ✅ | ✅ |
| 事件類型 | 選填列舉 | | ✅ 9 種 |
| 事件日期 | 日期 | | ✅ |
| 事件頻率 | once / monthly / yearly | ✅ | ✅ |
| 所需資金 | 金額 | | ✅ |
| 緊急程度 | high / medium / low | ✅ | ✅ |
| 事件描述 | 文字 | | ✅ |
| 關聯成員 | 多選（預設當前成員） | | ✅ |
| 新增後自動建立待辦 | — | — | ✅ 出現在成員待辦列表 |
| 獨立「事件」Tab | — | — | ❌ 已移除，合併至成員詳情 |
| 拖拉式時間軸 | — | — | ⬜ P2（MVP 以列表呈現） |

#### 4.5.4a 家庭保險健康分級（期望保障生活問卷）

| 項目 | 規格 | MVP |
|------|------|-----|
| 觸發時機 | 建立帳號／家庭時先填寫；之後可於個人資料重填 | ✅ 空狀態 onboarding |
| 分級數量 | 5 級（基礎守護 → 頂級守護） | ✅ |
| 滿分定義 | 各級對應身故／醫療／長照／失能建議值 | ✅ `ProtectionLifeProfile.targets` |
| 健康度計算 | 實際保障 / 分級目標，五類缺口達成率平均 | ✅ |
| 入口位置 | 總覽健康度區、個人資料頁 | ✅ 「家庭保險健康分級」標籤 |
| 類比 | 如同金融投資風險屬性問卷，可隨人生階段調整 | ✅ |

#### 4.5.5 安全文件庫

| 功能 | MVP | 待補 |
|------|-----|------|
| 文件列表展示 | ✅ | |
| 文件歸屬 | `ownerMemberId` 關聯成員 | |
| 個人資料頁 | 僅顯示本人文件 + 可上傳 | ✅ |
| 保障成員詳情 | 顯示該成員文件；非本人僅瀏覽 | ✅ |
| 文件類型 | 遺囑、信託、醫療指示、合約、保單 | |
| 加密標示 | ✅ UI | 加密標準：______ |
| 緊急存取權限 | ✅ UI | 觸發條件：______ |
| 上傳權限 | 僅 `ownerMemberId === currentUserId` | 正式 RBAC：______ |
| 單檔大小上限 | ⬜ | ______ MB |

---

## 5. 資料模型

### 5.1 FamilyMember（家庭成員）

```
id, name, age, role, lifeStage, avatarColor,
phone, email, occupation,
monthlyIncome, monthlyExpense,
policies[]
```

### 5.2 SecureDocument（安全文件）

```
id, name, type, ownerMemberId, uploadedBy, uploadedAt, encrypted, emergencyAccess[]
```

### 5.3 Policy（保單）

```
id, name, insurer,
type(life|health|accident|longterm|savings|disability|critical),
coverage, monthlyPayout, eventPayout, premium,
beneficiary, expiryDate, status(active|expiring|expired|pending),
source(union|manual)
```

| `source` | 說明 |
|----------|------|
| `union` | 串聯中華民國保險商業同業公會之資訊系統；成員登入後自動同步（mock 預設） |
| `manual` | 使用者自行登載，不與同業公會資訊系統同步 |

Mock 示意含台灣市場各家知名保險公司：國泰、富邦、新光、南山、台灣人壽、全球人壽等；示範家庭 6 位成員、擬真保單組合。

### 5.3c NewPolicyInput（自行登載表單）

```
name*, insurer*, type*, beneficiary?, expiryDate?, coverage?
```

### 5.3a ProtectionLifeProfile（家庭保險健康分級）

```
tier(1-5), tierLabel, tierDescription,
targets{ deathCoverage, medicalCoverage, longtermMonthly, disabilityMonthly, criticalCoverage },
completedAt, answers{}
```

### 5.3b CoverageGap（保障缺口）

```
category, gapKey, current, recommended, unit, coveredMembers[]
```

### 5.4 TodoItem（待辦事件）

```
id, title, memberId, memberName, policyId?, ruleId?,
urgency, dueDate?, completed, completedAt?,
source(manual|event|system), eventId?
```

| `source` | 說明 |
|----------|------|
| `system` | 由 `rulesEngine.deriveSystemTodos` 依保單／缺口即時產生 |
| `event` | 新增保障規劃時自動建立 |
| `manual` | 示範用手動待辦 |

### 5.5 FamilyEvent（家庭事件）

```
id, name, type?, date?, frequency, fundsNeeded,
urgency, description?, memberIds[], createdBy
```

### 5.6 AppNotification（通知資料模型）

```
id, type(policy-update|policy-expiry|policy-purchase|claim-progress),
title, message, date, read, memberId?
```

> **v0.6.0：** `deriveNotifications` 於 Context 產生，**前端尚無通知列表 UI**。使用者可見的「提醒」以系統待辦 + 理賠狀態呈現。

### 5.7 資料串聯規則

| 來源 | 目標 | 規則 |
|------|------|------|
| 全家保單 `members` | 總覽缺口／理賠列表 | 即時計算 `computeCoverageSummary`、`buildFamilyClaims` |
| 保單狀態／缺口 | 系統待辦 | `deriveSystemTodos` → 合併至 `todos` |
| 完成續保／補件待辦 | 保單狀態 | `resolveTodoCompletion` 回寫 `members` |
| 新增家庭事件 | 成員待辦 | 自動建立同名待辦，`source=event` |
| 總覽日曆／成員待辦 | 同一 `todos` | `mergeTodos(system, persisted)` |
| 勾選待辦完成 | 歷史事件 | 移至 `historyTodos`，附 `completedAt` |
| 自行登載保單 | 成員 `policies[]` | `addManualPolicy` → `source=manual`，納入缺口計算 |

---

## 6. 保單與保障計算

| 項目 | MVP 實作 | 待補 |
|------|---------|------|
| 保單資料來源 | 同業公會資訊系統（mock `union`）+ 自行登載（`manual`） | 同業公會資訊系統 API：______ |
| 保障健康度公式 | 5 類缺口達成率平均（滿分 = 家庭保險健康分級目標） | 正式公式：______ |
| 缺口類別 | 身故、醫療、重大疾病、長照月給付、失能收入替代 | 是否需增減：______ |
| 意外理賠分組 | `groupAccidentPayouts` 依 `eventType` 聚合，UI 最多顯示 5 組 | ✅ |
| 日曆基準日 | `CALENDAR_TODAY = 2026-07-08`（`utils/calendar.ts`） | ✅ |
| 缺口現值 | 由成員保單加總推算 | ✅ |
| 缺口建議值 | 依 `ProtectionLifeProfile.targets` | ✅ |
| 已投保成員 | 依保單類型對應成員列表 | ✅ |
| 建議保障值 | 隨健康分級動態調整 | ✅ |
| 理賠金計算 | 保單欄位加總 | |
| 情境模擬公式 | 覆蓋率 × 保額 / 120 | 正式精算模型：______ |
| 南山商品推薦 | 固定 3 張 mock | 商品資料庫：______ |

---

## 7. 設計規範

### 7.1 設計系統

| 項目 | 規範 |
|------|------|
| 主要參照 | [Material Design 3](https://m3.material.io/) |
| UI 元件庫 | HeroUI v3 + Tailwind CSS v4 |
| App Icon | `BrandLogo` → `/app-icon.png`（圓角 app 圖示，頂部選單不變） |
| 產品標準字 | `BrandHeader` + **Noto Serif TC**（Google Fonts CDN, wght 900） |
| 產品標語 | 「全家一起守護，才是真保障」；字級介於標準字與家庭說明之間 |
| 標準字色 | `#0a3d2e`（`--color-brand-wordmark`）；標語 `#1f5f57` |
| 字型 CDN | Noto Sans TC（UI 正文）+ Noto Serif TC（標準字）+ Roboto |
| 角色 IP | [DiceBear Adventurer](https://www.dicebear.com/)（MIT 開源） |
| 可用性原則 | Nielsen Heuristics，特別重視 Recognition rather than recall |
| 裝置策略 | Mobile-first 響應式；Compact 底部導覽 / Medium+ 頂部 Pill 導覽 |
| 閱讀寬度 | 單欄 `45rem`（720px）；總覽寬版 `70rem`（1120px） |
| 視覺調性 | 溫暖淺色系、漸層橫幅、圓角角色頭像、避免模板感 |

### 7.2 色彩

| 角色 | 色碼 | 用途 |
|------|------|------|
| Accent / Primary | `#2d7a70` | **全系統 accent 色**、導覽 active、按鈕、健康度 |
| Primary Container | `#d4efec` | 強調背景 |
| Secondary | `#3d9b8f` | 輔助綠、漸層按鈕 |
| 上傳按鈕 | `btn-accent` 綠色漸層 | 避免 wireframe 中性色 |
| Surface | `#faf9f7` | 頁面背景 |
| Surface Container | `#ffffff` | 卡片背景 |
| Outline | `#e8e4dd` | 邊框 |
| Brand Wordmark | `#0a3d2e` | 頂部產品標準字 |
| Brand Tagline | `#1f5f57` | 產品標語 |
| Coral 輔助 | `#d97055` / `#e8917a` | 「尚未投保」缺口 urgent（`.gap-urgent`） |

### 7.2a 頂部品牌標準字排版

| 元素 | Compact（手機） | Medium+（桌機） | 說明 |
|------|----------------|----------------|------|
| 產品標準字 | 17px / w900 | 22px / w900 | Noto Serif TC；標準字右側排列標語 |
| 產品標語 | 11px / w500 | 13px / w500 | Noto Sans TC；極窄螢幕（≤380px）標語換行 |
| 家庭說明 | 10px | 12px | 「王建國家庭 · N 位成員」 |

### 7.3 元件樣式（M3 對應）

| M3 元件 | 護家神山實作 |
|---------|-------------|
| Top App Bar（Compact） | `.m3-app-bar.warm-header` + `BrandLogo` + `BrandHeader` |
| Navigation Bar（Compact） | `.m3-bottom-nav` 底部 4-tab |
| Top Navigation（Medium+） | `.desktop-top-nav` + `.top-nav-pill` + `BrandHeader` |
| 品牌標頭 | `BrandHeader`：標準字 + 標語 + 成員說明 |
| AI 顧問 Dock | `.advisor-dock` 圓角卡片；`.advisor-mode-toggle` 頁籤；手機 fixed + 鍵盤推升 |
| Content Container | `.content-container` 置中 720px |
| Wide Container | 全 Tab 統一 `.content-container--wide` 1120px；`scrollbar-gutter: stable` 防位移 |
| Cards | `.m3-card` 圓角 20px |
| Warm Card | `.m3-card-warm` 暖色漸層 |
| Hero Banner | `.hero-banner` + `.hero-banner__art` 山形裝飾（`public/hero-mountain-nobg.png`） |
| 意外理賠面板 | `AccidentPayoutPanel` 分組列表 + 詳情 Modal |
| 待辦日曆 | `TodoCalendarPanel` 週／月／年 + `TodoDetailModal` |
| 缺口推薦 | `GapRecommendationModal` + `PolicyRecommendationPanel` |
| 保單來源標示 | 同業公會資訊系統 chip / 自行登載 chip（保障 > 成員詳情） |
| Member Avatar | DiceBear `MemberAvatar` 元件 |
| Family Mascot | 品牌守護精靈 IP |
| Segmented Button | `.m3-segment` 次頁籤切換 |
| Bottom Sheet | HeroUI Modal `placement="bottom"`（手機）/ `center`（桌機） |

### 7.4 多狀態設計

| 狀態 | 觸發時機 | UI 表現 | MVP |
|------|---------|---------|-----|
| 空狀態 | 尚未建立家庭 | 溫暖引導 + 「建立我的家庭」按鈕 | ✅ |
| 載入狀態 | AI 模擬計算中 | 半透明遮罩 + Spinner | ✅ |
| 錯誤狀態 | 資料衝突 | 紅色橫幅 + 重試按鈕 | ✅ |
| 成功狀態 | 規劃更新、待辦完成 | 綠色橫幅 + 家人通知預覽文案 | ✅ |

---

## 8. 技術架構（MVP）

| 項目 | 選型 |
|------|------|
| 框架 | React 19 + TypeScript |
| 建置 | Vite 8 |
| 樣式 | Tailwind CSS v4 + HeroUI v3 |
| 圖示 | Lucide React |
| 角色頭像 | DiceBear API（`utils/avatars.ts`） |
| 狀態管理 | React Context（AppContext）；`rulesEngine` 衍生待辦 |
| 路由 | Tab 切換（無 URL 路由） |
| 手機鍵盤適配 | `useMobileKeyboardOffset`（visualViewport）+ `useElementHeight` |
| Viewport | `interactive-widget=resizes-content`（`index.html`） |
| 後端 | ⬜ 無（前端 mock） |
| 認證 | ⬜ 無 |
| 資料持久化 | ⬜ 無（記憶體狀態） |

### 8.1 專案結構

```
legacymap/
├── docs/
│   ├── MVP_SPEC.md               ← 本文件
│   └── CASE_STUDY.md             UI/UX Case Study
├── public/
│   ├── app-icon.png
│   └── hero-mountain-nobg.png
├── src/
│   ├── types/
│   ├── data/mockData.ts, claims.ts
│   ├── services/rulesEngine.ts   待辦規則引擎
│   ├── utils/calculations.ts, calendar.ts
│   ├── context/AppContext.tsx
│   ├── components/
│   │   ├── layout/AppShell.tsx
│   │   ├── overview/             總覽 + 待辦日曆
│   │   ├── claims/ClaimsPage.tsx
│   │   ├── advisor/
│   │   └── protection/             成員待辦 + 保障規劃
│   └── App.tsx
└── package.json
```

---

## 9. API 與整合（待補）

| 整合項目 | 優先級 | 端點 / 規格 | 狀態 |
|---------|--------|------------|------|
| 同業公會資訊系統 API | P0 | 成員登入後同步保單（`Policy.source=union`） | ⬜ |
| 南山保單 API | P1 | ______ | ⬜ |
| 使用者認證 (SSO) | P0 | ______ | ⬜ |
| AI / LLM 服務 | P1 | ______ | ⬜ |
| 推播通知 (FCM / LINE) | P1 | ______ | ⬜ |
| 文件加密儲存 | P2 | ______ | ⬜ |
| CMS 教育內容 | P2 | ______ | ⬜ |
| 商品推薦引擎 | P1 | ______ | ⬜ |

---

## 10. 非功能需求

| 項目 | MVP 目標 | 正式版目標 | 狀態 |
|------|---------|-----------|------|
| 支援裝置 | 手機瀏覽器 (iOS Safari, Android Chrome) | + 平板、桌機 | ✅ MVP |
| 響應式 | M3 斷點：599/600/840px；內容置中有限寬 | 大螢幕多欄排版 | ✅ |
| 無障礙 | 基本 aria-label | WCAG 2.1 AA | 🔶 部分 |
| 語言 | 繁體中文 | | ✅ |
| 效能 | 模擬計算 < 3 秒 | < 1 秒 | ✅ mock |
| 資安合規 | — | 個資法、金融業個資規範 | ⬜ |
| 離線支援 | — | PWA / 快取 | ⬜ |

---

## 11. MVP 範圍界定

### 11.1 P0 — 本版已實作 ✅

- [x] 響應式 4-tab 導覽：總覽／理賠／AI 顧問／保障
- [x] 內容置中舒適閱讀寬度（720px / 總覽 1120px）
- [x] 總覽：健康度、壽險／醫療分域、五類缺口、待辦日曆、缺口推薦 Modal
- [x] 理賠：分段 Tab、進度環、待處理 badge、保單狀態驅動列表
- [x] 待辦：總覽日曆 + 成員待辦；系統待辦規則引擎；完成可回寫保單
- [x] AI 顧問：歡迎引導 + Dock（對話｜情境模擬）+ 離線規則回覆（無錯誤提示文案）
- [x] 保障：成員詳情、同業公會資訊系統／自行登載、保障規劃、已完成事件、文件庫
- [x] 右上角頭像導向個人資料；成員數動態同步
- [x] App Icon（`app-icon.png`）+ 產品標準字（Noto Serif TC）+ 標語「全家一起守護，才是真保障」
- [x] 總覽歡迎區山形裝飾圖（右下角 30% 去背）
- [x] 家庭保險健康分級五級問卷（onboarding + 重填）
- [x] 保障缺口顯示已投保成員；保單含台灣各家保險公司
- [x] 理賠 Tab 待處理 badge；accent 綠色系按鈕
- [x] 個人資料獨立頁（頭像進入）、登出示意
- [x] 保障缺口「目前／目標」分開標示
- [x] 文件上傳權限示意（本人可上傳、他人僅瀏覽）
- [x] DiceBear 角色 IP + 家庭守護精靈
- [x] 溫暖活潑視覺（漸層、暖色卡片、問候橫幅）
- [x] 多狀態 UI（空/載入/錯誤/成功）

### 11.2 P1 — 下一階段 ⬜

- [ ] 同業公會資訊系統 API 正式串接（取代 mock `union`）
- [ ] 保單/成員資料編輯與後端持久化
- [ ] 真實 AI LLM 串接
- [ ] 邀請成員與角色權限控管
- [ ] 受益人變更流程
- [ ] 通知中心 UI + 推播 / Email 通知
- [ ] 教育內容詳情頁

### 11.3 P2 — 未來版本 ⬜

- [ ] 拖拉式生命事件時間軸
- [ ] 文件加密上傳與緊急存取
- [ ] 南山保單 API 即時同步
- [ ] 理賠申請進度即時追蹤
- [ ] PWA 離線支援
- [ ] 多家庭切換

---

## 12. 驗收檢查清單

| # | 檢查項目 | 預期結果 |
|---|---------|---------|
| AC-01 | 開啟 App 預設顯示總覽頁 | 看到問候橫幅（含山形裝飾）、健康度、固定保障額、意外理賠分組 |
| AC-24 | 頂部品牌標頭 | 標準字 Noto Serif TC 深綠色；標語在旁、字級介於標準字與家庭說明之間；App icon 不變 |
| AC-25 | 保障 > 成員保單 | union 保單顯示「同業公會資訊系統」；可自行登載並顯示「自行登載」區隔 |
| AC-26 | AI 顧問 Dock | 對話／情境模擬頁籤圓角卡片；情境 chip 左右留白；手機輸入時 Dock 隨鍵盤上移 |
| AC-27 | 總覽待辦日曆 | 週／月／年切換、紅點、點擊開啟詳情 Modal |
| AC-28 | 重大疾病缺口 | 列表含重大疾病保障；0% 時 coral 標示並可開啟 AI 推薦 |
| AC-02 | 總覽待辦日曆 | 週／月／年切換，有到期日待辦顯示紅點，可開詳情 Modal |
| AC-22 | 全 Tab 內容寬度 | 與總覽相同 1120px，切換 Tab 無水平位移 |
| AC-23 | 保障缺口達標 | 醫療保障等達 100% 時顯示達標視覺獎勵 |
| AC-03 | 勾選待辦完成 | 移至歷史事件，顯示成功橫幅 |
| AC-04 | 成員詳情新增保障規劃 | 成員待辦列表出現對應項目 |
| AC-11 | 點擊右上角頭像 | 進入獨立「個人資料」全頁視圖 |
| AC-12 | 新增成員 | 頂部成員數同步更新 |
| AC-13 | 理賠待處理項 | 底部／頂部理賠 Tab 顯示 badge |
| AC-20 | 完成續保系統待辦 | 保單改 active，理賠續保提醒消失 |
| AC-21 | 無獨立提醒 Tab | 導覽僅 4 Tab，不含 Bell／提醒 |
| AC-17 | 保障缺口數值 | 顯示「目前」「目標」分開標示，非 2/5 混淆格式 |
| AC-18 | 個人資料登出 | 顯示登出按鈕與示意說明 Modal |
| AC-19 | 保障頁 | 僅顯示保障成員，無個人資料頁籤 |
| AC-14 | 保障缺口區塊 | 顯示該類型已投保成員 |
| AC-15 | 家庭保險健康分級 | 總覽／個人資料可查看與重填，分數隨分級更新 |
| AC-16 | 空狀態建立家庭 | 先填寫期望保障生活問卷 |
| AC-05 | AI 顧問情境模擬 | 顯示理賠金、缺口、推薦保單 |
| AC-06 | 保障成員詳情頁 | 顯示保單、受益人、待辦、文件庫 |
| AC-07 | 瀏覽他人文件 | 顯示「僅供瀏覽」、無上傳按鈕 |
| AC-08 | 空狀態（hasFamily=false） | 顯示守護精靈與溫暖引導 |
| AC-09 | 手機寬度 375px | 底部導覽正常 |
| AC-10 | 桌機寬度 1280px | 頂部 Pill 導覽、內容置中不超寬 |

---

## 13. 待決事項（TBD）

| # | 問題 | 負責人 | 截止日期 |
|---|------|--------|---------|
| TBD-01 | 保障健康度與缺口正式計算公式 | ______ | ______ |
| TBD-02 | 同業公會資訊系統 API 規格與測試環境 | ______ | ______ |
| TBD-02a | 南山保單 API 規格與測試環境 | ______ | ______ |
| TBD-03 | AI 顧問部署方式（LLM / RAG / 規則引擎） | ______ | ______ |
| TBD-04 | 角色權限矩陣確認 | ______ | ______ |
| TBD-05 | 通知管道與頻率規則 | ______ | ______ |
| TBD-06 | 文件庫加密與緊急存取政策 | ______ | ______ |
| TBD-07 | 品牌色票最終確認（accent 綠 `#2d7a70` 已定案） | ______ | ______ |
| TBD-08 | 保單到期提醒天數 N | ______ | ______ |

---

## 14. 修訂紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| 0.1.0 | 2026-07-08 | 初版 MVP 規格，依用戶提供規格建立 |
| 0.2.0 | 2026-07-08 | 響應式斷點、頂部導覽、文件庫權限、DiceBear IP、溫暖視覺 |
| 0.3.0 | 2026-07-08 | 頭像導向個人資料、BrandLogo、健康分級問卷、事件併入保障規劃、缺口成員、多保險公司 mock、Badge 未讀、accent 綠 |
| 0.4.0 | 2026-07-08 | Badge 改置通知卡片、缺口目前/目標分開、個人資料獨立頁+登出示意、移除保障頁籤、山形 Logo 重設計 |
| 0.5.0 | 2026-07-08 | 產品標準字（Noto Serif TC）+ 標語；保單集保／自行登載；AI 顧問 Dock 重構與手機鍵盤適配；總覽意外理賠分組、待辦日曆、重大疾病缺口、歡迎區山形圖；6 位成員 mock；缺口試算共用元件 |
| 0.6.0 | 2026-07-09 | 移除獨立提醒 Tab；新增理賠 Tab；待辦規則引擎（`rulesEngine`）；待辦分散於總覽日曆／成員詳情；理賠列表改保單狀態優先；AI 對話隱藏離線錯誤提示；`CASE_STUDY.md` |