import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// 需要忽略的目录/文件（正则或精确名称）
const ignorePatterns = [
    /^node_modules$/,
    /^target$/,
    /^\.git$/,
    /^dist$/,
    /^dist-ssr$/,
    /^\.idea$/,
    /^\.vscode$/,
    /^coverage$/,
    /^\.DS_Store$/,
    /^Thumbs\.db$/,
    /^\.tmp$/,
    /^\.temp$/,
    /^logs$/,
    /\.log$/,
    /\.sqlite$/,
    /\.db$/,
    /\.db-journal$/,
    /\.pem$/,
    /\.key$/,
    /\.crt$/,
    /\.der$/,
];

function shouldIgnore(name, relativePath) {
    // 忽略根目录下的某些文件（如 .env）
    if (relativePath === '.env' || relativePath === '.env.local') return true;
    return ignorePatterns.some(pattern => pattern.test(name));
}

function walkDir(dir, baseDir = dir) {
    let results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        const relative = path.relative(baseDir, fullPath);
        if (shouldIgnore(item.name, relative)) continue;
        if (item.isDirectory()) {
            results.push(fullPath + '/');
            results = results.concat(walkDir(fullPath, baseDir));
        } else {
            results.push(fullPath);
        }
    }
    return results;
}

// 生成树形文本
function buildTree(files, baseDir) {
    // 转换为相对路径并排序
    const relPaths = files.map(f => path.relative(baseDir, f).replace(/\\/g, '/'));
    relPaths.sort((a, b) => a.localeCompare(b));

    // 构建树结构（简单缩进表示）
    let result = '';
    let prefix = '';
    for (let p of relPaths) {
        const parts = p.split('/');
        let current = '';
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = (i === parts.length - 1);
            const indent = '  '.repeat(i);
            const prefix = (i === 0) ? '' : '├── ';
            if (isLast) {
                // 文件或目录（末尾带/）
                const isDir = fs.existsSync(path.join(baseDir, p)) && fs.statSync(path.join(baseDir, p)).isDirectory();
                const display = part + (isDir ? '/' : '');
                current = indent + prefix + display;
            } else {
                // 目录层级，但只显示一次
                // 由于排序，同一目录会连续出现，我们只在第一次出现时打印目录名
                // 简单起见，用前一个路径判断
                // 这里用另一种方法：只显示每个路径本身，不展开每个层级，上面的循环已经处理
            }
        }
        // 但更简单的方法是直接输出路径名（相对于根）作为树形
    }

    // 采用更简单的树形输出：用 "├── " 和 "│   " 模仿 tree 命令
    // 使用一个更成熟的算法：https://stackoverflow.com/questions/33722756/print-directory-tree-in-javascript
    // 这里我们使用递归构建，但为了简化，直接用 "ls -R" 风格，但用户可能更喜欢树。
    // 我改为生成类似 "tree" 的缩进格式。
    // 下面是一个简单实现，将路径按层级分组：
    const treeMap = {};
    for (let p of relPaths) {
        const parts = p.split('/');
        let current = treeMap;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (!current[part]) current[part] = {};
            current = current[part];
        }
    }

    function renderTree(obj, depth = 0, prefix = '') {
        let lines = [];
        const keys = Object.keys(obj).sort();
        keys.forEach((key, index) => {
            const isLast = (index === keys.length - 1);
            const marker = isLast ? '└── ' : '├── ';
            const indent = '  '.repeat(depth);
            const line = indent + marker + key;
            lines.push(line);
            const childPrefix = indent + (isLast ? '    ' : '│   ');
            const childLines = renderTree(obj[key], depth + 1, childPrefix);
            lines = lines.concat(childLines);
        });
        return lines;
    }

    // 树根是根目录名
    const rootName = path.basename(baseDir);
    const treeLines = [rootName + '/'];
    const children = renderTree(treeMap, 0);
    treeLines.push(...children);
    return treeLines.join('\n');
}

// 主函数
function main() {
    const files = walkDir(rootDir);
    // 生成树形文本
    const tree = buildTree(files, rootDir);
    const outputPath = path.join(rootDir, 'structure.txt');
    fs.writeFileSync(outputPath, tree, 'utf-8');
    console.log(`✅ 目录结构已写入 ${outputPath}`);

    // 更新 .gitignore
    const gitignorePath = path.join(rootDir, '.gitignore');
    const requiredEntries = `
# Rust
/target/
**/*.rs.bk
*.pdb
*.dll
*.so
*.dylib
*.a
*.rlib

# Node / npm / pnpm
node_modules/
dist/
dist-ssr/
*.local
*.log
*.pid
*.seed
*.pid.lock
*.env
*.env.local
*.env.*.local

# Tauri
src-tauri/target/
src-tauri/out/
src-tauri/.tauri/
src-tauri/capabilities/*.json
!src-tauri/capabilities/default.json

# Build outputs
*.o
*.wasm
*.rlib
*.dylib
*.dll

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
*.tmp
*.temp

# Test / coverage
coverage/
*.lcov
*.gcda
*.gcno

# Logs
logs/
*.log

# Local databases
*.sqlite
*.db
*.db-journal

# Sensitive data (optional)
private/
secrets/
*.key
*.pem
*.crt
*.der
`.trim();

    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    }

    // 如果已有内容，追加缺失的条目（简单防重：检查是否已包含特定关键词）
    const existingLines = gitignoreContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const newLines = requiredEntries.split('\n').map(l => l.trim());
    let toAppend = [];
    for (const line of newLines) {
        if (line.startsWith('#')) continue; // 注释不检查
        if (!existingLines.includes(line)) {
            toAppend.push(line);
        }
    }

    if (toAppend.length > 0) {
        // 如果原文件没有以换行结尾，先补一个
        if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
            gitignoreContent += '\n';
        }
        // 添加注释分隔
        gitignoreContent += '\n# Added by structure generator\n';
        gitignoreContent += toAppend.join('\n') + '\n';
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf-8');
        console.log(`✅ .gitignore 已更新，新增 ${toAppend.length} 条规则`);
    } else {
        console.log('✅ .gitignore 已包含所有必要规则，无需更新');
    }
}

main();