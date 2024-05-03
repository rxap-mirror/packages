import { Plugin } from 'release-it';

const options = { write: false };

class RxapPlugin extends Plugin {

  async getLatestVersion() {
    console.log('rxap getLatestVersion');
    const tagList = await this.exec(`git tag --sort=-taggerdate -l "v*"`, { options }).then(
      stdout => {
        if (stdout) {
          return stdout.split('\n');
        }
        return null;
      },
      () => null
    );

    if (tagList?.length) {
      let patternList = [/^v[0-9]+\.[0-9]+\.[0-9]+$/];
      if (this.config.options.preRelease) {
        const hierarchy = this.options.preReleaseHierarchy;
        const channel = this.config.options.preRelease;
        let index = hierarchy.indexOf(channel);
        if (index === -1) {
          index = hierarchy.length;
        } else {
          index++;
        }
        const includedChannelList = [this.config.options.preRelease];
        if (process.env.RELEASE_IT_PROMOTE === 'true') {
          console.log('in promote mode')
          includedChannelList.push(...hierarchy.slice(0, index));
        } else if (process.env.RELEASE_IT_DEMOTE === 'true') {
          console.log('in demote mode')
          includedChannelList.push(...hierarchy.slice(index));
        } else {
          console.log('in normal mode')
        }
        console.log('include pre-release names: ' + includedChannelList.join(', ') + ' for channel: ' + channel);
        patternList.push(...includedChannelList.map(channel => new RegExp(`^v[0-9]+\\.[0-9]+\\.[0-9]+-${channel}\\.[0-9]+$`)));
      } else {
        console.log('release only');
      }
      const latestVersion = this.firstThatMatch(tagList, patternList);
      if (latestVersion) {
        this.config.setContext({ latestTag: latestVersion });
      }
      return latestVersion;
    } else {
      console.log('no tags found');
    }

    return null;

  }

  firstThatMatch(tagList, patternList) {
    console.log('checking tags: ' + tagList.slice(0, 10).join(', ') + ' ...')
    for (const tag of tagList) {
      console.log('checking tag:', tag);
      if (patternList.some(pattern => pattern.test(tag))) {
        console.log('found latest tag:', tag);
        return tag;
      }
    }
    return null;
  }


}

export default RxapPlugin;
