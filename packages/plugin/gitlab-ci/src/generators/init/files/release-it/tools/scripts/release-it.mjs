import release from 'release-it';
import { readFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

/**
 * sorted from most stable to least stable
 */
const CHANNELS = [
  ['rc', 'release-candidate'],
  ['preview'],
  ['nightly'],
];

/**
 * Executes a git command with the provided arguments.
 *
 * @param {Array<string>} args - The arguments for the git command.
 * @return {Promise<string>} - A promise that resolves with the output of the git command.
 *                            The output is a string after trimming any leading or trailing whitespace.
 * @throws {Error} - If an error occurs during execution of the git command.
 */
export function git(args) {
  console.log(`$ git ${ args.join(' ') }`);
  return new Promise((resolve, reject) => {
    const s = spawn(
      'git',
      args,
      {
        stdio: [ 'ignore', 'pipe', 'inherit' ],
        shell: true,
      },
    );
    let dataBuffer = '';
    s.on('error', (err) => {
      if (err.code === 'ENOENT') {
        console.error('git must be installed to use the CLI.');
      } else {
        reject(err);
      }
    });
    s.stdout.on('data', (data) => {
      dataBuffer += data.toString('utf-8').trim();
    });
    s.stdout.on('end', () => {
      resolve(dataBuffer.trim());
    });
  });
}

export function releaseCli(args) {
  console.log(`$ release-cli ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const s        = spawn(
      'release-cli',
      args,
      {
        stdio: ['ignore', 'pipe', 'inherit'],
        shell: true
      }
    );
    let dataBuffer = '';
    s.on('error', (err) => {
      if (err.code === 'ENOENT') {
        console.error('release-cli must be installed to use the CLI.');
      } else {
        reject(err);
      }
    });
    s.stdout.on('data', (data) => {
      dataBuffer += data.toString('utf-8').trim();
    });
    s.stdout.on('end', () => {
      resolve(dataBuffer.trim());
    });
  });
}

export function createGitlabRelease(tagName, name, changelog) {

  const args = [];

  if (process.env.CI_SERVER_URL) {
    args.push(`--server-url ${process.env.CI_SERVER_URL}`)
  }

  if (process.env.CI_JOB_TOKEN) {
    args.push(`--job-token=${process.env.CI_JOB_TOKEN}`)
  }

  if (process.env.CI_PROJECT_ID) {
    args.push(`--project-id=${process.env.CI_PROJECT_ID}`)
  }

  args.push('create');

  args.push(`--tag-name=${tagName}`);
  args.push(`--name=${name}`);
  args.push(`--description="${changelog}"`);

  return releaseCli(args);

}

/**
 * Retrieves the latest git tag that matches the pattern v*.
 *
 * @returns {Promise<string>} The latest git tag.
 */
async function getLatestTag() {
  const data = await git(['tag', '--sort=-taggerdate', '-l', '"v*"']);
  if (!data) {
    throw new Error('no tags found');
  }
  console.log('all tags:')
  console.log(data)
  const [ latest ] = data.split('\n').map(tag => tag.trim());
  return latest;
}

/**
 * Extracts the channel from the provided tag.
 *
 * @param {string} tag - The tag from which to extract the channel.
 * @return {string|null} The extracted channel or null if channel cannot be found.
 */
function extractChannel(tag) {
  if (!tag) {
    throw new Error('unable to extract channel from empty tag');
  }
  const match = tag.match(/.+-(\w+)\./);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Retrieves the next channel based on the provided channel.
 * If the channel is the first channel, it returns null, as there is no next channel.
 * If the channel is not the last channel, it returns the preview channel.
 * If the channel is not found, it defaults to the preview channel.
 *
 * @param {string} channel - The channel to find the next channel for.
 * @returns {string|null} - The next channel, or null if there is no next channel.
 */
function getNextChannel(channel) {
  if (!channel) {
    throw new Error('unable to get next channel from empty channel');
  }
  const index = CHANNELS.findIndex(c => c.includes(channel));

  if (index === -1) {
    console.log('channel not found, defaulting to last channel in hierarchy');
    return CHANNELS[CHANNELS.length - 1][0];
  }

  if (index === 0) {
    console.log('Current channel is the first channel, the next channel is release');
    return null;
  }

  return CHANNELS[index - 1][0];
}

function getPreviousChannel(channel) {
  if (!channel) {
    throw new Error('unable to get previous channel from empty channel');
  }

  const index = CHANNELS.findIndex(c => c.includes(channel));

  if (index === -1) {
    console.log('channel not found, defaulting to last channel in hierarchy');
    return CHANNELS[CHANNELS.length - 1][0];
  }

  if (index === CHANNELS.length - 1) {
    console.log('Current channel is the last channel, use this chanel as previous channel');
    return CHANNELS[CHANNELS.length - 1][0];
  }

  return CHANNELS[index + 1][0];

}

function getCurrentBranch() {
  return git(['branch', '--show-current']).then(data => data.trim());
}

async function getCurrentRemote() {
  const currentBranch = await getCurrentBranch();
  return git(['config', '--get', `branch.${currentBranch}.remote`]).then(data => data.trim());
}

async function fetchAllTags() {
  const remote = await getCurrentRemote();
  if (!remote) {
    throw new Error('unable to determine remote');
  }
  await git(['fetch', '--tags', '--prune', remote]).then(() => console.log('tags fetched'));
}

async function gitFetch() {
  const remote = await getCurrentRemote();
  if (!remote) {
    throw new Error('unable to determine remote');
  }
  await git(['fetch', remote]).then(() => console.log('fetched'));
}

async function hasChangesSinceLastTag() {

  const lastTag = await getLatestTag();

  const commitCount = Number(await git([ 'rev-list', '--count', `${lastTag}..HEAD` ]));

  if (isNaN(commitCount)) {
    throw new Error('unable to determine commit count');
  }

  return commitCount > 0;
}

async function buildOptions() {

  const options = JSON.parse(readFileSync('./.release-it.json', 'utf8'));

  options.plugins ??= {};
  options.plugins[join(process.cwd(), './tools/scripts/rxap-release-it-plugin.mjs')] = {
    preReleaseHierarchy: CHANNELS.map(c => c[0]),
  };
  options.preReleaseHierarchy = CHANNELS.map(c => c[0]);

  options.git ??= {};

  if (!process.env.CI || process.env.CI === 'false') {
    options['dry-run'] = true;
    options.git.requireCleanWorkingDir = false;
  } else if (process.env.RELEASE_IT !== 'true'){
    console.log('RELEASE_IT is not set to true')
    process.exit(1);
  }

  options.ci = true;
  options.debug = true;

  switch (process.env.RELEASE_IT_CHANNEL) {
    case 'release':
      console.log('release channel');
      options.preRelease = null;
      break;
    case 'auto':
      console.log('automatic channel detection');
      const latestTag = await getLatestTag();
      console.log('latest tag:', latestTag);
      let channel = extractChannel(latestTag);
      if (!channel) {
        channel = CHANNELS[CHANNELS.length - 1][0];
        console.log(`no channel found, default to ${channel} channel`);
      } else {
        console.log('channel:', channel);
        if (process.env.RELEASE_IT_PROMOTE === 'true') {
          console.log('promoting')
          channel = getNextChannel(channel);
          console.log(`promoting to '${channel}'`)
        } else if (process.env.RELEASE_IT_DEMOTE === 'true') {
          console.log('demoting')
          channel = getPreviousChannel(channel);
          console.log(`demoting to '${channel}'`)
        } else if (!channel) {
          // if the latest tag has no channel, default to preview
          console.log('no channel found, defaulting to preview');
          channel = 'preview';
        }
      }
      console.log(`setting pre-release to '${channel}'`);
      options.preRelease = channel;
      break;
    default:
      if (!process.env.RELEASE_IT_CHANNEL) {
        console.log('no channel found');
        const latestTag = await getLatestTag();
        console.log('latest tag:', latestTag);
        const currentChannel = extractChannel(latestTag);
        console.log('current channel:', currentChannel);
        process.env.RELEASE_IT_CHANNEL = currentChannel;
      }
      for (const channel of CHANNELS) {
        if (channel.includes(process.env.RELEASE_IT_CHANNEL)) {
          console.log(`setting pre-release to '${channel[0]}'`);
          options.preRelease = channel[0];
          break;
        }
      }
      console.log('non standard channel:', process.env.RELEASE_IT_CHANNEL);
      options.preRelease = process.env.RELEASE_IT_CHANNEL;
      break;

  }

  if (options.preRelease) {
    console.log('pre-release found');
  } else {
    console.log('no pre-release found, defaulting to release');
  }

  return options;

}

async function checkPrerequisites() {
  const gitVersion = await git(['--version']);
  console.log('git version:', gitVersion)
  const releaseCliVersion = await releaseCli(['--version'])
  if (!releaseCliVersion.match(/release-cli version/)) {
    console.error('release-cli version valid found:', releaseCliVersion);
    process.exit(1);
  }
  console.log('release-cli version:', releaseCliVersion)
}

function buildTagName(version, options) {
  if (options.git?.tagName) {
    return options.git.tagName.replace('${version}', version);
  }
  return version;
}

function buildGitlabReleaseName(version, options) {
  if (options.gitlab?.releaseName) {
    return options.gitlab.releaseName.replace('${version}', version);
  }
  return version;
}

async function checkIfHeadIsLatestCommitOfTheRemote() {
  const currentRemote = await getCurrentRemote();
  const currentBranch = await getCurrentBranch();
  const commitCount = Number(await git([ 'rev-list', '--count', `HEAD..${currentRemote}/${currentBranch}` ]));

  return commitCount === 0;
}

async function main() {

  await checkPrerequisites();

  console.log('fetching remote');
  await gitFetch();

  console.log('fetching tags');
  await fetchAllTags();

  const isHeadLatestCommit = await checkIfHeadIsLatestCommitOfTheRemote();

  if (!isHeadLatestCommit) {
    console.error('HEAD is not the latest commit of the remote');
    process.exit(1);
  }

  if (!(await hasChangesSinceLastTag())) {
    if (process.env.RELEASE_IT_FORCE !== 'true') {
      console.log('no changes since last tag, skipping release');
      process.exit(0);
    }
  }

  console.log('building options')
  const options = await buildOptions();

  console.log('options', JSON.stringify(options, undefined, 2));

  const { version, changelog } = await release(options).then(output => {
    // { version, latestVersion, name, changelog }
    console.log(`release succeeded. ${output.latestVersion}...${output.version}`);
    console.log('changelog:\n');
    console.log(output.changelog)
    console.log('output:\n');
    console.log(JSON.stringify(output));
    return output;
  });

  await createGitlabRelease(
    buildTagName(version, options),
    buildGitlabReleaseName(version, options),
    changelog
  ).then(() => console.log('gitlab release created'));

}

main().then(() => console.log('done')).catch(e => console.error('failed:', e.message, e.stack));


