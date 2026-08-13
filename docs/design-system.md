## CryptoTool V1.0 最终架构设计书（平台化冻结版 Rev.2）

**Cyber Security & Cryptography Research Platform**

------

**版本**：V1.0-final (rev.2)
**日期**：2026-08-01
**状态**：✅ 架构冻结（实际开发对齐版），已进入功能交付阶段

> **修订说明**：
> 本文档基于 CryptoTool V1.0‑final rev.1 架构设计书进行工程对齐与开发进度同步。严格依据实际项目结构更新目录树，移除未使用的预留（如 `public/fonts`），补充已实现的业务模块（统计命令、字典引擎、分析引擎、全局爆破 Store 等），并将 CI 配置调整为实际使用的 `ci.yml`。新增“开发进度”章节，明确已完成功能、待实现功能与远期规划。版本号回归 V1.0，以当前交付成果为基准。

------

## 一、项目定位

### 1.1 名称

**CryptoTool**

### 1.2 一句话描述

面向安全研究人员、CTF 玩家、密码工程师的：
**高性能、跨平台、模块化安全计算能力管理平台**。

### 1.3 核心主张

> **Provider 化 · 高性能 · 高安全 · 工程化 · 可扩展 · 开源友好**

CryptoTool V1.0 的定位不再是简单的“密码算法工具箱”，而是：

text

```
Security Computing Platform
```



集 **密码计算、密码分析、弱密码检测、文件安全处理、CTF 辅助分析、国密研究、安全插件生态** 于一体的现代化安全研究平台。

### 1.4 产品形态演进

**原有工具集**

text

```
CryptoTool
├── Hash
├── AES
├── RSA
├── Crack
└── Analyzer
```



不足：模块间耦合紧密，增加新能力必须修改核心代码，难以长期维护与扩展。

**V1.0 平台化**

text

```
CryptoTool Platform
        Provider Runtime
              │
 ┌────────┬────────┬────────┐
Hash    Crypto   Crack   Analyzer
              │
        Engine Runtime
              │
       CPU / GPU / Plugin
```



能力动态注册、插件扩展、生命周期管理、平台化演进。

------

## 二、核心设计目标

### 2.1 Provider First 架构

所有安全能力均抽象为 **Provider**。
Provider 负责：能力描述、参数定义、生命周期管理、调度入口、UI 元数据。
Engine 负责：高性能计算、算法实现、CPU/GPU 调度。
即：`Provider = What`，`Engine = How`。

### 2.2 高性能计算目标

- 核心计算全部采用 Rust
- 多线程并行（Rayon Worker Pool）
- SIMD 优化
- GPU Backend 预留
- 大文件流式处理

### 2.3 高安全性

- Rust 内存安全，无 GC，无运行时
- 敏感数据仅存内存，使用 zeroize 主动清理
- 禁止日志泄露
- 最小权限模型（Tauri Capability 严格控制）
- 第三方插件运行于受限 Sandbox，防止越权

### 2.4 平台化扩展

- 第三方算法插件
- 企业内部安全插件
- CTF 扩展模块
- 国密扩展包
- GPU 加速模块
  均可在不修改核心代码的前提下接入。

### 2.5 工程化

- 跨平台：Windows / Linux / macOS
- 中英文国际化，支持即时切换
- 暗黑/浅色/跟随系统主题，Token 化设计
- 插件管理、版本管理、审计记录预留
- CI/CD 自动构建与测试

------

## 三、技术栈

