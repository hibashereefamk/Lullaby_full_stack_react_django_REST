// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Home from "./components/pages/Home";
import VerifyOtp from "./components/auth/VerifyOtp.JSX";
import About from "./components/pages/About";
import Products from "./components/pages/Product";
import ProductDetail from "./components/pages/Produtdetails";
import Wishlist from "./components/pages/Wishlist";
import Cart from "./components/pages/Cart";
import Checkout from "./components/pages/checkoutpage";
import OrderSuccess from "./components/pages/OrderSuccess";
import Profile from "./components/pages/Profile";
import Order from "./components/pages/order";
import ResetPassword from "./components/auth/ResetPassword";
import RequestResetPassword from "./components/auth/RequestResetPassword";
import AdminRoute from "./components/admin/ProtectedRoute";
function App() {
 
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verify" element={<VerifyOtp/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/products" element={<Products/>} />
        <Route path="/products/:id" element={<ProductDetail/>} />
        <Route path="/wishlists" element={<Wishlist/>} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/checkout" element={<Checkout/>} />
        <Route path="/order-success" element={<OrderSuccess/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/order" element={<Order/>} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/request-reset" element={<RequestResetPassword />} />
        <Route element={<AdminRoute user={currentUser}/>}>
        
        
        
        </Route>


      </Routes>
    </BrowserRouter>
  );
}

export default App;
