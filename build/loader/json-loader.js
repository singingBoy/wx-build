import {getOptions} from 'loader-utils';

module.exports = function(source) {
  if (this.cacheable) this.cacheable();
  const { isDebug } = getOptions(this) || {};
  let value = typeof source === "string" ? JSON.parse(source) : source;
  if (isDebug) {
    value = JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028') // 分行
        .replace(/\u2029/g, '\\u2029'); // 段落分隔符
  } else {
    value = source;
  }
  return `${value}`;
};
