import {readJsonSync, removeSync} from 'fs-extra';
import {resolve, join, parse, relative, extname} from 'path';
import glob from 'glob';

/**
 * find files by pattern
 * @param pattern
 * @param cwd
 * @param ignore
 * @returns {pathName: realPath}
 */
export function getFiles(pattern, cwd, ignore = [], realpath = false) {
  return glob.sync(pattern, {
    cwd,
    realpath,
    ignore
  });
}

/**
 * get webpack entries
 * @param jsFiles
 * @param cwd
 */
export function getEntries(cwd) {
  const entries = {};
  const jsFiles = getEntryResource(cwd);
  jsFiles.forEach(path => {
    const relativePath = relative(cwd, path);
    entries[relativePath.split('.')[0]] = extname(path) ? path : `${path}.js`;
  });
  return entries;
}

export function getChunkFiles(cwd, pattern) {
  return getFiles(pattern, cwd, null, true);
}

/**
 * read json file & return object
 * @param jsonPath
 */
function readJson(jsonPath) {
  return readJsonSync(jsonPath);
}

function clear(path = 'dist') {
  removeSync(path)
}


function getComponents(cwd, components, path) {
  const {usingComponents = {}} = readJson(`${path}.json`);
  const componentBase = parse(path).dir;

  Object.values(usingComponents).forEach(relativeComponent => {
    // 插件
    // if (relativeComponent.indexOf('plugin://') === 0) continue;
    const component = resolve(componentBase, relativeComponent);
    if (!components.has(component)) {
      components.add(component);
      getComponents(cwd, components, component);
    }
  });
}

function getEntryResource(cwd) {
  clear();
  console.log('clear ------- dist --------');

  const appJSONFile = resolve(cwd, 'app.json');
  const {pages = [], subpackages = [], usingComponents, tabBar = {},} = readJson(appJSONFile);
  const components = new Set();

  // pages components
  pages.forEach(page => {
    getComponents(cwd, components, resolve(cwd, page));
  });

  // subPackages components
  subpackages.forEach(subPackage => {
    const {root, pages = []} = subPackage;
    pages.map(page =>
        getComponents(cwd, components, resolve(cwd, join(root, page)))
    )
  });

  // global component components
  Object.values(usingComponents).forEach(component => {
    component = resolve(cwd, component);
    getComponents(cwd, components, component);
  });

  // this.getTabBarIcons(tabBar);
  return new Set([
    join(cwd, 'app'),
    ...pages.map(p => join(cwd, p)),
    ...[].concat(...subpackages.map(v => v.pages.map(w => join(cwd, v.root, w)))),
    ...Object.values(usingComponents).map(c => join(cwd, c)),
    ...components,
    // ...wxsFile,
  ]);
}
