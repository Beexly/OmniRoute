- Routed the `docker-publish` amd64 build leg to the self-hosted `omni-build` pool
  (31 GB) behind the existing `USE_VPS_RUNNER` repo variable — the hosted
  `ubuntu-24.04` runner's 7 GB no longer fits the release tree and was OOMing on
  every `release/v3.8.51` push, including the version-tag build that publishes the
  release image. The arm64 leg stays on the hosted `ubuntu-24.04-arm` runner.
