FROM python:3-alpine

LABEL maintainer='<chiangkai>'
LABEL version='2025.10.17-dev.0-build.0'

ADD . /code
WORKDIR /code
RUN \
  apk add --no-cache libc-dev libffi-dev gcc && \
  pip install -r requirements.txt --no-cache-dir && \
  apk del gcc libc-dev libffi-dev && \
  addgroup webssh && \
  adduser -Ss /bin/false -g webssh webssh && \
  chown -R webssh:webssh /code

USER webssh
