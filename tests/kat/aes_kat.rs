use cryptotool_lib::CryptoService;

#[test]
fn test_aes_gcm_encrypt_decrypt() {
    let key = CryptoService::generate_key();
    let plaintext = "Hello, world!";
    let ciphertext = CryptoService::encrypt(&key, plaintext).unwrap();
    let decrypted = CryptoService::decrypt(&key, &ciphertext).unwrap();
    assert_eq!(decrypted, plaintext, "AES-GCM roundtrip failed");
}