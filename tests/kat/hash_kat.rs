use cryptotool_lib::HashService;

#[test]
fn test_md5_kat() {
    let vectors = vec![
        ("", "d41d8cd98f00b204e9800998ecf8427e"),
        ("abc", "900150983cd24fb0d6963f7d28e17f72"),
        ("message digest", "f96b697d7cb7938d525a2f31aaf161d0"),
    ];
    for (input, expected) in vectors {
        let result = HashService::hash_text("md5", input).unwrap();
        assert_eq!(result, expected, "MD5 failed for input: '{}'", input);
    }
}

#[test]
fn test_sha256_kat() {
    let vectors = vec![
        ("", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
        ("abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"),
    ];
    for (input, expected) in vectors {
        let result = HashService::hash_text("sha256", input).unwrap();
        assert_eq!(result, expected, "SHA256 failed for input: '{}'", input);
    }
}

#[test]
fn test_sha512_kat() {
    let vectors = vec![
        ("", "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"),
        ("abc", "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"),
    ];
    for (input, expected) in vectors {
        let result = HashService::hash_text("sha512", input).unwrap();
        assert_eq!(result, expected, "SHA512 failed for input: '{}'", input);
    }
}