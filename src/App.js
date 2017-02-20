import React, { Component } from 'react'

import ProductGrid from './ProductGrid'
import Buy from './Buy'
import getProducts from './productsService'

class App extends Component {
  constructor (props) {
    super(props)
    this.buy = this.buy.bind(this)
    this.productBought = this.productBought.bind(this)
    this.state = {
      products: getProducts()
    }
  }

  buy (productId) {
    if (!this.state.products.find(p => p.id === productId)) {
      this.setState({
        error: `Product with id ${productId} was not found.`
      })

      return
    }

    this.setState({
      buying: productId
    })
  }

  productBought (productId) {
    this.setState(oldState => ({
      buying: null,
      products: oldState.products.map(product => product.id === productId ? Object.assign(product, {sold: true}) : product)
    }))
  }

  render() {
    const {buying, products, error} = this.state
    const productToBuy = buying ? this.state.products.find(p => p.id === buying) : null

    return (
      <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-color--grey-100">
        <header className="mdl-layout__header mdl-color--grey-100 mdl-color-text--grey-800">
          <div className="mdl-layout__header-row">
            <span className="mdl-layout-title">Tarnas voucher api test client</span>
          </div>
        </header>
        <main className="mdl-layout__content">
          <ProductGrid products={products} buy={this.buy}></ProductGrid>
          {buying
            ? (
              <Buy
                product={productToBuy}
                productBought={this.productBought}
              ></Buy>
              )
            : null}
          {error ? <p>ERROR: {error}</p> : null}
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
