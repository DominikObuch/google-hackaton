FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONUNBUFFERED=1
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project

COPY pyproject.toml uv.lock README.md ./
COPY app/ /app/app/

RUN uv sync --locked

CMD ["uv", "run", "python", "app/main.py"]
