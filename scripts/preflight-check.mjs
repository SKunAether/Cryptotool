import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ---------- 颜色输出 ----------
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

const ok = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const warn = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const err = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);

// ---------- 标准文件清单 ----------
const requiredFiles = [
    'README.md',
    'LICENSE',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    'ROADMAP.md',
    '.gitignore',
    'Cargo.toml',
    'Cargo.lock',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'src-tauri/tauri.conf.json',
    'src-tauri/capabilities/default.json',
];

const optionalFiles = [
    'README.zh-CN.md',
    'CONTRIBUTING.zh-CN.md',
    'CHANGELOG.zh-CN.md',
    'ROADMAP.zh-CN.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    '.editorconfig',
    '.env.example',
];

// ---------- 检查文件是否存在 ----------
function checkFile(filePath) {
    const full = path.join(rootDir, filePath);
    return fs.existsSync(full);
}

// ---------- 检查 .github/workflows/ 目录 ----------
function checkWorkflows() {
    const workflowsDir = path.join(rootDir, '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
        warn('.github/workflows/ 目录不存在');
        return;
    }
    const files = fs.readdirSync(workflowsDir);
    const expected = ['ci.yml'];
    const extra = files.filter(f => !expected.includes(f));
    if (extra.length === 0) {
        ok('.github/workflows/ 只包含 ci.yml，符合预期');
    } else {
        warn(`.github/workflows/ 存在额外文件: ${extra.join(', ')}，请确认是否需要`);
    }
    if (!files.includes('ci.yml')) {
        err('.github/workflows/ 缺少 ci.yml');
    }
}

// ---------- 检查 .gitignore 内容 ----------
function checkGitignore() {
    const gitignorePath = path.join(rootDir, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
        err('.gitignore 不存在');
        return;
    }
    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const requiredPatterns = [
        '/target/',
        'node_modules/',
        'dist/',
        'src-tauri/target/',
        'src-tauri/gen/',
        '*.env',
        '*.key',
        '*.pem',
    ];
    let missing = requiredPatterns.filter(p => !content.includes(p));
    if (missing.length === 0) {
        ok('.gitignore 包含所有必要的忽略模式');
    } else {
        warn(`.gitignore 可能缺少以下模式: ${missing.join(', ')}`);
    }
}

// ---------- 检查 tauri.conf.json 关键字段 ----------
function checkTauriConf() {
    const confPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
    if (!fs.existsSync(confPath)) {
        err('src-tauri/tauri.conf.json 不存在');
        return;
    }
    try {
        const conf = JSON.parse(fs.readFileSync(confPath, 'utf-8'));
        const requiredFields = ['identifier', 'version', 'productName', 'build', 'app', 'bundle'];
        const missing = requiredFields.filter(f => !(f in conf));
        if (missing.length === 0) {
            ok('tauri.conf.json 包含所有必要字段');
        } else {
            warn(`tauri.conf.json 缺少字段: ${missing.join(', ')}`);
        }
        // 检查版本格式
        if (conf.version && !/^\d+\.\d+\.\d+/.test(conf.version)) {
            warn(`版本号格式建议语义化: ${conf.version}`);
        }
        // 检查 targets
        if (conf.bundle && conf.bundle.targets) {
            const targets = conf.bundle.targets;
            if (targets.includes('deb') || targets.includes('msi') || targets.includes('dmg')) {
                ok('bundle.targets 包含至少一个目标平台');
            } else {
                warn('bundle.targets 未包含常见平台 (deb/msi/dmg)');
            }
        }
    } catch (e) {
        err('tauri.conf.json 格式错误: ' + e.message);
    }
}

// ---------- 检查 src/ 和 src-tauri/ 目录 ----------
function checkSourceDirs() {
    const src = path.join(rootDir, 'src');
    const srcTauri = path.join(rootDir, 'src-tauri');
    if (fs.existsSync(src)) {
        ok('src/ 目录存在');
    } else {
        err('src/ 目录缺失');
    }
    if (fs.existsSync(srcTauri)) {
        ok('src-tauri/ 目录存在');
    } else {
        err('src-tauri/ 目录缺失');
    }
}

// ---------- 检查 node_modules 和 target 是否应被忽略 ----------
function checkBuildArtifacts() {
    const nodeModules = path.join(rootDir, 'node_modules');
    const target = path.join(rootDir, 'target');
    if (fs.existsSync(nodeModules)) {
        info('node_modules/ 存在（开发依赖已安装）');
    } else {
        warn('node_modules/ 不存在，请运行 pnpm install');
    }
    if (fs.existsSync(target)) {
        info('target/ 存在（Rust 编译产物）');
    } else {
        info('target/ 不存在（尚未编译）');
    }
}

// ---------- 主函数 ----------
function main() {
    console.log('\n🔍 开始项目发布前终检...\n');

    // 1. 必需文件检查
    console.log('📄 检查必需文件...');
    requiredFiles.forEach(file => {
        if (checkFile(file)) {
            ok(`${file} 存在`);
        } else {
            err(`${file} 缺失`);
        }
    });

    // 2. 可选文件提示
    console.log('\n📄 检查可选文件（缺失不影响构建，但建议补充）...');
    optionalFiles.forEach(file => {
        if (checkFile(file)) {
            ok(`${file} 存在`);
        } else {
            warn(`${file} 缺失（可选）`);
        }
    });

    // 3. workflows
    console.log('\n🔧 检查 GitHub Actions 配置...');
    checkWorkflows();

    // 4. .gitignore
    console.log('\n📝 检查 .gitignore...');
    checkGitignore();

    // 5. tauri.conf.json
    console.log('\n⚙️  检查 Tauri 配置...');
    checkTauriConf();

    // 6. 源码目录
    console.log('\n📂 检查源码目录...');
    checkSourceDirs();

    // 7. 构建产物提示
    console.log('\n📦 检查依赖与构建产物...');
    checkBuildArtifacts();

    // 8. 发布注意事项
    console.log('\n📌 发布前注意事项：');
    console.log('  • 确保 version 在 Cargo.toml 和 tauri.conf.json 中一致');
    console.log('  • 替换所有占位链接（官网、GitHub、更新日志）');
    console.log('  • 确认 app.identifier 唯一');
    console.log('  • 运行 `cargo test --workspace` 确保测试通过');
    console.log('  • 运行 `pnpm test` 确保前端测试通过');
    console.log('  • 运行 `pnpm tauri build` 生成安装包');
    console.log('  • 检查 bundle 产物是否包含所有目标平台');
    console.log('  • 如有签名配置，确保私钥和密码已设置环境变量');
    console.log('  • 创建 GitHub Release 并上传安装包');
    console.log('  • 更新 CHANGELOG.md 和 README.md 中的版本号');

    console.log('\n✅ 终检完成！\n');
}

main();