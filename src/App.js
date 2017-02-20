import React, { Component } from 'react'
import ProductGrid from './ProductGrid'

import getProducts from './productsService'

class App extends Component {
  constructor (props) {
    super(props)
    this.buy = this.buy.bind(this)
    this.state = {
      products: getProducts()
    }
  }

  buy (productId) {
    this.setState({
      buying: productId
    })
  }

  render() {
    const {buying, products} = this.state;
    return (
      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-color--grey-100">
        <header className="mdl-layout__header mdl-color--grey-100 mdl-color-text--grey-800">
          <div className="mdl-layout__header-row">
            <span className="mdl-layout-title">Tarnas voucher api test client</span>
          </div>
        </header>
        <main className="mdl-layout__content">
          {buying ? <div>hello, buying product {buying}</div> : null}
          <ProductGrid products={products} buy={this.buy}></ProductGrid>
        </main>
        <footer className="mdl-mini-footer">
          <div className="mdl-mini-footer__left-section">
            2017 by <a href="https://github.com/tarnas14" target="about:blank">tarnas</a>
          </div>
        </footer>
      </div>
    )
  }
}

export default App
