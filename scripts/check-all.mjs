import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
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
    bold: '\x1b[1m',
};

const ok = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const warn = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const err = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
const title = (msg) => console.log(`\n${colors.bold}${colors.blue}📌 ${msg}${colors.reset}`);

// ---------- 检查工具 ----------
function fileExists(file) {
    return fs.existsSync(path.join(rootDir, file));
}

function readFile(file) {
    try {
        return fs.readFileSync(path.join(rootDir, file), 'utf-8');
    } catch {
        return null;
    }
}

function runCmd(cmd) {
    try {
        return execSync(cmd, { cwd: rootDir, encoding: 'utf-8' }).trim();
    } catch {
        return null;
    }
}

// ---------- 检查 1：系统依赖（Linux） ----------
function checkSystemDeps() {
    title('1. 检查系统依赖 (Linux)');
    if (process.platform !== 'linux') {
        info('当前不是 Linux 系统，跳过此检查');
        return;
    }

    const deps = [
        'libgtk-3-dev',
        'libwebkit2gtk-4.1-dev',
        'libxdo-dev',
        'libglib2.0-dev',
        'pkg-config',
    ];
    const missing = [];
    for (const dep of deps) {
        try {
            execSync(`dpkg -l | grep -q ${dep}`, { stdio: 'ignore' });
            ok(`${dep} 已安装`);
        } catch {
            err(`${dep} 未安装`);
            missing.push(dep);
        }
    }
    if (missing.length > 0) {
        warn(`缺少依赖: ${missing.join(', ')}，请运行:
      sudo apt update && sudo apt install -y ${missing.join(' ')}`);
    }

    // 检查 pkg-config 是否能找到 gio-2.0
    try {
        execSync('pkg-config --modversion gio-2.0', { stdio: 'ignore' });
        ok('pkg-config 能找到 gio-2.0');
    } catch {
        err('pkg-config 找不到 gio-2.0，请检查 PKG_CONFIG_PATH');
        warn('尝试运行: export PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/share/pkgconfig');
    }
}

// ---------- 检查 2：Cargo.toml ----------
function checkCargoToml() {
    title('2. 检查 Cargo.toml');
    const content = readFile('src-tauri/Cargo.toml');
    if (!content) {
        err('src-tauri/Cargo.toml 不存在');
        return;
    }

    // 检查 tauri 版本
    const tauriVersion = content.match(/tauri\s*=\s*\{[^}]*version\s*=\s*"([^"]+)"/);
    if (tauriVersion && tauriVersion[1].startsWith('2')) {
        ok(`tauri 版本 ${tauriVersion[1]} (符合要求)`);
    } else {
        warn('tauri 版本未指定或低于 2，建议使用 version = "2"');
    }

    // 检查是否含有 shell feature（Tauri 2 已移除）
    if (content.includes('"shell"')) {
        warn('Cargo.toml 中包含了 "shell" feature，Tauri 2 已移除，请删除');
    }

    // 检查是否有 tauri-plugin-opener
    if (content.includes('tauri-plugin-opener')) {
        ok('tauri-plugin-opener 依赖存在');
    } else {
        warn('tauri-plugin-opener 未在 Cargo.toml 中列出，建议添加');
    }
}

// ---------- 检查 3：tauri.conf.json ----------
function checkTauriConf() {
    title('3. 检查 tauri.conf.json');
    const content = readFile('src-tauri/tauri.conf.json');
    if (!content) {
        err('src-tauri/tauri.conf.json 不存在');
        return;
    }

    try {
        const conf = JSON.parse(content);
        // 检查 build 命令
        if (conf.build?.beforeDevCommand?.includes('pnpm') || conf.build?.beforeBuildCommand?.includes('pnpm')) {
            ok('tauri.conf.json 使用 pnpm 作为包管理器');
        } else if (conf.build?.beforeDevCommand?.includes('npm') || conf.build?.beforeBuildCommand?.includes('npm')) {
            ok('tauri.conf.json 使用 npm 作为包管理器');
        } else {
            warn('tauri.conf.json 中未明确指定包管理器，请确认');
        }

        // 检查 targets
        if (conf.bundle?.targets?.includes('deb') && conf.bundle?.targets?.includes('msi') && conf.bundle?.targets?.includes('dmg')) {
            ok('bundle.targets 包含 deb, msi, dmg');
        } else {
            warn('bundle.targets 建议包含 ["deb", "msi", "dmg"]');
        }

        // 检查 security.csp
        if (conf.app?.security?.csp === null || conf.app?.security?.csp === undefined) {
            ok('security.csp 设置为 null（允许所有）');
        } else {
            warn('security.csp 建议设置为 null 以避免 CSP 干扰');
        }
    } catch (e) {
        err('tauri.conf.json 格式错误: ' + e.message);
    }
}

