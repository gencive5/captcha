import React, { useState } from 'react';
import './OnlineShop.css';

const OnlineShop = ({ onReturnToCaptcha }) => {
  const [cart, setCart] = useState([]);
  
  // Sample products
  const products = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
      description: "High-quality wireless headphones with noise cancellation"
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
      description: "Track your fitness and stay connected"
    },
    {
      id: 3,
      name: "Portable Bluetooth Speaker",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop",
      description: "Crystal clear sound in a compact design"
    },
    {
      id: 4,
      name: "Gaming Keyboard RGB",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop",
      description: "Mechanical keyboard with customizable RGB lighting"
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
          <h1>🛍️ TechShop Online</h1>
          <button onClick={onReturnToCaptcha} className="return-btn">
            🔒 Back to CAPTCHA
          </button>
        </div>
      </header>

      <div className="shop-container">
        <main className="products-grid">
          <h2>Featured Products</h2>
          <div className="products">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="price">${product.price}</span>
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
            <h3>🛒 Shopping Cart ({cart.length})</h3>
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">${item.price} x {item.quantity}</span>
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
                  <strong>Total: ${getTotalPrice().toFixed(2)}</strong>
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