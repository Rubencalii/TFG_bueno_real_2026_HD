O:41:"Symfony\Component\AssetMapper\MappedAsset":12:{s:10:"sourcePath";s:55:"/app/assets/node_modules/@babel/preset-env/lib/index.js";s:10:"publicPath";s:59:"/assets/node_modules/@babel/preset-env/lib/index-Nk0aG-L.js";s:23:"publicPathWithoutDigest";s:51:"/assets/node_modules/@babel/preset-env/lib/index.js";s:15:"publicExtension";s:2:"js";s:7:"content";s:11696:""use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.isPluginRequired = isPluginRequired;
exports.transformIncludesAndExcludes = void 0;
var _semver = require("semver");
var _debug = require("./debug.js");
var _filterItems = require("./filter-items.js");
var _moduleTransformations = require("./module-transformations.js");
var _normalizeOptions = require("./normalize-options.js");
var _shippedProposals = require("./shipped-proposals.js");
var _pluginsCompatData = require("./plugins-compat-data.js");
var _babelPluginPolyfillCorejs = require("babel-plugin-polyfill-corejs3");
var _babel7Plugins = require("./polyfills/babel-7-plugins.cjs");
var _helperCompilationTargets = require("@babel/helper-compilation-targets");
var _availablePlugins = require("./available-plugins.js");
var _helperPluginUtils = require("@babel/helper-plugin-utils");
const pluginCoreJS3 = _babelPluginPolyfillCorejs.default || _babelPluginPolyfillCorejs;
function isPluginRequired(targets, support) {
  return (0, _helperCompilationTargets.isRequired)("fake-name", targets, {
    compatData: {
      "fake-name": support
    }
  });
}
function filterStageFromList(list, stageList) {
  return Object.keys(list).reduce((result, item) => {
    if (!stageList.has(item)) {
      result[item] = list[item];
    }
    return result;
  }, {});
}
const pluginsListWithProposals = Object.assign({}, _pluginsCompatData.plugins, _pluginsCompatData.pluginsBugfixes);
const pluginsListWithoutProposals = filterStageFromList(pluginsListWithProposals, _shippedProposals.proposalPlugins);
var pluginsListNoBugfixesWithProposals = _pluginsCompatData.plugins;
var pluginsListNoBugfixesWithoutProposals = filterStageFromList(_pluginsCompatData.plugins, _shippedProposals.proposalPlugins);
const getPlugin = pluginName => {
  const plugin = _availablePlugins.default[pluginName]();
  if (!plugin) {
    throw new Error(`Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`);
  }
  return plugin;
};
const transformIncludesAndExcludes = opts => {
  return opts.reduce((result, opt) => {
    const target = /^(?:es|es6|es7|esnext|web)\./.test(opt) ? "builtIns" : "plugins";
    result[target].add(opt);
    return result;
  }, {
    all: opts,
    plugins: new Set(),
    builtIns: new Set()
  });
};
exports.transformIncludesAndExcludes = transformIncludesAndExcludes;
function getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, babelVersion) {
  const modulesPluginNames = [];
  if (modules) {
    modulesPluginNames.push(_moduleTransformations.default[modules]);
  }
  if (shouldTransformDynamicImport) {
    if (modules && modules !== "umd") {
      modulesPluginNames.push("transform-dynamic-import");
    } else {
      console.warn("Dynamic import can only be transformed when transforming ES" + " modules to AMD, CommonJS or SystemJS.");
    }
  }
  if (!babelVersion.startsWith("8")) {
    if (!shouldTransformDynamicImport) {
      modulesPluginNames.push("syntax-dynamic-import");
    }
    modulesPluginNames.push("syntax-top-level-await");
    modulesPluginNames.push("syntax-import-meta");
  }
  return modulesPluginNames;
}
const getCoreJSOptions = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug
}) => ({
  method: `${useBuiltIns}-global`,
  version: corejs ? corejs.toString() : undefined,
  targets: polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  debug,
  "#__secret_key__@babel/preset-env__compatibility": {
    noRuntimeName: true
  }
});
var getPolyfillPlugins = ({
  useBuiltIns,
  corejs,
  polyfillTargets,
  include,
  exclude,
  proposals,
  shippedProposals,
  regenerator,
  debug
}) => {
  const polyfillPlugins = [];
  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const pluginOptions = getCoreJSOptions({
      useBuiltIns,
      corejs,
      polyfillTargets,
      include,
      exclude,
      proposals,
      shippedProposals,
      debug
    });
    if (corejs) {
      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          polyfillPlugins.push([_babel7Plugins.pluginCoreJS2, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            usage: true
          }]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            usage: true,
            deprecated: true
          }]);
        }
        if (regenerator) {
          polyfillPlugins.push([_babel7Plugins.pluginRegenerator, {
            method: "usage-global",
            debug
          }]);
        }
      } else {
        if (corejs.major === 2) {
          polyfillPlugins.push([_babel7Plugins.legacyBabelPolyfillPlugin, {
            regenerator
          }], [_babel7Plugins.pluginCoreJS2, pluginOptions]);
        } else {
          polyfillPlugins.push([pluginCoreJS3, pluginOptions], [_babel7Plugins.legacyBabelPolyfillPlugin, {
            deprecated: true
          }]);
          if (!regenerator) {
            polyfillPlugins.push([_babel7Plugins.removeRegeneratorEntryPlugin, pluginOptions]);
          }
        }
      }
    }
  }
  return polyfillPlugins;
};
exports.getPolyfillPlugins = getPolyfillPlugins;
function getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api) {
  if (optionsTargets != null && optionsTargets.esmodules && optionsTargets.browsers) {
    console.warn(`
@babel/preset-env: esmodules and browsers targets have been specified together.
\`browsers\` target, \`${optionsTargets.browsers.toString()}\` will be ignored.
`);
  }
  return (0, _helperCompilationTargets.default)(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
    browserslistEnv,
    onBrowserslistConfigFound(config) {
      api.addExternalDependency(config);
    }
  });
}
function supportsStaticESM(caller) {
  return !!(caller != null && caller.supportsStaticESM);
}
function supportsDynamicImport(caller) {
  return !!(caller != null && caller.supportsDynamicImport);
}
function supportsExportNamespaceFrom(caller) {
  return !!(caller != null && caller.supportsExportNamespaceFrom);
}
var _default = exports.default = (0, _helperPluginUtils.declarePreset)((api, opts) => {
  api.assertVersion(7);
  const babelTargets = api.targets();
  const {
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    modules: optionsModules,
    shippedProposals,
    targets: optionsTargets,
    useBuiltIns,
    corejs: {
      version: corejs,
      proposals
    },
    browserslistEnv
  } = (0, _normalizeOptions.default)(opts);
  var {
    loose,
    spec = false,
    bugfixes = false
  } = opts;
  let targets = babelTargets;
  if (_semver.lt(api.version, "7.13.0") || opts.targets || opts.configPath || opts.browserslistEnv || opts.ignoreBrowserslistConfig) {
    var hasUglifyTarget = false;
    if (optionsTargets != null && optionsTargets.uglify) {
      hasUglifyTarget = true;
      delete optionsTargets.uglify;
      console.warn(`
The uglify target has been deprecated. Set the top level
option \`forceAllTransforms: true\` instead.
`);
    }
    targets = getLocalTargets(optionsTargets, ignoreBrowserslistConfig, configPath, browserslistEnv, api);
  }
  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);
  const compatData = bugfixes ? shippedProposals ? pluginsListWithProposals : pluginsListWithoutProposals : shippedProposals ? pluginsListNoBugfixesWithProposals : pluginsListNoBugfixesWithoutProposals;
  const modules = optionsModules === "auto" ? api.caller(supportsStaticESM) ? false : "commonjs" : optionsModules;
  const shouldTransformDynamicImport = optionsModules === "auto" ? !api.caller(supportsDynamicImport) : !!modules;
  if (!exclude.plugins.has("transform-export-namespace-from") && (optionsModules === "auto" ? !api.caller(supportsExportNamespaceFrom) : !!modules)) {
    include.plugins.add("transform-export-namespace-from");
  }
  const pluginNames = (0, _helperCompilationTargets.filterItems)(compatData, include.plugins, exclude.plugins, transformTargets, getSpecialModulesPluginNames(modules, shouldTransformDynamicImport, api.version), !loose ? undefined : ["transform-typeof-symbol"], _shippedProposals.pluginSyntaxMap);
  if (shippedProposals) {
    (0, _filterItems.addProposalSyntaxPlugins)(pluginNames, _shippedProposals.proposalSyntaxPlugins);
  }
  (0, _filterItems.removeUnsupportedItems)(pluginNames, api.version);
  (0, _filterItems.removeUnnecessaryItems)(pluginNames, _pluginsCompatData.overlappingPlugins);
  const polyfillPlugins = getPolyfillPlugins({
    useBuiltIns,
    corejs,
    polyfillTargets: targets,
    include: include.builtIns,
    exclude: exclude.builtIns,
    proposals,
    shippedProposals,
    regenerator: pluginNames.has("transform-regenerator"),
    debug
  });
  const pluginUseBuiltIns = useBuiltIns !== false;
  const plugins = Array.from(pluginNames).map(pluginName => {
    if (pluginName === "transform-class-properties" || pluginName === "transform-private-methods" || pluginName === "transform-private-property-in-object") {
      return [getPlugin(pluginName), {
        loose: loose ? "#__internal__@babel/preset-env__prefer-true-but-false-is-ok-if-it-prevents-an-error" : "#__internal__@babel/preset-env__prefer-false-but-true-is-ok-if-it-prevents-an-error"
      }];
    }
    if (pluginName === "syntax-import-attributes") {
      return [getPlugin(pluginName), {
        deprecatedAssertSyntax: true
      }];
    }
    return [getPlugin(pluginName), {
      spec,
      loose,
      useBuiltIns: pluginUseBuiltIns
    }];
  }).concat(polyfillPlugins);
  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify((0, _helperCompilationTargets.prettifyTargets)(targets), null, 2));
    console.log(`\nUsing modules transform: ${optionsModules.toString()}`);
    console.log("\nUsing plugins:");
    pluginNames.forEach(pluginName => {
      (0, _debug.logPlugin)(pluginName, targets, compatData);
    });
    if (!useBuiltIns) {
      console.log("\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.");
    }
  }
  return {
    plugins
  };
});
exports.getModulesPluginNames = ({
  modules,
  transformations,
  shouldTransformESM,
  shouldTransformDynamicImport,
  shouldTransformExportNamespaceFrom
}) => {
  const modulesPluginNames = [];
  if (modules !== false && transformations[modules]) {
    if (shouldTransformESM) {
      modulesPluginNames.push(transformations[modules]);
    }
    if (shouldTransformDynamicImport) {
      if (shouldTransformESM && modules !== "umd") {
        modulesPluginNames.push("transform-dynamic-import");
      } else {
        console.warn("Dynamic import can only be transformed when transforming ES" + " modules to AMD, CommonJS or SystemJS.");
      }
    }
  }
  if (shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("transform-export-namespace-from");
  }
  if (!shouldTransformDynamicImport) {
    modulesPluginNames.push("syntax-dynamic-import");
  }
  if (!shouldTransformExportNamespaceFrom) {
    modulesPluginNames.push("syntax-export-namespace-from");
  }
  modulesPluginNames.push("syntax-top-level-await");
  modulesPluginNames.push("syntax-import-meta");
  return modulesPluginNames;
};

