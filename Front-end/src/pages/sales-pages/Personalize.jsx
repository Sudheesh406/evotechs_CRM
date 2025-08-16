import React, { useState } from "react";

export default function Personalize() {
  const [lists, setLists] = useState([
    { title: "PNGP", items: ["Item 1", "Item 2"] },
    { title: "MUDRA", items: ["Item A", "Item B"] },
  ]);

  const addList = () => {
    const newTitle = prompt("Enter List Title");
    if (newTitle) {
      setLists([...lists, { title: newTitle, items: [] }]);
    }
  };

  const addItem = (listIndex) => {
    const newItem = prompt("Enter Item");
    if (newItem) {
      const updatedLists = [...lists];
      updatedLists[listIndex].items.push(newItem);
      setLists(updatedLists);
    }
  };

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Requirements</h1>
        <button
          onClick={addList}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
        >
          + Create List
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {lists.map((list, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md p-4 flex flex-col"
          >
            <h2 className="text-base font-medium mb-3 flex justify-between items-center">
              {list.title}
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                {list.items.length}
              </span>
            </h2>
            <div className="space-y-2 flex-1">
              {list.items.length > 0 ? (
                list.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border rounded-md px-3 py-2 text-sm"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No Items</p>
              )}
            </div>
            <button
              onClick={() => addItem(idx)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              + Add Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