| 层级       | 技术                           | 职责                                    |
| :--------- | :----------------------------- | :-------------------------------------- |
| 桌面框架   | Tauri 2.x                      | 窗口管理、系统集成、IPC、安全权限、打包 |
| 前端框架   | React 18 + TypeScript          | UI、状态管理、用户交互                  |
| 构建工具   | Vite                           | 前端构建、开发服务器                    |
| UI 框架    | TailwindCSS + shadcn/ui        | CC‑Switch 风格桌面 UI                   |
| 状态管理   | Zustand                        | 全局状态管理                            |
| 数据请求   | TanStack Query                 | 异步数据缓存与同步                      |
| 国际化     | react‑i18next                  | 多语言支持                              |
| 后端       | Rust                           | 核心计算、安全逻辑                      |
| 异步运行时 | Tokio                          | 服务调度、任务管理                      |
| 并行计算   | Rayon                          | CPU 并行计算                            |
| 数据库     | SQLite                         | Provider、任务、配置、审计数据持久化    |
| 序列化     | serde                          | IPC DTO、配置序列化                     |
| 加密清理   | zeroize                        | 敏感数据安全销毁                        |
| 插件运行   | Plugin Runtime                 | Provider 扩展沙箱                       |
| 测试       | Criterion + Vitest + Rust Test | 性能、单元、集成测试                    |

------

## 四、总体架构

text

```
                  React Frontend
                         │
                  Tauri IPC (invoke/event)
                         │
              ┌──────────┴──────────┐
              │    Command Layer     │  参数校验、DTO 转换
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │    Service Layer     │  业务流程、权限控制、Task 创建
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │  Provider Runtime   │  能力注册、查询、生命周期
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
 Hash Provider   Crypto Provider   Crack Provider  ...
        │                │                │
        └────────────────┼────────────────┘
                         │
              ┌──────────┴──────────┐
              │   Engine Runtime    │  纯计算，零业务逻辑
              └──────────┬──────────┘
                         │
              ┌──────────┴──────────┐
              │ Worker Pool Runtime │  CPU/GPU Backend
              └─────────────────────┘
```



### 4.1 分层职责

- **Command Layer**：接收 IPC，基础参数校验，DTO 转换，调用 Service。禁止包含业务逻辑或算法计算。
- **Service Layer**：业务编排、Provider 调度、权限检查、Task 创建。例如启动哈希任务 → 选择 Hash Provider → 调用 Hash Engine。
- **Provider Runtime**：Provider 注册表、能力查询、生命周期钩子（加载、卸载、激活、休眠）。每个 Provider 对外提供统一的 `execute` 接口。
- **Engine Runtime**：纯计算模块，要求零 UI、零数据库、零文件权限，仅负责 `Input → Compute → Output`。
- **Task Runtime**：统一管理所有长时/短时任务（爆破、哈希、分析等），提供状态机、资源配额与暂停/恢复/取消能力。

### 4.2 IPC 错误协议

rust

```
#[derive(Debug, Serialize)]
pub struct AppError {
    pub code: String,           // e.g. "crypto.invalid_key_length"
    pub params: Vec<String>,    // e.g. ["32", "16"]
    pub severity: ErrorSeverity,
}
```



前端根据 `code` 匹配 i18n 模板并填充 `params`。

### 4.3 Event Bus（统一事件模型）

采用 `模块名-操作` 格式：

- `crack-update`：爆破进度与日志
- `history-update`：历史记录增量
- `hash-progress`：文件哈希进度
- `provider-registry-changed`：Provider 注册表变更
- `task-lifecycle`：任务生命周期事件

所有事件监听通过 `useEventBus` 钩子统一管理，确保组件销毁时自动注销。

### 4.4 Provider 协议（核心抽象）

rust

```
pub trait SecurityProvider: Send + Sync {
    fn metadata(&self) -> ProviderMetadata;
    fn capabilities(&self) -> Vec<Capability>;
    fn execute(&self, request: ProviderRequest) -> ProviderResponse;
    fn validate(&self, params: &Value) -> Result<(), AppError>;
}
```



`ProviderMetadata` 包含名称、版本、描述、分类、输入/输出 schema 等。

### 4.5 Task Runtime 状态机

text

```
  Created → Running → Completed
                ↓
              Paused → Running (恢复)
                ↓
              Stopped (不可恢复)
                ↓
              Failed
```



- 暂停/恢复：通过原子状态 + 分块迭代实现，保证 <200ms 响应延迟。
- 取消：释放所有信号量、临时文件、文件句柄。
- 资源配额：全局信号量限制并发数（爆破 1~2、哈希 2、KDF 1），同时限制阻塞线程总数。

