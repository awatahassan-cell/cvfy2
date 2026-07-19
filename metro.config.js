const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Some packages (e.g. react-native-quran-tajweed) point their `react-native`
// field at raw TypeScript source (src/index.ts). Metro prefers that field on
// native, which can break at bundle time. Force such packages to resolve via
// their prebuilt `module`/`main` output — the same build the web bundle uses.
const PREBUILT_ONLY = ['react-native-quran-tajweed'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const forced = PREBUILT_ONLY.some((name) => moduleName === name || moduleName.startsWith(name + '/'));
  if (forced) {
    return context.resolveRequest(
      { ...context, resolverMainFields: ['module', 'browser', 'main'] },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
