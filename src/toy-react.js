
const RENDER_TO_DOM = Symbol("render to dom");

class Component {
  constructor () {
    this.props = Object.create(null);
    this.children = [];
    this.state = {};
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  get vdom() {
    return this.render().vdom;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }

  update() {
    /*
     * check if `oldNode` and `newNode` is a same node
     *
     * Q: why not check the children
     * A: children changes when props changes; props' checking is enough here
     */
    const isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type) {
        return false;
      }

      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false;
      }
      if (newNode.type === '#text') {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }
      return true;
    }

    const _update = (oldNode, newNode) => {
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }

      newNode._range = oldNode._range;

      const newChildren = newNode.vchildren;
      const oldChildren = oldNode.vchildren;

      if (!newChildren || !newChildren.length) {
        return;
      }

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];
        if (i < oldChildren.length) {
          _update(oldChild, newChild);
        } else {
          // have more children: render in new range
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    }

    const vdom = this.vdom;     // this.vdom: new vdom based on props and render()
    _update(this._vdom, vdom);  // this._vdom: last vdom before the update
    this._vdom = vdom;
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== "object") {
      this.state = newState;
      this.update();
      return;
    }
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== "object") {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      }
    }
    merge(this.state, newState);
    this.update();
  }
}

class ElementWrapper extends Component {
  constructor (type) {
    super(type);
    this.type = type;
  }

  /*
   * this.children: real dom components
   * this.vchildren: virtual dom components (toy-react.Component tree)
   */
  get vdom() {
    this.vchildren = this.children.map(child => child.vdom);
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    const newNode = document.createElement(this.type);

    for (let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        const n = RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase());
        newNode.addEventListener(n, value);
      } else {
        if (name === "className") {
          newNode.setAttribute("class", value);
        } else {
          newNode.setAttribute(name, value);
        }
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    for (let vc of this.vchildren) {
      let childRange = document.createRange();
      childRange.setStart(newNode, newNode.childNodes.length);
      childRange.setEnd(newNode, newNode.childNodes.length);
      vc[RENDER_TO_DOM](childRange);
    }

    replaceNodeAndUpdateRange(range, newNode);
  }
}

class TextWrapper extends Component {
  constructor (content) {
    super(content);
    this.type = '#text';
    this.content = content;
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    const newNode = document.createTextNode(this.content);
    replaceNodeAndUpdateRange(range, newNode);
  }
}

const replaceNodeAndUpdateRange = (range, node) => {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

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
      if (child === null) {
        continue;
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

const render = (component, parentComponent) => {
  let range = document.createRange();
  range.setStart(parentComponent, 0);
  range.setEnd(parentComponent, parentComponent.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
};

export {createElement, render, Component};
