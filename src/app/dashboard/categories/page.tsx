import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InToolTable
          table_name="categories"
          excluded_columns={["updated_at"]}
        />
        <InToolTable
          table_name="industries"
          excluded_columns={["updated_at"]}
        />
      </div>
    </div>
  );
}

export default page;
