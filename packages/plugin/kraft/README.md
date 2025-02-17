This plugin provides executors for interacting with KraftCloud. It allows you to deploy, manage instances, and create tunnels for your KraftCloud applications. The plugin also includes an init generator to set up your workspace for KraftCloud development.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-kraft?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-kraft)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-kraft)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-kraft)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-kraft)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
- [Executors](#executors)
  - [cloud-deploy](#cloud-deploy)
  - [cloud-instance-remove](#cloud-instance-remove)
  - [cloud-instance-create](#cloud-instance-create)
  - [cloud-instance-start](#cloud-instance-start)
  - [cloud-instance-stop](#cloud-instance-stop)
  - [cloud-instance-get](#cloud-instance-get)
  - [cloud-instance-logs](#cloud-instance-logs)
  - [cloud-img-remove](#cloud-img-remove)
  - [cloud-tunnel](#cloud-tunnel)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-kraft
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-kraft:init
```
# Generators

## init
> init generator

```bash
nx g @rxap/plugin-kraft:init
```
# Executors

## cloud-deploy
> Run the kraft cloud deploy sub command with the specified arguments


Option | Type | Default | Description
--- | --- | --- | ---
as | string |  | Set the deployment type
build-arg | array |  | Supply build arguments when building a Dockerfile
build-log | string |  | Use the specified file to save the output from the build
build-secret | array |  | Supply secrets when building Dockerfile
build-target | string |  | Supply multi-stage target when building Dockerfile
certificate | array |  | Set the certificates to use for the service
compress | boolean |  | Compress the initrd package (experimental)
config | string |  | Override the path to the KConfig .config file
dbg | boolean |  | Build the debuggable (symbolic) kernel image instead of the stripped image
domain | array |  | Set the domain names for the service
entrypoint | array |  | Set the entrypoint for the instance
env | array |  | Environmental variables
feature | array |  | Specify the special features to enable
follow | boolean |  | Follow the logs of the instance
force-pull | boolean |  | Force pulling packages before building
help | boolean |  | Show help for deploy
image | string |  | Set the image name to use
jobs | number |  | Allow N jobs at once
kraftfile | string |  | Set the Kraftfile to use
memory | string |  | Specify the amount of memory to allocate (MiB increments)
name | string |  | Name of the deployment
no-cache | boolean |  | Force a rebuild even if existing intermediate artifacts already exist
no-configure | boolean |  | Do not run Unikraft&#x27;s configure step before building
no-fast | boolean |  | Do not use maximum parallelization when performing the build
no-fetch | boolean |  | Do not run Unikraft&#x27;s fetch step before building
no-start | boolean |  | Do not start the instance after creation
no-update | boolean |  | Do not update package index before running the build
output | string |  | Set output format
port | array |  | Specify the port mapping between external to internal
replicas | number |  | Number of replicas of the instance
restart | string |  | Set the restart policy for the instance (never/always/on-failure)
rollout | string |  | Set the rollout strategy for an instance which has been previously run in the provided service
rollout-qualifier | string |  | Set the rollout qualifier used to determine which instances should be affected by the strategy in the supplied service
rollout-wait | string |  | Time to wait before performing rolling out action
rootfs | string |  | Specify a path to use as root filesystem
runtime | string |  | Set an alternative project runtime
scale-to-zero | string |  | Scale to zero policy of the instance (on/off/idle)
scale-to-zero-cooldown | string |  | Cooldown period before scaling to zero
scale-to-zero-stateful | boolean |  | Save state when scaling to zero
service | string |  | Attach the new deployment to an existing service
strategy | string |  | When a package of the same name exists, use this strategy when applying targets
subdomain | array |  | Set the names to use when provisioning subdomains
timeout | string |  | Set the timeout for remote procedure calls
vcpus | number |  | Specify the number of vCPUs to allocate
volume | array |  | Specify the volume mapping(s) in the form NAME:DEST or NAME:DEST:OPTIONS
workdir | string |  | Set an alternative working directory
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Set the text editor to open when prompt to edit a file
events-pid-file | string |  | Events process ID used when running multiple unikernels
git-protocol | string |  | Preferred Git protocol to use
http-unix-sock | string |  | When making HTTP(S) connections, pipe requests via this shared socket
log-level | string |  | Log level verbosity
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Do not check for updates
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Do not use emojis in any console output
no-parallel | boolean |  | Do not run internal tasks in parallel
no-prompt | boolean |  | Do not prompt for user interaction
no-warn-sudo | boolean |  | Do not warn on running via sudo
pager | string |  | System pager to pipe output to
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for placing runtime files
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

## cloud-instance-remove
> Remove instances


Option | Type | Default | Description
--- | --- | --- | ---
all | boolean |  | Remove all instances
help | boolean |  | Help for remove
stopped | boolean |  | Remove all stopped instances
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Set the text editor to open when prompt to edit a file
events-pid-file | string |  | Events process ID used when running multiple unikernels
git-protocol | string |  | Preferred Git protocol to use (default &quot;https&quot;)
http-unix-sock | string |  | When making HTTP(S) connections, pipe requests via this shared socket
log-level | string |  | Log level verbosity. Choice of: [panic, fatal, error, warn, info, debug, trace] (default &quot;info&quot;)
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type. Choice of: [fancy, basic, json] (default &quot;fancy&quot;)
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Do not check for updates
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Do not use emojis in any console output
no-parallel | boolean |  | Do not run internal tasks in parallel
no-prompt | boolean |  | Do not prompt for user interaction
no-warn-sudo | boolean |  | Do not warn on running via sudo
pager | string |  | System pager to pipe output to (default &quot;cat&quot;)
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for placing runtime files (e.g., pidfiles)
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests (default [https://manifests.kraftkit.sh/index.yaml])
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

## cloud-instance-create
> Create an instance


Option | Type | Default | Description
--- | --- | --- | ---
certificate | array |  | Set the certificates to use for the service
domain | array |  | The domain names to use for the service
entrypoint | array |  | Set the entrypoint for the instance
env | array |  | Environmental variables
feature | array |  | List of features to enable
memory | string |  | Specify the amount of memory to allocate (MiB increments)
name | string |  | Specify the name of the instance
output | string |  | Set output format. Options: table, yaml, json, list
port | array |  | Specify the port mapping between external to internal
replicas | number |  | Number of replicas of the instance
restart | string |  | Set the restart policy for the instance (default &#x27;never&#x27;)
rollout | string |  | Set the rollout strategy for an instance
rollout-qualifier | string |  | Set the rollout qualifier used for t...
rollout-wait | string |  | Time to wait before performing rollout action (default &#x27;10s&#x27;)
scale-to-zero | string |  | Scale to zero policy of the instance (default &#x27;off&#x27;)
scale-to-zero-cooldown | string |  | Cooldown period before scaling to zero
scale-to-zero-stateful | boolean |  | Save state when scaling to zero
service | string |  | Attach this instance to an existing service
start | boolean |  | Immediately start the instance after creation
subdomain | array |  | Set the subdomains to use when creating the service
vcpus | number |  | Specify the number of vCPUs to allocate
volume | array |  | List of volumes to attach instance to
wait-for-image | boolean |  | Wait for the image to be available before creating the instance
wait-for-image-timeout | string |  | Time to wait before timing out when waiting for image (default &#x27;1m0s&#x27;)
buildkit-host | string |  | Path to the buildkit host

## cloud-instance-start
> Start instances


Option | Type | Default | Description
--- | --- | --- | ---
all | boolean |  | Start all instances
help | boolean |  | Help for start
wait | string |  | Timeout to wait for the instance to start (ms/s/m/h)
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Set the text editor to open when prompted to edit a file
events-pid-file | string |  | Events process ID used when running multiple unikernels
git-protocol | string |  | Preferred Git protocol to use (default &#x27;https&#x27;)
http-unix-sock | string |  | When making HTTP(S) connections, pipe requests via this shared socket
log-level | string |  | Log level verbosity. Choice of: [panic, fatal, error, warn, info, debug, trace] (default &#x27;info&#x27;)
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type. Choice of: [fancy, basic, json] (default &#x27;fancy&#x27;)
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Do not check for updates
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Do not use emojis in any console output
no-parallel | boolean |  | Do not run internal tasks in parallel
no-prompt | boolean |  | Do not prompt for user interaction
no-warn-sudo | boolean |  | Do not warn on running via sudo
pager | string |  | System pager to pipe output to (default &#x27;cat&#x27;)
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for placing runtime files (e.g. pidfiles)
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests (default [https://manifests.kraftkit.sh/index.yaml])
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

## cloud-instance-stop
> Stop instances


Option | Type | Default | Description
--- | --- | --- | ---
all | boolean |  | Stop all instances
drain-timeout | string |  | Timeout for the instance to stop (ms/s/m/h)
force | boolean |  | Force stop the instance(s)
wait | string |  | Time to wait for the instance to drain all connections before stopping (ms/s/m/h)
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit configuration directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Text editor for editing files
events-pid-file | string |  | File storing events process ID for multiple unikernels
git-protocol | string |  | Preferred Git protocol (default &#x27;https&#x27;)
http-unix-sock | string |  | Shared socket for HTTP(S) connections
log-level | string |  | Log level verbosity (default &#x27;info&#x27;)
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type (default &#x27;fancy&#x27;)
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Disable update checks
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Disable emojis in output
no-parallel | boolean |  | Disable parallel internal tasks
no-prompt | boolean |  | Disable user prompts
no-warn-sudo | boolean |  | Disable warnings when running as sudo
pager | string |  | System pager for output (default &#x27;cat&#x27;)
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for runtime files
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests
with-mirror | array |  | Mirrors of Unikraft component artifacts

## cloud-instance-get
> Retrieve the state of instances


Option | Type | Default | Description
--- | --- | --- | ---
output | string |  | Set output format (options: table, yaml, json, list)
buildkit-host | string |  | Path to the BuildKit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Text editor to open when prompted to edit a file
events-pid-file | string |  | Events process ID for multiple unikernels
git-protocol | string |  | Preferred Git protocol
http-unix-sock | string |  | Shared socket for HTTP(S) requests
log-level | string |  | Log level verbosity
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Do not check for updates
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Do not use emojis in console output
no-parallel | boolean |  | Do not run internal tasks in parallel
no-prompt | boolean |  | Do not prompt for user interaction
no-warn-sudo | boolean |  | Do not warn when running via sudo
pager | string |  | System pager to pipe output to
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for runtime files placement
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

## cloud-instance-logs
> Get console output of instances


Option | Type | Default | Description
--- | --- | --- | ---
follow | boolean |  | Follow the logs of the instance every half second.
no-prefix | boolean |  | Do not prefix each log line with the name when logging multiple machines.
prefix | string |  | Prefix the logs with a given string.
tail | integer |  | Show the last given lines from the logs (default -1).
buildkit-host | string |  | Path to the buildkit host.
config-dir | string |  | Path to KraftKit config directory.
containerd-addr | string |  | Address of containerd daemon socket.
editor | string |  | Text editor to open when prompted to edit a file.
events-pid-file | string |  | Events process ID used when running multiple unikernels.
git-protocol | string |  | Preferred Git protocol to use (default &#x27;https&#x27;).
http-unix-sock | string |  | Shared socket for HTTP(S) connections.
log-level | string |  | Log level verbosity (default &#x27;info&#x27;).
log-timestamps | boolean |  | Enable log timestamps.
log-type | string |  | Log type (default &#x27;fancy&#x27;).
manifests-dir | string |  | Path to Unikraft manifest cache.
metro | string |  | Unikraft Cloud metro location.
no-check-updates | boolean |  | Do not check for updates.
no-color | boolean |  | Disable color output.
no-emojis | boolean |  | Do not use emojis in console output.
no-parallel | boolean |  | Do not run internal tasks in parallel.
no-prompt | boolean |  | Do not prompt for user interaction.
no-warn-sudo | boolean |  | Do not warn when running via sudo.
pager | string |  | System pager to pipe output to (default &#x27;cat&#x27;).
plugins-dir | string |  | Path to KraftKit plugin directory.
qemu | string |  | Path to QEMU executable.
runtime-dir | string |  | Directory for placing runtime files (e.g., pidfiles).
sources-dir | string |  | Path to Unikraft component cache.
token | string |  | Unikraft Cloud access token.
with-manifest | array |  | Paths to package or component manifests (default &#x27;[https://manifests.kraftkit.sh/index.yaml]&#x27;).
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts.

## cloud-img-remove
> Remove an image


Option | Type | Default | Description
--- | --- | --- | ---
all | boolean |  | Remove all images
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Set the text editor for file editing prompts
events-pid-file | string |  | PID for events process used with multiple unikernels
git-protocol | string |  | Preferred Git protocol (default &#x27;https&#x27;)
http-unix-sock | string |  | Shared socket for HTTP(S) connections
log-level | string |  | Log level verbosity (default &#x27;info&#x27;)
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type (default &#x27;fancy&#x27;)
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Disable update checks
no-color | boolean |  | Disable colored output
no-emojis | boolean |  | Disable emojis in console output
no-parallel | boolean |  | Run tasks serially instead of in parallel
no-prompt | boolean |  | Disable user interaction prompts
no-warn-sudo | boolean |  | Suppress warnings when running with sudo
pager | string |  | System pager to pipe output to (default &#x27;cat&#x27;)
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for placing runtime files
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package/component manifests
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

## cloud-tunnel
> Forward a local port to an unexposed instance


Option | Type | Default | Description
--- | --- | --- | ---
localPort | string |  | The local port
destPort | string |  | The dest port
urlPath | string |  | The url path added to the link preview
tunnel-control-port | integer |  | Command-and-control port used by the tunneling service.
tunnel-image | string |  | Tunnel service image
tunnel-proxy-port | array |  | Remote port exposed by the tunnelling service.
buildkit-host | string |  | Path to the buildkit host
config-dir | string |  | Path to KraftKit config directory
containerd-addr | string |  | Address of containerd daemon socket
editor | string |  | Set the text editor for editing files
events-pid-file | string |  | Events process ID for running multiple unikernels
git-protocol | string |  | Preferred Git protocol to use
http-unix-sock | string |  | Shared socket for HTTP(S) connections
log-level | string |  | Log level verbosity
log-timestamps | boolean |  | Enable log timestamps
log-type | string |  | Log type format
manifests-dir | string |  | Path to Unikraft manifest cache
metro | string |  | Unikraft Cloud metro location
no-check-updates | boolean |  | Disable update checks
no-color | boolean |  | Disable color output
no-emojis | boolean |  | Disable emojis in console output
no-parallel | boolean |  | Disable parallel task execution
no-prompt | boolean |  | Disable user interaction prompts
no-warn-sudo | boolean |  | Suppress sudo warnings
pager | string |  | System pager to use for output
plugins-dir | string |  | Path to KraftKit plugin directory
qemu | string |  | Path to QEMU executable
runtime-dir | string |  | Directory for runtime files
sources-dir | string |  | Path to Unikraft component cache
token | string |  | Unikraft Cloud access token
with-manifest | array |  | Paths to package or component manifests
with-mirror | array |  | Paths to mirrors of Unikraft component artifacts

