FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml README.md ./

# Install dependencies using uv
RUN uv sync --no-install-project

COPY src/ ./src/
COPY test_lab/ ./test_lab/

RUN uv sync

EXPOSE 8000

ENTRYPOINT ["uv", "run"]
CMD ["toolshield", "serve", "--host", "0.0.0.0", "--port", "8000"]
