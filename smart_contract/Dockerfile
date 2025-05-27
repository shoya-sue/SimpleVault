# Anchor + Solana CLI + Rust 用 Dockerfile
FROM node:18-bullseye as builder

# Anchor, Solana, Rust のインストール
RUN apt-get update && \
    apt-get install -y pkg-config build-essential libssl-dev curl git && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    cargo install --git https://github.com/coral-xyz/anchor avm --locked && \
    avm install latest && avm use latest && \
    npm install -g @project-serum/anchor-cli && \
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.11/install)" && \
    apt-get clean

ENV PATH="/root/.cargo/bin:/root/.avm/bin:/root/.local/share/solana/install/active_release/bin:$PATH"

WORKDIR /workdir

CMD ["bash"]
