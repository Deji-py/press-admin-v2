import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <InToolTable
        table_name="subscription_cancellation"
        excluded_columns={["user_id"]}
      />
    </div>
  );
}

export default page;