------

## 五、项目完整目录结构（V1.0 实际对齐版）

以下目录树严格对应实际开发仓库，标 `*` 的为实际已实现的业务文件（包括合理扩展），与架构设计完全一致。

text

```
CryptoTool/
├── Cargo.toml                      # Workspace: members = ["src-tauri", "tests", "benchmarks", "plugin-sdk"]
├── package.json
├── vite.config.ts
├── tailwind.config.cjs
├── tsconfig.json
├── index.html
├── README.md
├── DEVELOPMENT.md
├── public/
│   └── favicon.ico
│
├── src/                            # React 前端 (Feature-based 架构)
│   ├── main.tsx
│   ├── App.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── api/
│   │   ├── index.ts                # Tauri invoke 封装与错误处理
│   │   └── types.ts                # IPC DTO 类型定义
│   ├── i18n.ts
│   ├── composables/
│   │   ├── useEventBus.ts
│   │   ├── useProviderRegistry.ts
│   │   └── useTask.ts
│   ├── features/
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx       # * 动态统计 + 快捷操作 + 最近历史
│   │   ├── providers/
│   │   │   ├── HashView.tsx        # * Hash Provider 视图
│   │   │   ├── CryptoView.tsx      # * Crypto Provider 视图
│   │   │   ├── CrackView.tsx       # * Crack Provider 视图（掩码/字典/暂停恢复）
│   │   │   ├── EncodeView.tsx      # * 编码占位视图
│   │   │   ├── AnalyzerView.tsx    # * Analyzer Provider 视图
│   │   │   └── ProviderPage.tsx    # * Provider 路由分发
│   │   ├── tasks/
│   │   ├── crypto-tools/
│   │   └── settings/
│   │       └── SettingsView.tsx    # * 设置页（主题/语言/隐私）
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # * 自定义标题栏（窗口控制/主题切换）
│   │   │   └── Sidebar.tsx         # * 动态 Provider 导航
│   │   └── common/
│   ├── stores/
│   │   ├── appStore.ts
│   │   ├── themeStore.ts           # * 主题状态管理
│   │   ├── historyStore.ts         # * 历史记录状态管理
│   │   ├── providerStore.ts        # * Provider 列表状态
│   │   ├── crackStore.ts           # * 爆破任务全局状态
│   │   └── privacyStore.ts         # * 隐私模式状态
│   ├── styles/
│   │   └── global.css              # 全局样式 + CSS 变量 Token
│   └── locales/
│       ├── zh-CN.json
│       └── en-US.json
│
├── src-tauri/                      # Tauri + Rust 后端
│   ├── Cargo.toml
│   ├── build.rs
│   ├── tauri.conf.json
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   └── src/
│       ├── main.rs
│       ├── lib.rs                  # 注册 commands，导出模块，定义 AppState
│       ├── error.rs
│       ├── commands/
│       │   ├── mod.rs
│       │   ├── hash_cmd.rs
│       │   ├── crypto_cmd.rs
│       │   ├── crack_cmd.rs
│       │   ├── analyzer_cmd.rs
│       │   ├── provider_cmd.rs
│       │   ├── system_cmd.rs
│       │   └── stats_cmd.rs        # * 仪表板统计命令
│       ├── services/
│       │   ├── mod.rs
│       │   ├── hash_service.rs
│       │   ├── crypto_service.rs
│       │   ├── crack_service.rs
│       │   └── analyzer_service.rs
│       ├── providers/
│       │   ├── mod.rs
│       │   ├── registry.rs
│       │   ├── hash_provider/
│       │   ├── crypto_provider/
│       │   ├── crack_provider/
│       │   └── analyzer_provider/
│       ├── engine/
│       │   ├── mod.rs
│       │   ├── hash_engine.rs
│       │   ├── crypto_engine.rs
│       │   ├── crack_engine.rs
│       │   ├── dictionary_engine.rs # * 字典文件流式读取
│       │   ├── analyzer_engine.rs   # * 分析引擎（哈希识别/弱密码/弱密钥）
│       │   └── gpu_backend.rs       # 预留
│       ├── task/
│       │   ├── mod.rs
│       │   ├── manager.rs
│       │   ├── state.rs
│       │   └── scheduler.rs
│       ├── plugin/
│       │   ├── mod.rs
│       │   ├── loader.rs
│       │   ├── sandbox.rs
│       │   └── manifest.rs
│       ├── storage/
│       │   ├── mod.rs
│       │   ├── db.rs
│       │   ├── models.rs
│       │   └── migrations.rs
│       ├── events.rs
│       └── utils/
│           ├── mod.rs
│           ├── temp_file.rs
│           └── zeroize_utils.rs
│
├── plugin-sdk/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       └── types.rs
│
├── tests/
│   ├── Cargo.toml
│   ├── kat/
│   │   ├── mod.rs
│   │   ├── hash_kat.rs
│   │   ├── aes_kat.rs
│   │   └── sm3_kat.rs              # 预留
│   ├── integration/
│   │   └── crack_integration.rs    # 预留
│   └── fixtures/
│       ├── aes_kat.json
│       ├── hash_kat.json
│       └── sm3_kat.json            # 预留
│
├── benchmarks/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       └── benches/
│           ├── hash_bench.rs
│           └── symmetric_bench.rs
│
├── docs/
│   ├── design-system.md
│   └── security-considerations.md
│
├── scripts/
│   ├── check-structure.mjs
│   └── scaffold.mjs
│
└── .github/
    └── workflows/
        └── ci.yml                  # 实际使用的 CI 配置
```



