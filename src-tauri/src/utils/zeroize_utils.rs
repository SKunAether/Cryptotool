use zeroize::Zeroize;

/// 安全地清零字节数组（定长数组版本）
pub fn zeroize_array<const N: usize>(arr: &mut [u8; N]) {
    arr.zeroize();
}
