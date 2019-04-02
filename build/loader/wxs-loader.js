import Uglify from 'uglify-js';
import {getOptions} from 'loader-utils';
import {transform} from 'es3ify';

module.exports = function (source) {
  const { isDebug } = getOptions(this) || {};
  let context = transformToEs3(source);
  if (isDebug) {
    context = `${minifyJs(source)}`;
  }
  return context;
};

function transformToEs3(content) {
  return transform(content);
}

function minifyJs(content) {
  const {error, code} = Uglify.minify(content, {
    compress: {
      drop_console: true
    },
  });
  if (error) {
    return content;
  }
  return code;
}
