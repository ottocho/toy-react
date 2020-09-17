import {createElement, render, Component} from './toy-react';

class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      name: "no name",
      age: 88
    };
  }

  render() {
    return (
      <div>
        <h1>MyComponent</h1>
        <button onclick={() => { this.setState({ age: this.state.age + 1})}} >add</button>
        <p>name: {this.state.name}</p>
        <p>age: {this.state.age}</p>
        {this.children}
      </div>
    );
  }
}

const k = "happy";

render(
  <MyComponent>
    <div id="a" class={k}>
      <div>
        <h3>wow</h3>
      </div>
      <span>hello</span>
      <span>world</span>
    </div>
  </MyComponent>
  , document.body
);
