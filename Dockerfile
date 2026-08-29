FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock* ./
COPY README.md ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project || uv sync --no-install-project

COPY src/ ./src/
COPY policies/ ./policies/
COPY test_lab/ ./test_lab/

RUN uv sync

ENTRYPOINT ["uv", "run", "toolshield"]
CMD ["--help"]
