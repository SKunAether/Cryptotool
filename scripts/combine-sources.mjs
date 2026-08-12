import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 需要排除的目录（精确匹配）
const excludeDirs = new Set([
    'node_modules',
    'target',
    'dist',
    'dist-ssr',
    '.git',
    '.idea',
    '.vscode',
    'coverage',
    'logs',
    'private',
    'secrets',
    'src-tauri/target',
    'src-tauri/out',
    'src-tauri/.tauri',
    'src-tauri/gen',       // Tauri 自动生成的 schema
    'benchmarks/target',   // 如果 benchmark 单独编译
]);

// 排除的文件扩展名（二进制或非源码）
const excludeExtensions = new Set([
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.icns',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.zip', '.tar', '.gz', '.rar', '.7z',
    '.exe', '.dll', '.so', '.dylib', '.a', '.rlib',
    '.pdb', '.o', '.wasm',
    '.sqlite', '.db', '.db-journal',
    '.key', '.pem', '.crt', '.der',
    '.lock', // Cargo.lock, pnpm-lock.yaml 我们单独处理，但yaml会包含
]);

// 需要包含的文本文件扩展名（源码、配置、文档等）
const includeExtensions = new Set([
    '.rs', '.toml', '.json', '.yaml', '.yml',
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
    '.html', '.css', '.scss', '.less',
    '.md', '.txt',
    '.xml', '.svg',  // SVG虽然是文本，但可能很大，我们保留可选项
]);

// 排除的单个文件名（精确）
const excludeFiles = new Set([
    'Cargo.lock',
    'pnpm-lock.yaml',
    'package-lock.json',
    'yarn.lock',
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini',
]);

function shouldIncludeFile(filePath, relativePath) {
    const fileName = path.basename(filePath);
    if (excludeFiles.has(fileName)) return false;

    const ext = path.extname(fileName).toLowerCase();
    // 只处理文本文件
    if (!includeExtensions.has(ext)) return false;

    // 检查路径中的目录是否在排除列表中
    const parts = relativePath.split(path.sep);
    for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts.slice(0, i + 1).join(path.sep);
        if (excludeDirs.has(dir)) return false;
        // 也检查绝对路径匹配（如 src-tauri/target）
        const fullDir = path.join(rootDir, dir);
        if (excludeDirs.has(fullDir)) return false;
    }

    return true;
}

function getAllFiles(dir, baseDir = dir) {
    let results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relative = path.relative(baseDir, fullPath);
        if (item.isDirectory()) {
            // 检查是否排除整个目录
            const dirName = item.name;
            // 相对路径的第一级目录名
            const firstLevel = relative.split(path.sep)[0];
            if (excludeDirs.has(firstLevel)) continue;
            // 也检查绝对路径（比如 src-tauri/target）
            if (excludeDirs.has(fullPath)) continue;
            // 递归
            results = results.concat(getAllFiles(fullPath, baseDir));
        } else {
            if (shouldIncludeFile(fullPath, relative)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}

function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
        return `[读取失败: ${err.message}]`;
    }
}

function main() {
    console.log('🔍 正在扫描源码文件...');
    const files = getAllFiles(rootDir);
    console.log(`📁 找到 ${files.length} 个文本文件`);

    const outputPath = path.join(rootDir, 'combined_source.txt');
    const stream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

    // 写入头部信息
    const header = `# CryptoTool 源码合并文件\n` +
        `# 生成时间: ${new Date().toISOString()}\n` +
        `# 共 ${files.length} 个文件\n` +
        `# =========================================\n\n`;
    stream.write(header);

    for (const file of files) {
        const relative = path.relative(rootDir, file);
        const content = readFileContent(file);
        stream.write(`\n\n===== ${relative} =====\n`);
        stream.write(content);
        // 确保内容后换行
        if (!content.endsWith('\n')) {
            stream.write('\n');
        }
        stream.write(`\n===== END ${relative} =====\n`);
    }

    stream.end();
    console.log(`✅ 合并完成！输出文件: ${outputPath}`);
    console.log(`📄 总文件数: ${files.length}`);
}

main();