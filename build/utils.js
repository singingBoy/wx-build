import fs from 'fs';
import {resolve, join, parse} from 'path';
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
export function getEntries(jsFiles, cwd) {
  const entries = {};
  jsFiles.forEach(path => {
    entries[path.split('.')[0]] = join(cwd, path);
  });
  return entries;
}

/**
 * read json file & return object
 * @param jsonPath
 */
export function readJson(jsonPath) {
  return JSON.parse(fs.readFileSync(jsonPath));
}

/**
 * 获取
 */
const pagesKey = ['pages'],
    subPagesKey = ['subpackages'],
    componentKey = ['usingComponents'];
function handleJson(cwd, pattern) {
  const pages = [], components = [], subPages = [];
  const json = getFiles(pattern, cwd, null, true)[0];
  Object.entries(readJson(json)).forEach(([key, value]) => {
    // 页面js
    if(pagesKey.includes(key)){
      value.forEach(val => {
        if (!pages.includes(val)) {
          pages.push(join(cwd, val));
        }
      })
    }
    // 分页js
    if (subPagesKey.includes(key)) {
      value.forEach(val => {
        const {root, pages = []} = val;
        pages.forEach(page => {
          subPages.push(join(cwd, root, page));
        })
      })
    }
    // 全局组件js
    if (componentKey.includes(key)) {
      Object.values(value).forEach(comp => {
        if(!components.includes(comp)) {
          components.push(join(cwd, comp));
        }
      });
    }
  });
  return {
    ...pages,
    ...subPages,
    ...components
  };
}

/**
 * @param cwd
 * @param pages 页面
 * @param gComponents 全局组件
 */
function handleComponentJson(cwd, pages, gComponents) {
  const _allComponents = new Set();
  const jsonPaths = [...pages, ...gComponents];
  jsonPaths.forEach(path => {
    const componentBase = parse(path).dir;
    const {components} = handleJson(cwd, `${path}.json`);
    if (components.length) {
      components.forEach(comp => {
        console.log(222, cwd, resolve(componentBase, comp))
      })
    }
    console.log('**********************')
  })
}

export function translateJson(cwd) {
  const {pages, components} = handleJson(cwd, '**/app.json');
  const pagesEntries = getEntries(pages, cwd);
  handleComponentJson(cwd, pages, components)
}

function cacheArray(json, keys, jsArr) {
  keys.forEach(key => {
    if(json[key] && json[key].length) {
      json[key].forEach(path => {
        if (!jsArr.includes(path)) {
          jsArr.push(path);
        }
      });
    }
  });
}
