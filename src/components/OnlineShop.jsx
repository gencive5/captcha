import React, { useState } from 'react';
import './OnlineShop.css';

const OnlineShop = ({ onReturnToCaptcha }) => {
  const [cart, setCart] = useState([]);
  
  // Sample products
  const products = [
    {
      id: 1,
      name: "pants",
      price: 100,
      image: "/images/1L8A1395.webp",
    },
    {
      id: 2,
      name: "shorts",
      price: 100,
      image: "/images/1L8A1382.webp",
    },
    {
      id: 3,
      name: "sweater",
      price: 200,
      image: "/images/1L8A1353.webp",
    },
    {
      id: 4,
      name: "jeans",
      price: 120,
      image: "/images/1L8A1238.webp",
    }
  ];

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="online-shop">
      <header className="shop-header">
        <div className="shop-nav">
          <h1>timelapse</h1>
          <button onClick={onReturnToCaptcha} className="return-btn">
            Back to CAPTCHA
          </button>
        </div>
      </header>

      <div className="shop-container">
        <main className="products-grid">
          <div className="products">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="price">€{product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="add-to-cart-btn"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="cart-sidebar">
          <div className="cart">
            <h3>({cart.length})</h3>
            {cart.length === 0 ? (
              <p></p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">€{item.price} x {item.quantity}</span>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <strong>Total: €{getTotalPrice().toFixed(2)}</strong>
                </div>
                <button className="checkout-btn">
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OnlineShop;