// ---------- 检查 4：pnpm-workspace.yaml ----------
function checkWorkspace() {
    title('4. 检查 pnpm workspace 配置');
    if (fileExists('pnpm-workspace.yaml')) {
        err('pnpm-workspace.yaml 存在，CI 会报错，请删除');
        warn('运行: rm pnpm-workspace.yaml');
    } else {
        ok('pnpm-workspace.yaml 不存在（正确）');
    }

    // 检查 package.json 是否有 workspaces 字段
    const pkg = readFile('package.json');
    if (pkg) {
        try {
            const parsed = JSON.parse(pkg);
            if (parsed.workspaces) {
                err('package.json 中包含 workspaces 字段，请删除');
                warn('运行: 手动删除 package.json 中的 "workspaces" 字段');
            } else {
                ok('package.json 无 workspaces 字段（正确）');
            }
        } catch (e) {
            warn('package.json 格式错误: ' + e.message);
        }
    }
}

// ---------- 检查 5：前端依赖与脚本 ----------
function checkFrontend() {
    title('5. 检查前端配置');
    const pkg = readFile('package.json');
    if (!pkg) {
        err('package.json 不存在');
        return;
    }

    try {
        const parsed = JSON.parse(pkg);
        // 检查 dev 和 build 脚本是否存在
        if (parsed.scripts?.dev && parsed.scripts?.build) {
            ok('package.json 中 dev 和 build 脚本存在');
        } else {
            warn('package.json 中缺少 dev 或 build 脚本，请添加');
        }

        // 检查是否有锁文件
        if (fileExists('pnpm-lock.yaml')) {
            ok('pnpm-lock.yaml 存在');
        } else if (fileExists('package-lock.json')) {
            ok('package-lock.json 存在');
        } else {
            warn('未找到锁文件（pnpm-lock.yaml 或 package-lock.json），请运行 pnpm install 或 npm install');
        }
    } catch (e) {
        warn('package.json 格式错误: ' + e.message);
    }
}

// ---------- 检查 6：Git 状态 ----------
function checkGit() {
    title('6. 检查 Git 状态');
    const status = runCmd('git status --porcelain');
    if (status === null) {
        warn('无法获取 Git 状态（可能不是 Git 仓库）');
        return;
    }
    if (status.length === 0) {
        ok('工作区干净，无未提交更改');
    } else {
        warn('有未提交的更改，建议提交后再触发 CI');
        info('未提交文件:\n' + status);
    }

    // 检查 tag 是否存在
    const tags = runCmd('git tag -l v1.0.0');
    if (tags) {
        ok('本地存在 tag v1.0.0');
    } else {
        warn('本地不存在 tag v1.0.0，CI 可能不会触发');
        info('运行: git tag v1.0.0 && git push origin v1.0.0');
    }
}

// ---------- 检查 7：检查 CI 配置文件 ----------
function checkCI() {
    title('7. 检查 CI 配置文件');
    const ciPath = '.github/workflows/release.yml';
    if (fileExists(ciPath)) {
        ok('release.yml 存在');
        const content = readFile(ciPath);
        if (content && content.includes('tauri-apps/tauri-action')) {
            ok('使用了官方的 tauri-action');
        } else {
            warn('未使用 tauri-apps/tauri-action，建议使用官方 action');
        }
    } else {
        err('release.yml 不存在，请创建 CI 配置');
    }
}

// ---------- 主函数 ----------
function main() {
    console.log('\n🔍 开始全面项目检查...\n');
    checkSystemDeps();
    checkCargoToml();
    checkTauriConf();
    checkWorkspace();
    checkFrontend();
    checkGit();
    checkCI();

    console.log('\n✅ 检查完成。\n');
    console.log('📌 修复建议：');
    console.log('  1. 如果缺少系统依赖，运行上面的 apt install 命令');
    console.log('  2. 如果 pnpm-workspace.yaml 存在，删除它');
    console.log('  3. 如果 package.json 有 workspaces 字段，删除');
    console.log('  4. 确保本地能成功构建：pnpm tauri build');
    console.log('  5. 提交所有更改，然后重新打 tag 触发 CI');
}

main();