//# sourceMappingURL=index.js-5_Jokwl.map
";s:6:"digest";s:32:"364d1a1be2d1dbfaed9ce842cf518352";s:13:"isPredigested";b:0;s:11:"logicalPath";s:43:"node_modules/@babel/preset-env/lib/index.js";s:8:"isVendor";b:0;s:55:" Symfony\Component\AssetMapper\MappedAsset dependencies";a:1:{i:0;O:41:"Symfony\Component\AssetMapper\MappedAsset":12:{s:10:"sourcePath";s:59:"/app/assets/node_modules/@babel/preset-env/lib/index.js.map";s:10:"publicPath";s:63:"/assets/node_modules/@babel/preset-env/lib/index.js-5_Jokwl.map";s:23:"publicPathWithoutDigest";s:55:"/assets/node_modules/@babel/preset-env/lib/index.js.map";s:15:"publicExtension";s:3:"map";s:7:"content";N;s:6:"digest";s:32:"e7f2689309565feb8ab4f5844e3a74ae";s:13:"isPredigested";b:0;s:11:"logicalPath";s:47:"node_modules/@babel/preset-env/lib/index.js.map";s:8:"isVendor";b:0;s:55:" Symfony\Component\AssetMapper\MappedAsset dependencies";a:0:{}s:59:" Symfony\Component\AssetMapper\MappedAsset fileDependencies";a:0:{}s:60:" Symfony\Component\AssetMapper\MappedAsset javaScriptImports";a:0:{}}}s:59:" Symfony\Component\AssetMapper\MappedAsset fileDependencies";a:0:{}s:60:" Symfony\Component\AssetMapper\MappedAsset javaScriptImports";a:0:{}}