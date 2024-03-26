FROM mcr.microsoft.com/devcontainers/base:jammy

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    libssl-dev \
    pkg-config \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm (required for Anchor CLI)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

RUN wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.0g-2ubuntu4_amd64.deb && dpkg -i libssl1.1_1.1.0g-2ubuntu4_amd64.deb

# Switch to the vscode user provided by the base image
USER vscode

# Install Solana CLI tools for the vscode user
RUN curl -sSfL https://release.solana.com/stable/install | sh

# Install Rust using rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Update Rust to the latest stable version to meet the solana-program requirement
RUN $HOME/.cargo/bin/rustup update && $HOME/.cargo/bin/rustup default stable

# Install Anchor CLI using npm
RUN npm install -g @project-serum/anchor-cli --prefix /home/vscode/.npm-packages


# Install Yarn globally and set the prefix to a specific directory
RUN npm install -g yarn --prefix /home/vscode/.npm-packages

# Add the yarn global bin directory to PATH so that yarn commands can be run
ENV PATH="/home/vscode/.npm-packages/bin:${PATH}"


# Add Cargo and npm bin directories to PATH for the vscode user
ENV PATH="$HOME/.cargo/bin:$HOME/.npm-packages/bin:$PATH"

# Reinforce PATH adjustment (might be redundant depending on your setup)
RUN echo 'export PATH="$HOME/.cargo/bin:$HOME/.npm-packages/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> $HOME/.bashrc

# Switch back to vscode user if we had switched away, this line is redundant as we didn't switch away from vscode user, but kept for clarity
USER vscode

# Set a default command for the container
CMD ["/bin/bash"]
