import React from 'react'

const ProductGrid = props => (
  <div className="mdl-grid">
    {props.products.map(product => (
      <div className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col" key={product.id}>
        <div className="mdl-card__title">
          <h2 className="mdl-card__title-text">{product.name}</h2>
        </div>
        <div className="mdl-card__supporting-text">{product.description}</div>
        <div className="mdl-card__actions mdl-card--border">
          {
            product.sold 
             ? (<span>SOLD OUT</span>)
             : (
               <a className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onClick={props.buy.bind(null, product.id)}>
               BUY
               </a>
             )
          }
        </div>
        <div className="mdl-card__menu">
          <span className="mdl-chip">
            <span className="mdl-chip__text">${product.price}</span>
          </span>
        </div>
      </div>
    ))}
  </div>
)

export default ProductGrid
