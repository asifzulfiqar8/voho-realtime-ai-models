"use client";

import React, { useState, useEffect } from "react";
import { OrderDetailsData, OrderItem } from "@/lib/types";

function prepOrderDetails(orderDetailsData: string | object): OrderDetailsData {
  try {
    let parsed: any;
    // If it's a string, try to parse it; otherwise, assume it's already an object.
    if (typeof orderDetailsData === "string") {
      parsed = JSON.parse(orderDetailsData);
    } else {
      parsed = orderDetailsData;
    }

    let parsedItems: OrderItem[] | undefined;

    // Case 1: Parsed is an object with property "orderDetailsData" which is an array
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.orderDetailsData)
    ) {
      parsedItems = parsed.orderDetailsData;
    }
    // Case 2: Parsed is an object with property "items" which is an array
    else if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.items)
    ) {
      parsedItems = parsed.items;
    }
    // Case 3: Parsed itself is an array
    else if (Array.isArray(parsed)) {
      parsedItems = parsed;
    }

    // If we haven't found an array, include some debug info.
    if (!parsedItems) {
      throw new Error(
        "Parsed order details is not in a valid format: " +
          JSON.stringify(parsed)
      );
    }

    const totalAmount = parsedItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    const orderDetails: OrderDetailsData = {
      items: parsedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
    };

    return orderDetails;
  } catch (error) {
    throw new Error(`Failed to parse order details: ${error}`);
  }
}

const OrderDetails: React.FC = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsData>({
    items: [],
    totalAmount: 0,
  });

  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent<string | object>) => {
      try {
        const formattedData: OrderDetailsData = prepOrderDetails(event.detail);
        setOrderDetails(formattedData);
      } catch (error) {
        console.error(error);
      }
    };

    const handleCallEnded = () => {
      setOrderDetails({
        items: [],
        totalAmount: 0,
      });
    };

    window.addEventListener(
      "orderDetailsUpdated",
      handleOrderUpdate as EventListener
    );
    window.addEventListener("callEnded", handleCallEnded as EventListener);

    return () => {
      window.removeEventListener(
        "orderDetailsUpdated",
        handleOrderUpdate as EventListener
      );
      window.removeEventListener("callEnded", handleCallEnded as EventListener);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatOrderItem = (item: OrderItem, index: number) => (
    <div key={index} className="mb-2 pl-4 border-l-2 border-gray-200">
      <div className="flex justify-between items-center">
        <span className="font-medium">
          {item.quantity}x {item.name}
        </span>
        <span className="text-red-600">
          {formatCurrency(item.price * item.quantity)}
        </span>
      </div>
      {item.specialInstructions && (
        <div className="text-sm text-black italic mt-1">
          Note: {item.specialInstructions}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-4">
      <div className="rounded">
        <div className="mb-4">
          <span className="text-black mb-2 block">Items:</span>
          {orderDetails.items.length > 0 ? (
            orderDetails.items.map((item, index) =>
              formatOrderItem(item, index)
            )
          ) : (
            <span className="text-black text-base">No items</span>
          )}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center font-semibold">
            <span className="text-black">Total</span>
            <span className="text-red-600">
              {formatCurrency(orderDetails.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
