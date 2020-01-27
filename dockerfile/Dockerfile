ARG BASE_PRIVATE_REGISTRY=""
FROM ${BASE_PRIVATE_REGISTRY}hkube/base-node:v1.1.1
LABEL maintainer="yehiyam@gmail.com"
RUN mkdir /hkube
COPY . /hkube/storage-migrator
RUN cd /hkube/storage-migrator
WORKDIR /hkube/storage-migrator
CMD ["node", "app.js"]
