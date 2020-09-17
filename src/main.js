import {createElement, render, Component} from './toy-react';

class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        {this.children}
      </div>
    );
  }
}

const k = "happy"

render(
  <MyComponent>
    <div id="a" class={k}>
      <div></div>
      <span>hello</span>
      <span>world</span>
    </div>
  </MyComponent>
  , document.body
);
