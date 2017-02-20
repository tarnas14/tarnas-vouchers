import React, { Component } from 'react';
import './App.css';

class App extends Component {
  render() {
    return (
    <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-color--grey-100">
      <header className="mdl-layout__header mdl-color--grey-100 mdl-color-text--grey-800">
        <div className="mdl-layout__header-row">
          <span className="mdl-layout-title">Tarnas voucher api test client</span>
        </div>
      </header>
      <main className="mdl-layout__content">
        <div className="mdl-grid">
          <div className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
            <div className="mdl-card__title">
              <h2 className="mdl-card__title-text">Welcome</h2>
            </div>
            <div className="mdl-card__supporting-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Mauris sagittis pellentesque lacus eleifend lacinia...
            </div>
            <div className="mdl-card__actions mdl-card--border">
              <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                Get Started
              </a>
            </div>
            <div className="mdl-card__menu">
              <button className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">share</i>
              </button>
            </div>
          </div>
          <div className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
            <div className="mdl-card__title">
              <h2 className="mdl-card__title-text">Welcome</h2>
            </div>
            <div className="mdl-card__supporting-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Mauris sagittis pellentesque lacus eleifend lacinia...
            </div>
            <div className="mdl-card__actions mdl-card--border">
              <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
                Get Started
              </a>
            </div>
            <div className="mdl-card__menu">
              <button className="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
                <i className="material-icons">share</i>
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="mdl-mini-footer">
        <div className="mdl-mini-footer__left-section">
          2017 by <a href="https://github.com/tarnas14" target="about:blank">tarnas</a>
        </div>
      </footer>
    </div>
    );
  }
}

export default App;