> **结构冻结原则**：
>
> - 所有业务模块必须遵循 Command → Service → Provider → Engine 分层。
> - 新增 Store、Engine、Command 需与本表对齐并更新本文档。
> - `plugin-sdk` 作为公共接口 crate，Provider 实现者只需依赖该 SDK。
> - 任何跨层调用或新增一级目录需经过架构评审。

------

## 六、Provider 系统设计

（此部分与之前版本一致，为保持完整性保留概要）

### 6.1 Provider 接口

定义于 `plugin-sdk/src/lib.rs`，是平台扩展的唯一合约。

### 6.2 Provider Registry

启动时自动注册内置 Provider；前端可查询 Provider 列表，侧边栏自动生成导航。

### 6.3 Provider 生命周期

加载 → 注册 → 激活 → 可服务，支持休眠与卸载。

### 6.4 插件沙箱

第三方插件受限运行，文件系统/网络访问需声明并获取用户许可。

------

## 七、核心功能模块（Provider 视角）

### 7.1 Hash Provider

- 支持 MD5, SHA256, SHA512（前端可选）
- 文本输入，即时计算并显示十六进制哈希
- 已通过 KAT 测试

### 7.2 Crypto Provider

- AES‑256‑GCM 加密/解密
- 随机密钥生成（Base64 编码的 32 字节密钥）
- nonce 自动生成并 prepend 到密文
- 加密/解密模式切换

### 7.3 Analyzer Provider

- 哈希类型识别（根据长度和字符集）
- 弱密码检测（基于长度与字符类型规则）
- DES 弱密钥检测（十六进制密钥输入）

### 7.4 Crack Provider

- **掩码攻击**：流式掩码生成，语法 `?d, ?l, ?u, ?a`，分块并行，进度实时推送
- **字典攻击**：流式读取字典文件，支持原生文件浏览对话框选择
- 暂停/恢复/停止控制
- 日志脱敏，命中结果独立显示
- 任务状态全局持久化（页面切换不丢失）

### 7.5 File Provider（规划中）

- 大文件流式编码/解码
- 文件哈希批量计算
- 临时文件安全管理

------

## 八、任务系统（Task Runtime）

- 统一任务状态机：Created → Running → Paused/Stopped/Failed
- 资源调度：全局信号量控制并发任务数
- 暂停与恢复：分块迭代 + 原子标志，响应延迟 < 200ms
- 取消与资源回收：立即设状态，释放线程、信号量和临时文件

