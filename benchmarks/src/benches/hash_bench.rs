use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn dummy_bench(c: &mut Criterion) {
    c.bench_function("dummy", |b| {
        b.iter(|| {
            let _ = black_box(42);
        })
    });
}

criterion_group!(benches, dummy_bench);
criterion_main!(benches);