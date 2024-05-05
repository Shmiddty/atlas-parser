/**
 * @license
 *
 * Javascript Atlas Parser
 *
 * Copyright © 2014, Alaa-eddine KADDOURI / Ezelia.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the “Software”), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = (function() {

function partition(arr, fn) {
  let part = [];
  const out = [part];
  arr.forEach((itm, i) => {
    part.push(itm);
    if (fn(itm, arr[i+1])) {
      part = [];
      out.push(part);
    }
  });
  return out;
}

// TODO: this could be better.
function toProp([left, right]) {
  var numMatch = right.match(/[0-9\-\.]+/g);
  var boolMatch = right.match(/(true|false)+/gi);
  var strMatch = right.match(/([a-z_\\\/])+/gi);

  left = left.trim()
	right = right.replace(/\s+/, ''); //clean spaces

	if (strMatch && !boolMatch) {
		return { [left]: right }
	}

	if (boolMatch || (numMatch && numMatch.length == 1)) {
    // so icky, amiright?
		return { [left]: eval(right) }
	}

	if (numMatch && numMatch.length > 1) {
		return { [left]: right.split(',').map(Number) }
	}
	return { [left]: right }
}

function parse(atlasTxt) {
  return atlasTxt.trim().split('\n\n').reduce((out, packStr) => {
    const [img, ...lines] = packStr.split('\n').map(ln => ln.split(':'))
    const [top, ...children] = partition(lines, (a, b) => b && a.length == 2 && b.length == 1)
    
    out[img[0]] = children.reduce((o, [[frame], ...props]) => {
      o.frames[frame] = (o.frames[frame] || []).concat(
        props.map(toProp).reduce((o, v) => Object.assign(o, v), {})
      ).sort((a, b) => a.index - b.index);
      return o;
    }, top.map(toProp).reduce((o, v) => Object.assign(o, v), { frames: {} }));
    
    return out;
  }, {});
}
return {
	parse:parse
}
})();
