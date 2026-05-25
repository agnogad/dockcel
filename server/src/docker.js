import Docker from "dockerode";

const socketPath =
  process.env.DOCKER_SOCKET || "/var/run/docker.sock";

let docker;

export function getDocker() {
  if (!docker) {
    docker = new Docker({ socketPath });
  }
  return docker;
}
