import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QxNeVPxhhblVf3ZmWO198WLC3tIigwxnrDsxir3DylYo95RqwNOBqF0Me6IcQDcU8xAeWtU7zbnLs6NsBp36d8p00xHX3jHT4",
);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [businessCardId, setBusinessCardId] = useState("226");
  const [addressId] = useState(48);
  const [purchaseType, setPurchaseType] = useState("NFC_ONLY");

  const SHIPPING = {
    carrier: "USPS",
    service: "Ground Advantage",
    shippingAmount: 5.17,
    setupFee: 39.99,
    monthlyFee: 4.99,
  };

  const showShipping =
    purchaseType === "NFC_ONLY" ||
    purchaseType === "NFC_WITH_SUBSCRIPTION";

  const total =
    purchaseType === "NFC_ONLY"
      ? SHIPPING.setupFee + SHIPPING.shippingAmount
      : purchaseType === "SUBSCRIPTION_ONLY"
        ? SHIPPING.monthlyFee
        : SHIPPING.setupFee +
          SHIPPING.monthlyFee +
          SHIPPING.shippingAmount;

  const handlePayment = async () => {
    try {
      if (!stripe || !elements) {
        alert("Stripe not loaded");
        return;
      }

      setLoading(true);

      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjI5MiwiaWF0IjoxNzg1MzAyMzM3LCJleHAiOjE3ODU5MDcxMzcsInR5cGUiOiJhY2Nlc3MiLCJyb2xlX2lkIjo3fQ.qZf6LV-KHo_yfV3012jivfLeSbZUAsDWBWT4iC4MP-4";

      const response = await fetch(
        "https://node.glamlink.net/api/v1/businessCard/create-subscription-public",
        {
          method: "POST",
          headers: {
            // "x-access-token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_card_id: Number(businessCardId),
            // purchase_type: purchaseType,
            // address_id: addressId,
          }),
        },
      );

      const result = await response.json();

      console.log("API Response:", result);

      if (!result.success) {
        alert(result.message);
        return;
      }

      const card = elements.getElement(CardElement);

      const paymentResult = await stripe.confirmCardPayment(
        result.data.clientSecret,
        {
          payment_method: {
            card,
          },
        },
      );

      console.log(paymentResult);

      if (paymentResult.error) {
        alert(paymentResult.error.message);
        return;
      }

      if (
        paymentResult.paymentIntent &&
        paymentResult.paymentIntent.status === "succeeded"
      ) {
        alert("✅ Payment Successful");
      } else {
        alert("Payment Processing...");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "50px auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 10,
      }}
    >
      <h2>Business Card Payment Test</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Business Card ID</label>

        <input
          type="number"
          value={businessCardId}
          onChange={(e) => setBusinessCardId(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 5,
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label>Purchase Type</label>

        <select
          value={purchaseType}
          onChange={(e) => setPurchaseType(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 5,
          }}
        >
          <option value="NFC_ONLY">NFC Only</option>
          <option value="SUBSCRIPTION_ONLY">
            Subscription Only
          </option>
          <option value="NFC_WITH_SUBSCRIPTION">
            NFC + Subscription
          </option>
        </select>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: 15,
          background: "#f8f8f8",
          borderRadius: 8,
          border: "1px solid #ddd",
        }}
      >
        <div>
          <strong>Business Card:</strong> {businessCardId}
        </div>

        <div>
          <strong>Purchase Type:</strong> {purchaseType}
        </div>

        {showShipping && (
          <>
            <hr />

            <div>
              <strong>Address ID:</strong> {addressId}
            </div>

            <div>
              <strong>Carrier:</strong> {SHIPPING.carrier}
            </div>

            <div>
              <strong>Service:</strong> {SHIPPING.service}
            </div>

            <div>
              <strong>Shipping:</strong> $
              {SHIPPING.shippingAmount.toFixed(2)}
            </div>
          </>
        )}

        <hr />

        {purchaseType !== "SUBSCRIPTION_ONLY" && (
          <div>
            NFC Card: ${SHIPPING.setupFee.toFixed(2)}
          </div>
        )}

        {purchaseType !== "NFC_ONLY" && (
          <div>
            Subscription: ${SHIPPING.monthlyFee.toFixed(2)}
          </div>
        )}

        {showShipping && (
          <div>
            Shipping: ${SHIPPING.shippingAmount.toFixed(2)}
          </div>
        )}

        <hr />

        <div
          style={{
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Total Today: ${total.toFixed(2)}
        </div>
      </div>

      <div
        style={{
          padding: 15,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <CardElement
          options={{
            hidePostalCode: false,
          }}
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !stripe}
        style={{
          width: "100%",
          padding: 14,
          background: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay"}
      </button>
    </div>
  );
}

export default function TestBusinessCardPayment() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}