------

## 九、数据存储设计（SQLite）

仅存储非敏感管理数据：Provider 信息、任务历史摘要、用户设置、审计日志。绝对不落盘的数据包括密钥、明文、中间缓冲区。

核心表：`providers`, `tasks`, `audit_log`。

------

## 十、安全设计（增强版）

- 内存历史记录，退出即销毁
- 隐私模式：开启后历史仅记录“某时某刻使用了某功能”
- 敏感数据 zeroize
- IPC 安全：文件路径传递，不传输内容；capability 严格限制
- 插件沙箱预留

------

## 十一、性能指标

| 场景                          | 目标                      |
| :---------------------------- | :------------------------ |
| 6位数字 MD5 爆破（100万空间） | < 1 秒（8核）             |
| SHA256 百万级字典             | < 10 秒                   |
| 1GB 文件 SHA256               | < 5 秒（首次<8秒）        |
| 应用冷启动                    | < 1.5 秒（首次）/ < 800ms |
| 爆破暂停响应                  | < 200ms                   |
| 包体积（Windows）             | < 20MB（不含 WebView2）   |

------

## 十二、测试策略

- **Rust 单元测试**：核心算法覆盖率 > 80%
- **KAT**：官方测试向量存放 `tests/fixtures/`，已覆盖 MD5、SHA256、AES‑GCM 往返
- **Criterion 基准**：独立 `benchmarks` crate（预留）
- **前端测试**：Vitest + React Testing Library（待补充）
- **CI**：GitHub Actions 自动运行 `cargo test --workspace` 和前端构建

------

## 十三、需求追踪矩阵（示例片段）

| 需求编号 | 模块 | 架构实现位置                                                 |
| :------- | :--- | :----------------------------------------------------------- |
| HA-01    | 哈希 | `HashProvider` → `hash_engine` → `commands/hash_cmd`         |
| CR-01    | 爆破 | `CrackProvider` → `crack_engine` → `task::manager`           |
| AN-01    | 分析 | `AnalyzerProvider` → `analyzer_engine` → `commands/analyzer_cmd` |
| ST-01    | 统计 | `stats_cmd` → `AppState` history                             |
| PL-01    | 插件 | `plugin::loader` → `plugin-sdk`                              |

------

## 十四、架构决策记录（ADR）

| ADR     | 标题                   | 决策摘要                                       |
| :------ | :--------------------- | :--------------------------------------------- |
| ADR-011 | Provider Runtime 架构  | 所有安全能力抽象为 Provider，Engine 纯计算     |
| ADR-012 | SQLite 数据层          | 用于 Provider、任务、审计等非敏感管理数据      |
| ADR-013 | Plugin SDK             | 通过独立 crate 定义公共接口                    |
| ADR-014 | Task Runtime           | 统一任务状态机与资源调度                       |
| ADR-015 | Sandbox 策略           | 第三方插件运行于受限沙箱                       |
| ADR-016 | Event Bus 统一事件模型 | 采用“模块-操作”命名，前端通过 useEventBus 管理 |

------

## 十五、附录 A：实现约束

1. **前端 API 类型同步**：`src/api/types.ts` 必须与 Rust DTO 严格一致，建议使用脚本自动生成。
2. **Provider 实现**：内置 Provider 必须实现 `SecurityProvider` trait，外部插件依赖 `plugin-sdk`。
3. **文件读取权限**：Tauri capability 不使用 `**` 通配符，仅允许用户对话框选择的路径或应用数据目录。
4. **临时文件**：使用 `tempfile` 创建，权限 0o600，任务结束/取消时强制删除，应用退出时遍历清理残留。
5. **历史记录容量**：任务历史记录限制在最近 1000 条，超过自动清理。
6. **国际化错误**：AppError code 在 `locales/` 中必须有对应翻译模板。
7. **全局事件监听**：强制使用 `useEventBus` 封装，禁止手动 `listen()`。

------

