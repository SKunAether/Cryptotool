import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 检查 CI 配置...');

// 检查 pnpm-workspace.yaml
const workspacePath = path.join(rootDir, 'pnpm-workspace.yaml');
if (fs.existsSync(workspacePath)) {
    console.warn('⚠️  pnpm-workspace.yaml 存在，应删除');
} else {
    console.log('✅ pnpm-workspace.yaml 不存在');
}

// 检查 package.json 中的 workspaces
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.workspaces) {
        console.warn('⚠️  package.json 包含 workspaces 字段，应删除');
    } else {
        console.log('✅ package.json 无 workspaces 字段');
    }
} else {
    console.error('❌ package.json 不存在');
}

// 检查 lock 文件
const lockFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
const exists = lockFiles.map(f => fs.existsSync(path.join(rootDir, f)) ? f : null).filter(Boolean);
if (exists.length === 0) {
    console.warn('⚠️  未找到任何 lock 文件');
} else {
    console.log(`✅ 找到 lock 文件: ${exists.join(', ')}`);
}

// 检查 release.yml 是否包含 pnpm
const workflowPath = path.join(rootDir, '.github', 'workflows', 'release.yml');
if (fs.existsSync(workflowPath)) {
    const content = fs.readFileSync(workflowPath, 'utf-8');
    if (content.includes('pnpm')) {
        console.warn('⚠️  release.yml 中仍包含 pnpm 相关命令，建议移除');
    } else {
        console.log('✅ release.yml 未引用 pnpm');
    }
} else {
    console.warn('⚠️  release.yml 不存在');
}

console.log('✅ 检查完成');