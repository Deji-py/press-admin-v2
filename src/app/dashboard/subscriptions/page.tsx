import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <InToolTable
        table_name="subscriptions"
        excluded_columns={[
          "updated_at",
          "created_at",
          "razorpay_payment_id",
          "user_id",
          "plan_id",
          "razorpay_subscription_id",
          "subscription_id",
        ]}
      />
    </div>
  );
}

export default page;
