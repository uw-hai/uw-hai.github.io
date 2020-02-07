/* DFC - Minimal JS DOM Manipulator */
var DFC = (function () {
  'use strict';
  const SVG_TYPES = [
    'svg', 'rect', 'circle', 'ellipse', 'path', 'g'
  ];
  var dfc = function (type, props, children, callback) {
    // Initialize the element 
    var elem = null;
    if (type instanceof Element || type instanceof HTMLDocument) {
      elem = type;
    } else if (typeof type === 'string') {
      type = type.toLowerCase().trim();
      if (type === '') {
        return document.createTextNode(props);
      } else if (SVG_TYPES.indexOf(type) >= 0) {
        elem = document.createElementNS("http://www.w3.org/2000/svg", type);
      } else {
        elem = document.createElement(type);
      }
    } else {
      throw new Error('First argument must be a string or Element.');
    }

    if (typeof props !== 'object' || props == null) {
      props = {};
    }

    // Set the properties for the element
    for (var propName in props) {
      if (propName === 'style' ){
        for (var styleName in props[propName]) {
          elem.style[styleName] = props[propName][styleName];
        }
      } else if (propName === 'className') {
        elem.className = props[propName];
      } else {
        elem.setAttribute(propName, props[propName]);
      }
    }
    
    if (Array.isArray(children)) {
      // We have child elements to add
      for (var i = 0; i < children.length; i++) {
        if (children[i] !== null) {
          elem.appendChild(children[i]);
        }
      }
    }

    if (typeof callback === 'function') {
      // Do post-processing on the element
      callback(elem);
    }

    return elem;
  };

  return dfc;
})();

