import fs from 'fs';
import { reslove, join } from 'path';
import glob from 'glob';

export function getFiles(pattern, cwd) {
  return glob.sync(pattern, {
    cwd,
    realpath: false,
  });
}

export function getEntries(jsFiles, cwd) {
  const entries = {};
  console.log(jsFiles, 999)
  jsFiles.forEach(path => {
    console.log(path.split('.')[0])
    entries[path.split('.')[0]] = join(cwd, path);
  });
  return entries;
}