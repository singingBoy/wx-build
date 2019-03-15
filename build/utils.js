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
export function getFiles(pattern, cwd, ignore = []) {
  return glob.sync(pattern, {
    cwd,
    realpath: false,
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
  return new Promise((resolve, reject) => {
    fs.readFile(jsonPath, (err, data) => {
      if (err) {
        return console.error(err);
      }
      return JSON.parse(data.toString());
    })
  });
}

export function translateJson(cwd) {
  // exclude json
  const excludeJsonPattern = ['*.config.json'];
  const appJsonKey = ['pages', 'subpackages', 'workers', 'usingComponents'];
  const jsonFile = getFiles('**/*.json', cwd, excludeJsonPattern);
  console.log(jsonFile);
  jsonFile
}
