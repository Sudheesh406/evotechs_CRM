import React from "react";

const stages = [
  {
    name: "Qualification",
    deals: [
      {
        dealName: "Benton (Sample)",
        account: "Benton",
        owner: "Sudheesh Kumar",
        contact: "John Butt (Sample)",
        amount: "$250,000.00",
        closingDate: "14/08/2025",
        probability: "10%",
      },
    ],
  },
  {
    name: "Needs Analysis",
    deals: [
      {
        dealName: "Truhlar And Truhlar (Sample)",
        account: "Truhlar And Truhlar Attys",
        owner: "Sudheesh Kumar",
        contact: "Sage Wieser (Sample)",
        amount: "$45,000.00",
        closingDate: "14/08/2025",
        probability: "20%",
      },
      {
        dealName: "Chanay (Sample)",
        account: "Chanay",
        owner: "Sudheesh Kumar",
        contact: "Josephine Darakjy (Sample)",
        amount: "$55,000.00",
        closingDate: "15/08/2025",
        probability: "20%",
      },
    ],
  },
  {
    name: "Value Proposition",
    deals: [
      {
        dealName: "Chemel (Sample)",
        account: "Chemel",
        owner: "Sudheesh Kumar",
        contact: "James Venere (Sample)",
        amount: "$70,000.00",
        closingDate: "14/08/2025",
        probability: "40%",
      },
    ],
  },
  {
    name: "Identify Decision Makers",
    deals: [
      {
        dealName: "King (Sample)",
        account: "King",
        owner: "Sudheesh Kumar",
        contact: "Kris Marrier (Sample)",
        amount: "$60,000.00",
        closingDate: "16/08/2025",
        probability: "60%",
      },
      {
        dealName: "Feltz Printing Service (Sample)",
        account: "Feltz Printing Service",
        owner: "Sudheesh Kumar",
        contact: "Capla Paprocki (Sample)",
        amount: "$45,000.00",
        closingDate: "17/08/2025",
        probability: "60%",
      },
    ],
  },
];

const stageColors = {
  Qualification: "bg-blue-100",
  "Needs Analysis": "bg-yellow-100",
  "Value Proposition": "bg-green-100",
  "Identify Decision Makers": "bg-purple-100",
};

const DealsKanban = () => {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-[680px]">
      <h1 className="text-2xl font-semibold mb-4">Deals</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.name}>
            <h2 className="font-semibold mb-2">{stage.name}</h2>
            <div className="space-y-4">
              {stage.deals.map((deal, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded shadow ${stageColors[stage.name]}`}
                >
                  <h3 className="font-semibold">{deal.dealName}</h3>
                  <p className="text-sm text-gray-600">{deal.account}</p>
                  <p className="text-sm text-gray-600">Owner: {deal.owner}</p>
                  <p className="text-sm text-gray-600">Contact: {deal.contact}</p>
                  <p className="text-sm text-gray-600">Amount: {deal.amount}</p>
                  <p className="text-sm text-gray-600">Closing: {deal.closingDate}</p>
                  <p className="text-sm text-gray-600">Probability: {deal.probability}</p>
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
