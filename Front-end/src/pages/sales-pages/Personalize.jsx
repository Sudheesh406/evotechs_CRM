import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";

export default function Personalize() {
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newItems, setNewItems] = useState([""]);
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [formErrors, setFormErrors] = useState({ title: "", items: [], general: "" });
  const [originalData, setOriginalData] = useState({ title: "", items: [] }); // store original data

  const addItemField = () => setNewItems([...newItems, ""]);

  const handleItemChange = (index, value) => {
    const updatedItems = [...newItems];
    updatedItems[index] = value;
    setNewItems(updatedItems);

    const updatedErrors = { ...formErrors };
    updatedErrors.items[index] = "";
    updatedErrors.general = "";
    setFormErrors(updatedErrors);
  };

  const handleEditClick = (list) => {
    setEditingId(list.id);
    setNewListTitle(list.project);
    setNewItems(list.data.length > 0 ? list.data : [""]);
    setOriginalData({ title: list.project, items: list.data.length > 0 ? list.data : [""] });
    setFormErrors({ title: "", items: [], general: "" });
    setShowModal(true);
    setMenuOpenId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this list?")) return;
    try {
      const response = await axios.delete(`/requirement/delete/${id}`);
      console.log(response)
      if(response){

        setLists(lists.filter((list) => list.id !== id));
      }
    } catch (error) {
      console.log("Error deleting requirement:", error);
    }
  };

  const handleSubmit = async () => {
    let errors = { title: "", items: [], general: "" };
    let hasError = false;

    if (!newListTitle.trim()) {
      errors.title = "Title is required";
      hasError = true;
    }

    const trimmedItems = newItems.map((item) => item.trim());
    errors.items = trimmedItems.map((item) => (item === "" ? "Item is required" : ""));
    if (errors.items.some((e) => e !== "")) hasError = true;

    // Check for changes only if editing
    if (editingId && !hasError) {
      const titleUnchanged = newListTitle.trim() === originalData.title.trim();
      const itemsUnchanged =
        trimmedItems.length === originalData.items.length &&
        trimmedItems.every((item, idx) => item === originalData.items[idx]);

      if (titleUnchanged && itemsUnchanged) {
        errors.general = "No changes detected";
        hasError = true;
      }
    }

    setFormErrors(errors);
    if (hasError) return;

    const validItems = trimmedItems.filter((item) => item !== "");
    const data = { project: newListTitle, data: validItems };

    try {
      if (editingId) {
        const response = await axios.put(`/requirement/edit/${editingId}`, data);
        setLists(lists.map((list) => (list.id === editingId ? response.data.data : list)));
      } else {
        const response = await axios.post("/requirement/create", data);
        console.log(response)
       setLists([...lists, response.data.data]);
      }

      // Reset modal
      setShowModal(false);
      setNewListTitle("");
      setNewItems([""]);
      setEditingId(null);
      setOriginalData({ title: "", items: [] });
      setFormErrors({ title: "", items: [], general: "" });
    } catch (error) {
      console.log("Error in handleSubmit:", error);
    }
  };

  const getRequirements = async () => {
    try {
      const response = await axios.get("/requirement/get");
      if (response.data.success && response.data.data) {
        setLists(response.data.data);
      }
    } catch (error) {
      console.log("Error in getRequirements:", error);
    }
  };

  useEffect(() => {
    getRequirements();
  }, []);

  return (
    <div className="p-6 bg-gray-50 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Requirements</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700"
        >
          + Create List
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {lists.length > 0 ? (
          lists.map((list) =>
            list && list.project ? (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col relative"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-medium">{list.project}</h2>
                  <div className="gap-4 flex items-center">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {list.data ? list.data.length : 0}
                    </span>
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === list.id ? null : list.id)
                      }
                      className="ml-2 text-gray-400 hover:text-gray-700"
                    >
                      ⋮
                    </button>
                    {menuOpenId === list.id && (
                      <div className="absolute top-8 right-2 bg-white border rounded shadow-md z-50">
                        <button
                          onClick={() => handleEditClick(list)}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(list.id)}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 w-full text-left"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {list.data && list.data.length > 0 ? (
                    list.data.map((item, i) => (
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
              </div>
            ) : null
          )
        ) : (
          <p className="text-gray-500 col-span-4 text-center">
            No requirements found
          </p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
                setFormErrors({ title: "", items: [], general: "" });
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 hover:bg-gray-300 w-[24px]"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit List" : "Create New List"}
            </h2>

            {formErrors.general && (
              <p className="text-red-500 text-sm mb-2">{formErrors.general}</p>
            )}

            <input
              type="text"
              placeholder="List Title"
              value={newListTitle}
              onChange={(e) => {
                setNewListTitle(e.target.value);
                setFormErrors({ ...formErrors, title: "", general: "" });
              }}
              className="w-full border rounded px-3 py-2 mb-1"
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mb-2">{formErrors.title}</p>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {newItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center flex-col">
                  <div className="flex w-full gap-2 items-center">
                    <input
                      type="text"
                      placeholder={`Item ${idx + 1}`}
                      value={item}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      className="flex-1 border rounded px-3 py-2"
                    />
                    {idx === newItems.length - 1 && (
                      <button
                        type="button"
                        onClick={addItemField}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        +
                      </button>
                    )}
                  </div>
                  {formErrors.items[idx] && (
                    <p className="text-red-500 text-sm mt-1 w-full">
                      {formErrors.items[idx]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                  setFormErrors({ title: "", items: [], general: "" });
                }}
                className="px-4 py-2 rounded border hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
