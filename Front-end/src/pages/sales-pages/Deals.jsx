import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";

const stageColors = {
  Qualification: "bg-blue-100",
  "Needs Analysis": "bg-yellow-100",
  "Value Proposition": "bg-green-100",
  "Identify Decision Makers": "bg-purple-100",
};

// Utility to group deals by stage
const groupByStage = (deals) => {
  const grouped = {};
  deals.forEach((deal) => {
    const stageName = stageNameFromId(deal.stage); // convert "1" → "Qualification"
    if (!grouped[stageName]) grouped[stageName] = [];
    grouped[stageName].push(deal);
  });
  return grouped;
};

// Map your stage IDs to readable names
const stageNameFromId = (stage) => {
  switch (stage) {
    case "1":
      return "Qualification";
    case "2":
      return "Needs Analysis";
    case "3":
      return "Value Proposition";
    case "4":
      return "Identify Decision Makers";
    default:
      return "Other";
  }
};

const DealsKanban = () => {
  const [dealsByStage, setDealsByStage] = useState({});

  const fetchDeals = async () => {
    try {
      const response = await axios.get("/deals/get");
      // response.data.data is your deals array
      const deals = response.data.data;
      const grouped = groupByStage(deals);
      setDealsByStage(grouped);
    } catch (error) {
      console.log("error found in fetching deals", error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-[680px]">
      <h1 className="text-2xl font-semibold mb-4">Deals</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(dealsByStage).map(([stageName, deals]) => (
          <div key={stageName}>
            <h2 className="font-semibold mb-2">{stageName}</h2>
            <div className="space-y-4">
              {deals.map((deal, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded shadow ${
                    stageColors[stageName] || "bg-gray-100"
                  }`}
                >
                  {/* Requirement name as main heading */}
                  <h3 className="font-semibold">{deal.requirement}</h3>

                  {/* Contact name */}
                  <p className="text-sm text-gray-600">
                    Contact: {deal.customer?.name || ""}
                  </p>

                  {/* Amount */}
                  <p className="text-sm text-gray-600">
                    Amount: {deal.customer?.amount || ""}
                  </p>

                  {/* Phone */}
                  <p className="text-sm text-gray-600">
                    Phone: {deal.customer?.phone || ""}
                  </p>

                  {/* Finish By (closing date) */}
                  <p className="text-sm text-gray-600">
                    Date:{" "}
                    {deal.finishBy
                      ? new Date(deal.finishBy).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsKanban;
