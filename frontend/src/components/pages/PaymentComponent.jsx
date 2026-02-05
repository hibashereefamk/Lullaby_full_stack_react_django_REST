import { CheckCircle } from "lucide-react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/WishlistContext";
import { showAlert } from "../../utils/swal";
const PaymentButton = ({ cartTotal, addressId }) => {
    const navigate = useNavigate();
    const{fetchCart}=useShop()
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        // --- VALIDATION ---
        if (!addressId) {
            showAlert("Please select a delivery address.");
            return;
        }

        const res = await loadRazorpayScript();
        if (!res) {
            showAlert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            showAlert("Please login first!");
            return;
        }

        // --- FIX 1: Define config HERE, after getting the token ---
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        try {
            const rpresponse = await axios.post(
                'http://127.0.0.1:8000/api/payment/create-order/',
                { amount: cartTotal },
                config
            );

            const { order_id, amount, key, currency } = rpresponse.data;

            // Step E: Configure Razorpay Options
            const options = {
                key: key,
                amount: amount,
                currency: currency,
                name: "Lullaby Store",
                description: "Order Payment",
                order_id: order_id,

                handler: async function (response) {
                    console.log("Payment Successful!", response);
                    try {
                        
                        const orderData = {
                            address_id: addressId,           
                            payment_method: 'Online', 
                            payment_status: 'Success',     
                            transaction_id: response.razorpay_payment_id
                        };

                        // Save the actual order in Django
                        const orderRes = await axios.post(
                            "http://127.0.0.1:8000/api/orders/",
                            orderData,
                            config
                        );

                        if (orderRes.status === 201 || orderRes.status === 200) {
                            setTimeout(async () => {
            await fetchCart(); 
            navigate('/order-success');
        }, 100);
                        }
                    } catch (err) {
                        console.error("Order Creation Failed:", err);
                        showAlert("Payment successful, but order creation failed. Please contact support.");
                    }
                },

                prefill: {
                    name: "Customer",
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.on("payment.failed", function (response) {
                showAlert("Payment Failed: " + response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            showAlert("Something went wrong initiating the payment.");
        }
    };

    return (
        <button className="place-order-btn"
            onClick={handlePayment}
            disabled={!cartTotal || cartTotal <= 0}
        >
            Place Order <CheckCircle size={18} />
        </button>
    );
};

export default PaymentButton;