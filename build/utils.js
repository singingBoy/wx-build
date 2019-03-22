import fs from 'fs';
import {reslove, join} from 'path';
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

function handleJson(cwd, pattern) {
  const pagesKey = ['pages', 'subpackages'];
  const componentKey = ['usingComponents'];
  const appJson = getFiles(pattern, cwd, null, true)[0];
  const pages = [], components = [];
  Object.entries(readJson(appJson)).forEach(([key, value]) => {
    // 页面js
    if(pagesKey.includes(key)){
      value.forEach(val => {
        if (!pages.includes(val)) {
          pages.push(val);
        }
      })
    }
    // 全局组件js
    if (componentKey.includes(key)) {
      Object.values(value).forEach(comp => {
        if(!components.includes(comp)) {
          components.push(comp);
        }
      });
    }
  });
  return {
    pages,
    components,
  };
}

/**
 * @param cwd
 * @param pages 页面
 * @param gComponents 全局组件
 */
function handleComponentJson(cwd, pages, gComponents) {
  const jsonPaths = [...pages, ...gComponents];
  console.log('**********************')
  console.log(jsonPaths);
  jsonPaths.forEach(path => {

    // const {components} = handleJson(cwd, `${path}/${path.split('/')}`)
  })
  console.log('**********************')
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
