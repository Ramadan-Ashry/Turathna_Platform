import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from "../../Context/CartContext";
import { TokenContext } from "../../Context/TokenContext";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, clearCart, cartTotal } = useCart();
  const { token } = useContext(TokenContext);

  const { shippingInfo } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isLoading, setIsLoading] = useState(false);
  const [userFullName, setUserFullName] = useState("مستخدم");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const shippingFee = 50; // ✅ أضفنا مصاريف الشحن

  useEffect(() => {
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const userData = JSON.parse(jsonPayload);

        const userId = userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        if (userId) {
          setUserId(userId);
        }

        const email = userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                      userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email'];
        if (email) {
          setUserEmail(email);
        }

        const name = userData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'مستخدم';
        setUserFullName(name);
      } catch (e) {
        console.error('Error parsing JWT:', e);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`https://ourheritage.runasp.net/api/Users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });

        if (!response.ok) throw new Error(`فشل جلب بيانات المستخدم: ${response.status}`);

        const userDetails = await response.json();
        const fullName = userDetails.fullName ||
          (userDetails.firstName && userDetails.lastName
            ? `${userDetails.firstName} ${userDetails.lastName}`
            : null);
        setUserFullName(fullName || 'مستخدم');
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const createOrder = async (paymentType) => {
    setIsLoading(true);

    try {
      if (!token) throw new Error('لم يتم العثور على رمز الدخول');
      if (!shippingInfo || !shippingInfo.city || !shippingInfo.phone) throw new Error('بيانات الشحن غير مكتملة');
      if (!cartItems || cartItems.length === 0) throw new Error('لا توجد منتجات في السلة');

      const orderData = {
        userId: userId ? parseInt(userId) : 0,
        fullName: userFullName,
        shippingAddress: `${shippingInfo.city}, ${shippingInfo.phone}`,
        stripePaymentIntentId: paymentType === 'online' ? 'stripe_' + Date.now() : 'cash',
        paymentMethod: paymentType,
        totalAmount: cartTotal + shippingFee, // ✅ إجمالي شامل الشحن
        items: cartItems.map(item => ({
          handiCraftId: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('https://ourheritage.runasp.net/api/Orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء إنشاء الطلب');
      }

      const result = await response.json();

      if (result.isSucceeded) {
        clearCart();
        navigate('/order-success');
      } else {
        throw new Error(result.message || 'فشل إنشاء الطلب');
      }
    } catch (error) {
      alert(`خطأ: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-1 mt-32">
      <div className="flex-1 flex justify-center">
        <div className="mb-6 text-center">
           <h1 className="text-3xl font-bold text-[#a67c52] mb-6 text-center">
  {userFullName}
</h1>
<p className="text-center text-gray-600 mb-4">
  <span className="text-xl">{shippingInfo?.city}</span>,{" "}
  <span className="text-base">{shippingInfo?.phone}</span>
</p>



          <p className="text-4xl font-bold text-gray-800 mt-12">
            EGP {(cartTotal + shippingFee).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white px-8 py-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex-1 py-2 rounded-md ${paymentMethod === "online" ? "bg-[#a67c52] text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Pay Online
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 py-2 rounded-md ${paymentMethod === "cash" ? "bg-[#a67c52] text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Pay Cash
              </button>
            </div>
          </div>

          {paymentMethod === "online" ? (
            <>
              <div className="mb-6">
                <a href="#" className="text-lg font-semibold mb-2">Pay with link</a>
                <p className="text-sm text-gray-600 mb-4">- Or pay with card</p>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
                  <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-1/4 mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder name</label>
                  <input
                    type="text"
                    placeholder="Full name on card"
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                className="w-full bg-[#a67c52] text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => createOrder('online')}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? 'جاري المعالجة...' : 'Pay Online'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-lg font-semibold mb-2">Pay with Cash</p>
                <p className="text-sm text-gray-600 mb-4">Please prepare the exact amount for delivery.</p>
              </div>

              <button
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                onClick={() => createOrder('cash')}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? 'جاري المعالجة...' : 'Confirm Cash Payment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