## 十六、附录 B：CC‑Switch 风格设计系统速览

| Token          | 值 / 说明                              |
| :------------- | :------------------------------------- |
| 主色           | #0F172A (slate-900) 作为主背景/强调色  |
| 辅助色         | #3B82F6 (blue-500) 交互元素            |
| 成功/信息/警告 | #10B981 / #06B6D4 / #F59E0B            |
| 字体           | Inter / 系统默认                       |
| 圆角           | 卡片 0.75rem，按钮 0.5rem              |
| 暗黑模式       | 跟随系统，提供手动切换                 |
| 卡片           | 轻微阴影 `shadow-sm`，悬停 `shadow-md` |

------

## 十七、开发进度

### ✅ 已完成功能（V1.0-beta）

- ☑ 

  应用壳：无边框自定义标题栏（窗口控制可用）、侧边栏动态 Provider 导航、内容区布局

- ☑ 

  主题系统：Token 化浅色/深色/跟随系统，全局 CSS 变量控制

- ☑ 

  国际化：中/英全局切换，所有 UI 元素均使用 `t()` 翻译

- ☑ 

  设置页：外观主题切换、语言切换、隐私模式（iOS 开关）

- ☑ 

  Hash Provider：MD5/SHA256/SHA512 计算，KAT 测试通过

- ☑ 

  Crypto Provider：AES‑256‑GCM 加密/解密，随机密钥生成

- ☑ 

  Crack Provider：掩码攻击与字典攻击（含文件浏览），暂停/恢复/停止，进度推送，日志脱敏，全局状态保持

- ☑ 

  Analyzer Provider：哈希识别、弱密码检测、弱密钥检测

- ☑ 

  任务管理：TaskManager 支持创建、取消、暂停、恢复

- ☑ 

  历史记录：内存存储，事件同步到 Dashboard，隐私模式可过滤内容

- ☑ 

  Dashboard：动态显示今日运算次数、活跃任务数、历史记录条目数

- ☑ 

  SQLite 存储层：数据库初始化，表结构（providers/tasks/audit_log）

- ☑ 

  插件 SDK 基础：`SecurityProvider` trait 定义

- ☑ 

  测试与 CI：KAT 测试（MD5/SHA256/AES-GCM），GitHub Actions 自动运行

- ☑ 

  结构检查脚本：`pnpm check-structure` 自动校验项目结构

### ⏳ 近期计划（V1.0 正式版）

- □ 

  任务历史持久化到 SQLite（当前仅内存）

- □ 

  插件 SDK 动态加载示例（加载一个外部 Provider）

- □ 

  窗口最大化/还原按钮状态实时同步（目前轮询，改为事件驱动）

- □ 

  部分错误码国际化补全

- □ 

  字典攻击暂停时保存文件偏移量（引擎已支持，未对接）

- □ 

  性能基准测试（Criterion）实际用例编写

- □ 

  前端关键逻辑单元测试（Vitest）

### 🔮 远期规划（V1.1+）

- □ 

  File Provider：大文件流式编码/解码、哈希

- □ 

  插件市场 UI

- □ 

  GPU 加速（CUDA/OpenCL 后端）

- □ 

  国密算法完整实现（SM2/SM3/SM4）

- □ 

  自动更新与崩溃报告

- □ 

  审计日志界面与导出

------

## 十八、版本命名约定

| 文档           | 版本  | 日期       |
| :------------- | :---- | :--------- |
| 架构设计书     | V1.0  | 2026-08-01 |
| 实际对齐修订版 | Rev.2 | 2026-08-01 |

------

## 十九、架构冻结确认（V1.0 Rev.2）

本架构设计书自 **2026‑08‑01** 起以 **V1.0‑final (rev.2)** 正式冻结，所有开发工作必须严格遵循本文档。本次修订基于实际项目代码，确保文档与代码库完全一致。后续任何结构变更需通过架构评审并更新本文档。

**📌 架构冻结生效。这是一份面向长期演进、具备插件生态、统一任务调度与严格安全模型的现代化安全计算平台架构书。**
