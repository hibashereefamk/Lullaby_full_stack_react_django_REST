import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './Navbar'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, Plus, CheckCircle,Trash2 } from 'lucide-react'
import './checkoutpage.css'
import PaymentButton from './PaymentComponent'
import { useShop } from "../context/WishlistContext";
import { showAlert } from "../../utils/swal";

function Checkout () {
  const navigate = useNavigate()
  const location = useLocation()
  const {fetchCart} = useShop()
  const [cart, setCart] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(true)

  const [showAddressForm, setShowAddressForm] = useState(false)

  // UPDATED: State to match your new required fields
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    postal_code: '',
    state: '',
    country: 'India',
    is_default: false
  })

  const token = localStorage.getItem('access_token')
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const initCheckout = async () => {
      try {
        // --- 1. Fetch Addresses ---
        const addressRes = await axios.get(
          'http://127.0.0.1:8000/api/addresses/',
          config
        )
        const addressList = addressRes.data.results || addressRes.data
        setAddresses(addressList)

        // LOGIC UPDATE:
        if (addressList.length > 0) {
          // If addresses exist, select the default or the first one
          const defaultAddr = addressList.find(a => a.is_default)
          setSelectedAddressId(defaultAddr ? defaultAddr.id : addressList[0].id)
          setShowAddressForm(false) // Hide form if we have addresses
        } else {
          // If NO addresses, Force the form to open
          setShowAddressForm(true)
        }

        // --- 2. Handle Cart Data ---
        if (location.state && location.state.cart) {
          setCart(location.state.cart)
        } else {
          const cartRes = await axios.get(
            'http://127.0.0.1:8000/api/cart/',
            config
          )
          const results = cartRes.data.results || cartRes.data
          const userCart = Array.isArray(results) ? results[0] : results
          setCart(userCart)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error loading checkout data:', err)
        setLoading(false)
      }
    }

    initCheckout()
  }, [token, navigate, location.state])
  const handleDelete = async id => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/addresses/${id}/`, config)
      setAddresses(prevAddresses => prevAddresses.filter(addr => addr.id !== id));
      console.log('Deleted successfully')
    } catch (err) {
      console.error('Address Error:', err.response)
    }
  }
  const handleAddressSubmit = async e => {
    e.preventDefault()

    const {
      full_name,
      phone_number,
      street_address,
      city,
      postal_code,
      state
    } = newAddress

    if (
      !full_name ||
      !phone_number ||
      !street_address ||
      !city ||
      !postal_code ||
      !state
    ) {
      showAlert('Please fill in all required fields.')
      return
    }

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/addresses/',
        newAddress,
        config
      )

      setAddresses([...addresses, res.data])
      setSelectedAddressId(res.data.id)

      // Reset and hide form
      setShowAddressForm(false)
      setNewAddress({
        full_name: '',
        phone_number: '',
        street_address: '',
        city: '',
        postal_code: '',
        state: '',
        country: 'India',
        is_default: false
      })
    } catch (err) {
      console.error('Address Error:', err.response)
      if (err.response && err.response.data) {
        // Display specific backend validation errors
        showAlert('Error: ' + JSON.stringify(err.response.data))
      } else {
        showAlert('Failed to save address. Please try again.')
      }
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showAlert('Please select or add a delivery address.')
      return
    }

    try {
      const orderData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        payment_status: 'Pending'
      }

      const res = await axios.post(
        'http://127.0.0.1:8000/api/orders/',
        orderData,
        config
      )

      if (res.status === 201 || res.status === 200) {
        showAlert('Order Placed Successfully! Order ID: ' + res.data.order_number)
        setTimeout(async () => {
            await fetchCart(); 
            navigate('/order-success');
        }, 500);
      
      }
    } catch (err) {
      console.error('Order Error:', err.response?.data)
      showAlert(err.response?.data?.detail || 'Failed to place order.')
    }
  }

  if (loading)
    return <div className='checkout-loading'>Loading Checkout...</div>

  return (
    <div className='page-wrapper'>
      <Navbar />
      <div className='checkout-container'>
        <h1 className='checkout-title'>Checkout</h1>

        <div className='checkout-layout'>
          {/* --- LEFT: Address & Payment --- */}
          <div className='checkout-left'>
            {/* Address Section */}
            <section className='checkout-section'>
              <div className='section-header'>
                <MapPin size={20} />
                <h2>Delivery Address</h2>
              </div>

              {addresses.length > 0 ? (
                <div className='address-list'>
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`address-card ${
                        selectedAddressId === addr.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    ><div className='display-address'>
                      <div className='address-radio'>
                        {selectedAddressId === addr.id && (
                          <div className='radio-dot'></div>
                        )}
                      </div>
                      <div className='address-info'>
                        <p>
                          <strong>{addr.full_name}</strong> ({addr.phone_number}
                          )
                        </p>
                        <p>{addr.street_address}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.postal_code}
                        </p>
                      </div>
                      </div>
                      <div>
                        <button className='icon-btn delete'onClick={() => handleDelete(addr.id)}><Trash2 size={18} /></button>
                      </div>
                       
                    </div>
                  ))}
                </div>
              ) : (
                !showAddressForm && (
                  <p className='no-address-msg'>
                    No address found. Please add one below.
                  </p>
                )
              )}

              {!showAddressForm && addresses.length >= 0 && (
                <button
                  className='add-address-btn'
                  onClick={() => setShowAddressForm(true)}
                >
                  <Plus size={16} /> Add New Address
                </button>
              )}
              {showAddressForm && (
                <form
                  className='new-address-form'
                  onSubmit={handleAddressSubmit}
                >
                  <h3>
                    {addresses.length === 0
                      ? 'Add Delivery Address'
                      : 'New Address'}
                  </h3>

                  <div className='form-row'>
                    <lable>Full Name:</lable>
                    <input
                      type='text'
                      placeholder='Full Name *'
                      required
                      value={newAddress.full_name}
                      onChange={e =>
                        setNewAddress({
                          ...newAddress,
                          full_name: e.target.value
                        })
                      }
                    />
                    <lable>Phone Number:</lable>
                    <input
                      type='tel'
                      placeholder='Phone Number *'
                      required
                      value={newAddress.phone_number}
                      onChange={e =>
                        setNewAddress({
                          ...newAddress,
                          phone_number: e.target.value
                        })
                      }
                    />
                  </div>
                  <lable>Street:</lable>
                  <input
                    type='text'
                    placeholder='Street Address (Area, Street, House No) *'
                    required
                    className='full-width-input'
                    value={newAddress.street_address}
                    onChange={e =>
                      setNewAddress({
                        ...newAddress,
                        street_address: e.target.value
                      })
                    }
                  />

                  <div className='form-row'>
                    <lable>City:</lable>
                    <input
                      type='text'
                      placeholder='City *'
                      required
                      value={newAddress.city}
                      onChange={e =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                    />
                    <lable>State:</lable>
                    <input
                      type='text'
                      placeholder='State *'
                      required
                      value={newAddress.state}
                      onChange={e =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                    />
                  </div>

                  <div className='form-row'>
                    <lable>Postal Code:</lable>
                    <input
                      type='text'
                      placeholder='Postal Code *'
                      required
                      value={newAddress.postal_code}
                      onChange={e =>
                        setNewAddress({
                          ...newAddress,
                          postal_code: e.target.value
                        })
                      }
                    />
                    <lable>Country:</lable>
                    <input
                      type='text'
                      placeholder='Country'
                      value={newAddress.country}
                      onChange={e =>
                        setNewAddress({
                          ...newAddress,
                          country: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className='form-actions'>
                    <button type='submit' className='save-btn'>
                      Save Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type='button'
                        className='cancel-btn'
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </section>

            {/* Payment Section */}
            <section className='checkout-section'>
              <div className='section-header'>
                <CreditCard size={20} />
                <h2>Payment Method</h2>
              </div>
              <div className='payment-options'>
                <label
                  className={`payment-option ${
                    paymentMethod === 'COD' ? 'active' : ''
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    value='COD'
                    checked={paymentMethod === 'COD'}
                    onChange={e => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label
                  className={`payment-option ${
                    paymentMethod === 'RAZORPAY' ? 'active' : ''
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    value='RAZORPAY'
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={e => setPaymentMethod(e.target.value)}
                  />
                  <span>RAZORPAY Payment</span>
                </label>
              </div>
            </section>
          </div>

          {/* --- RIGHT: Order Summary (Unchanged) --- */}
          <div className='checkout-right'>
            <div className='order-summary-card'>
              <h3>Order Summary</h3>

              <div className='summary-items'>
                {cart && cart.items && cart.items.length > 0 ? (
                  cart.items.map(item => (
                    <div key={item.id} className='summary-item'>
                      {item.product_details?.image && (
                        <img
                          src={item.product_details.image}
                          alt={item.product_details.name}
                        />
                      )}
                      <div className='item-info'>
                        <h4>{item.product_details?.name || 'Product Name'}</h4>
                        <p className='item-variant'>Qty: {item.quantity}</p>
                        <p className='item-price'>₹{item.subtotal}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='empty-summary'>No items in summary.</p>
                )}
              </div>

              <div className='summary-divider'></div>

              <div className='summary-totals'>
                <div className='total-row'>
                  <span>Subtotal</span>
                  <span>₹{cart?.total_price || 0}</span>
                </div>
                <div className='total-row'>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className='total-row grand-total'>
                  <span>Total</span>
                  <span>₹{cart?.total_price || 0}</span>
                </div>
              </div>
              {paymentMethod === 'COD' ? (
                <button
                  className='place-order-btn'
                  onClick={handlePlaceOrder}
                  disabled={!cart || !cart.items || cart.items.length === 0}
                >
                  Place Order <CheckCircle size={18} />
                </button>
              ) : (
                <PaymentButton
                  cartTotal={cart.total_price}
                  addressId={selectedAddressId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
