test:
  npm test
  cargo fmt --all -- --check
  cargo clippy --all
  cargo test --all-features
  sam validate --lint

build:
  CARGO_TARGET_DIR=target sam build --beta-features

deploy:
  sam deploy
