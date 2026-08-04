import React, { useState } from "react";
import axios from "axios";

export default function RazorpayTest() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "Anshita",
    email: "anshita.varyani@mypageseo.com",
    mobile: "9315411055",
    plan_id: "6a3d25afbd03464dc4689c45",
    coupon_code: "MPSXU0S72L5",
  });

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const payNow = async () => {
    try {
      setLoading(true);

      const sdkLoaded = await loadRazorpay();

      if (!sdkLoaded) {
        alert("Unable to load Razorpay");
        return;
      }

      console.log("Creating Order...");

      const { data } = await axios.post(
        "https://node.mypageseo.com/conf/api/v1/subscription/create-order",
        form
      );

      console.log("CREATE ORDER RESPONSE");
      console.log(data);

      const order = data.data;

      const options = {
        key: order.key,

        order_id: order.order_id,

        amount: order.amount,

        currency: order.currency,

        name: "My Page SEO",

        description: "Setup Fee",

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.mobile,
        },

        theme: {
          color: "#3399cc",
        },

        modal: {
          ondismiss() {
            console.log("Checkout Closed");
          },
        },

        handler(response) {
          console.log("=================================");
          console.log("PAYMENT SUCCESS");
          console.log(response);
          console.log("=================================");

          alert(
            "Payment Successful!\n\nNow check:\n\n1. Backend Logs\n2. MongoDB Payment\n3. User Table\n4. Razorpay Subscription Dashboard"
          );
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("PAYMENT FAILED");

        console.log(response.error);

        alert("Payment Failed");
      });

      razorpay.open();
    } catch (err) {
      console.log(err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "50px auto",
        padding: 30,
        border: "1px solid #ddd",
        borderRadius: 10,
      }}
    >
      <h2>Subscription Test</h2>

      <input
        style={{ width: "100%", marginBottom: 15 }}
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <input
        style={{ width: "100%", marginBottom: 15 }}
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <input
        style={{ width: "100%", marginBottom: 15 }}
        placeholder="Mobile"
        value={form.mobile}
        onChange={(e) =>
          setForm({
            ...form,
            mobile: e.target.value,
          })
        }
      />

      <input
        style={{ width: "100%", marginBottom: 15 }}
        placeholder="Plan ID"
        value={form.plan_id}
        onChange={(e) =>
          setForm({
            ...form,
            plan_id: e.target.value,
          })
        }
      />

      <input
        style={{ width: "100%", marginBottom: 25 }}
        placeholder="Coupon Code (Optional)"
        value={form.coupon_code}
        onChange={(e) =>
          setForm({
            ...form,
            coupon_code: e.target.value,
          })
        }
      />

      <button
        disabled={loading}
        onClick={payNow}
        style={{
          width: "100%",
          height: 45,
          background: "#3399cc",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {loading ? "Please Wait..." : "Pay Setup Fee"}
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h3>After Successful Payment Verify:</h3>

      <ul>
        <li>✅ Order created in Razorpay</li>
        <li>✅ Payment successful</li>
        <li>✅ payment.captured webhook received</li>
        <li>✅ User created (if new)</li>
        <li>✅ Profile created</li>
        <li>✅ Coupon marked used</li>
        <li>✅ Payment saved in MongoDB</li>
        <li>✅ razorpay_payment_id saved</li>
        <li>✅ razorpay_subscription_id saved</li>
        <li>✅ Subscription appears under Razorpay → Subscriptions</li>
      </ul>
    </div>
  );
}