// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * Make publicly accessible (in client side) the `process.env.*` list providedd
 * i,e with `envvarList = ['foo', 'bar']`, both `process.env.foo` and
 * `process.env.bar` would be usable from client side
 */
function withPublicEnvvars(envvarList) {
  return (nextConfig) => ({
    webpack: (config, options) => {
      const { webpack } = options;

      const defineList = Object.entries(envvarList).reduce(
        (list, [name, defaultValue]) => {
          let value = process.env[name];
          if (value === undefined) {
            value = defaultValue;
          }
          if (value !== undefined) {
            list[`process.env.${name}`] = JSON.stringify(value);
          }
          return list;
        },
        {}
      );

      config.plugins.push(new webpack.DefinePlugin(defineList));

      if (nextConfig && typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
}

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
};

const plugins = [
  // List of environment variables to provide for the client side build
  // as `{ name: defaultValue }`
  withPublicEnvvars({
    API_URL: 'http://localhost:3000/api',
  }),
  // when adding more plugins,
  // leave Nx the last one to avoid errors on the config
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
