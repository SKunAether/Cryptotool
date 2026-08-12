bash -c '
echo "========== 1. 系统信息 =========="
uname -a
lsb_release -a 2>/dev/null || cat /etc/os-release
echo
echo "========== 2. Rust 工具链 =========="
rustc --version
cargo --version
rustup default 2>/dev/null
echo
echo "========== 3. Node.js / pnpm / npm =========="
node --version
pnpm --version 2>/dev/null || npm --version
echo
echo "========== 4. Tauri CLI =========="
cargo tauri --version 2>/dev/null || echo "tauri-cli not installed (run: cargo install tauri-cli)"
echo
echo "========== 5. 系统依赖库（关键） =========="
dpkg -l 2>/dev/null | grep -E "libwebkit2gtk|libssl|libgtk-3|libappindicator|libxdo" || rpm -qa 2>/dev/null | grep -E "webkit2gtk|openssl|gtk3"
echo "   (如果上面没有输出，可能需要安装: sudo apt install libwebkit2gtk-4.1-dev libssl-dev libgtk-3-dev libappindicator3-dev)"
echo
echo "========== 6. 项目目录结构 =========="
ls -la src-tauri/ 2>/dev/null | head -15
ls -la src/ 2>/dev/null | head -10
echo
echo "========== 7. 构建尝试（只编译，不打包） =========="
cd src-tauri && cargo build --verbose 2>&1 | head -80 && cd ..
echo
echo "========== 8. 前端依赖安装状态 =========="
if [ -d "node_modules" ]; then echo "node_modules 存在"; else echo "node_modules 不存在，请执行 pnpm install 或 npm install"; fi
echo
echo "========== 9. 环境变量 =========="
echo "RUST_BACKTRACE=$RUST_BACKTRACE"
echo "RUST_LOG=$RUST_LOG"
echo
echo "========== 10. 近期修改的文件 =========="
git status --short 2>/dev/null || echo "不是 git 仓库或未安装 git"
' > check-report.txt 2>&1