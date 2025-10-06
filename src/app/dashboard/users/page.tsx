import InToolTable from "@/components/core/InToolTable/intool-table";
import React from "react";

function page() {
  return (
    <div className="p-5">
      <InToolTable
        table_name="users"
        excluded_columns={[
          "user_id",
          "role",
          "location",
          "website_url",
          "social_media",
        ]}
      />
    </div>
  );
}

export default page;
