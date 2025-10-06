import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <InToolTable
        table_name="packages"
        excluded_columns={["created_at", "user_id"]}
      />
    </div>
  );
}

export default page;
