FROM mcr.microsoft.com/devcontainers/python:3.12

ARG TZ
ENV TZ="${TZ:-America/Los_Angeles}"

# Install Node.js 20 repository
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Install development tools and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
  # Basic tools
  less \
  git \
  gh \
  procps \
  sudo \
  fzf \
  zsh \
  man-db \
  unzip \
  gnupg2 \
  # Network/firewall tools (for autonomous mode)
  iptables \
  ipset \
  iproute2 \
  dnsutils \
  aggregate \
  netcat-openbsd \
  telnet \
  # Development tools
  jq \
  nano \
  vim \
  htop \
  ncdu \
  strace \
  tig \
  # Database tools
  postgresql-client \
  redis-tools \
  # HTTP tools
  curl \
  wget \
  httpie \
  # Node.js
  nodejs \
  # Python development dependencies
  build-essential \
  python3-dev \
  libffi-dev \
  libssl-dev \
  libxml2-dev \
  libxslt1-dev \
  # Chromium for Lighthouse/Puppeteer
  chromium \
  chromium-driver \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Docker CLI (for running docker commands from inside container)
RUN curl -fsSL https://get.docker.com | sh && \
  usermod -aG docker vscode

# Install Rust toolchain and wasm-pack for CLI native WASM builds
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
  . /root/.cargo/env && \
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install uv (fast Python package manager)
RUN pip install --no-cache-dir uv

# Install useful Python development tools globally
RUN pip install --no-cache-dir \
  ipython \
  ipdb \
  pytest-watch \
  pre-commit \
  httpx \
  rich

ARG USERNAME=vscode

# Set up npm/pnpm global directory for vscode user
RUN mkdir -p /usr/local/share/npm-global && \
  chown -R vscode:vscode /usr/local/share/npm-global

# Switch to vscode user for user-specific setup
USER vscode

# Configure npm to use user-writable global directory
ENV NPM_CONFIG_PREFIX=/usr/local/share/npm-global
ENV PATH=$PATH:/usr/local/share/npm-global/bin

# Install pnpm globally
RUN npm install -g npm@latest pnpm@latest

# Install global Node.js tools
RUN npm install -g \
  @anthropic-ai/claude-code \
  turbo \
  typescript \
  ts-node \
  lighthouse \
  @lhci/cli \
  puppeteer

# Set Puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Switch back to root for remaining setup
USER root

# Persist bash history
RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  && mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R $USERNAME /commandhistory

# Set `DEVCONTAINER` environment variable
ENV DEVCONTAINER=true

# Create workspace and config directories
RUN mkdir -p /workspace /home/vscode/.claude /home/vscode/.local/share/pnpm && \
  chown -R vscode:vscode /workspace /home/vscode/.claude /home/vscode/.local/share/pnpm

WORKDIR /workspace

# Set up non-root user
USER vscode

# Shell configuration
ENV SHELL=/bin/zsh
ENV EDITOR=nano
ENV VISUAL=nano
ENV PNPM_HOME=/home/vscode/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

# Default powerline10k theme
ARG ZSH_IN_DOCKER_VERSION=1.2.0
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -p git \
  -p fzf \
  -a "source /usr/share/doc/fzf/examples/key-bindings.zsh" \
  -a "source /usr/share/doc/fzf/examples/completion.zsh" \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" \
  -a "export PNPM_HOME=/home/vscode/.local/share/pnpm" \
  -a "export PATH=\$PNPM_HOME:\$PATH" \
  -x

# Copy and set up firewall script
COPY init-firewall.sh /usr/local/bin/
USER root
RUN chmod +x /usr/local/bin/init-firewall.sh && \
  echo "vscode ALL=(root) NOPASSWD: /usr/local/bin/init-firewall.sh" > /etc/sudoers.d/vscode-firewall && \
  echo "vscode ALL=(root) NOPASSWD: /bin/chmod 666 /var/run/docker.sock" >> /etc/sudoers.d/vscode-firewall && \
  chmod 0440 /etc/sudoers.d/vscode-firewall
USER vscode
