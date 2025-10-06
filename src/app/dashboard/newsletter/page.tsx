import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <InToolTable
        table_name="newsletter_subscriptions"
        excluded_columns={[
          "created_at",
          "user_id",
          "percent_off",
          "plan_id",
          "metadata",
        ]}
      />
    </div>
  );
}

export default page;
