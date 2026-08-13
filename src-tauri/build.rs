fn main() {
    // 硬编码Ubuntu22.04 pkgconfig目录，无视外部环境变量
    std::env::set_var(
        "PKG_CONFIG_PATH",
        "/usr/lib/x86_64-linux-gnu:/usr/share/pkgconfig",
    );
    std::env::set_var("PKG_CONFIG_LIBDIR", "/usr/lib/x86_64-linux-gnu/pkgconfig");
    tauri_build::build()
}
