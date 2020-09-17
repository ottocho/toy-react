
const RENDER_TO_DOM = Symbol("render to dom");

class Component {
  constructor () {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this.state = {};
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  [RENDER_TO_DOM](range) {
    this.render()[RENDER_TO_DOM](range);
  }
}

class ElementWrapper {
  constructor (type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(child) {
    let range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    child[RENDER_TO_DOM](range);
  }

  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor (content) {
    this.root = document.createTextNode(content);
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

const render = (component, parentComponent) => {
  let range = document.createRange();
  range.setStart(parentComponent, 0);
  range.setEnd(parentComponent, parentComponent.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
};

const createElement = (component, props, ...children) => {
  let e;

  if (typeof component === 'string') {
    // HTML tag passed as string
    // e.g. `div` will passed as string "div"
    e = new ElementWrapper(component);
  } else {
    // Component Class
    e = new component;
  }

  for (let attr in props) {
    e.setAttribute(attr, props[attr]);
  }

  const insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextWrapper(child);
      }
      if (typeof child === "number") {
        child = new TextWrapper(child.toString());
      }
      if (typeof child === "object" && child instanceof Array) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      }
    }
  }
  insertChildren(children);
  return e;
};

export {createElement, render, Component};
