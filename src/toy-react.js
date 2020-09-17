
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

  get root() {
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root;
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
    this.root.appendChild(child.root);
  }
}

class TextWrapper {
  constructor (content) {
    this.root = document.createTextNode(content);
  }
}

const render = (component, parentComponent) => {
  parentComponent.appendChild(component.root);
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
