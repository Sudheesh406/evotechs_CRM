import { useEffect, useState } from "react";
import axios from "../../instance/Axios";

function DocumentModal({ taskId, onClose ,setRefresh, refresh}) {
  const [projectName, setProjectName] = useState("");
  const [document, setDocument] = useState({});
  const [dataList, setDataList] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log(taskId)

  useEffect(() => {
    if (!taskId) return;

    const fetchDocuments = async () => {
      try {
        const res = await axios.get(`/document/get/${taskId}`);
        const result = res.data.result;

        setDocument(result.documentDetails || {});
        setProjectName(result.projectName || "");
        setDataList(result.data || []);

        if (result.documentDetails && Array.isArray(result.documentDetails.requirements)) {
          setCheckedItems(result.documentDetails.requirements);
        } else {
          setCheckedItems([]);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };

    fetchDocuments();
  }, [taskId]);

  const handleCheckboxChange = (item) => {
    setCheckedItems((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`/document/post/${taskId}`, {
        description: document.description,
        url: document.url,
        requirements: checkedItems,
        documentId : document.id
      });
      console.log("Saved:", { description: document.description, url: document.url, requirements: checkedItems });
      onClose();
      if(refresh == false){
        setRefresh(true)
      }else{
        
        setRefresh(false)
      }
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Failed to save changes!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl w-[420px] p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Document Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors text-xl font-semibold"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <p>
            <span className="font-semibold text-gray-700">Project:</span>{" "}
            <span className="text-gray-800">{projectName || "—"}</span>
          </p>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">Description:</label>
            <textarea
              value={document.description || ""}
              onChange={(e) => setDocument({ ...document, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">URL:</label>
            <input
              type="text"
              value={document.url || ""}
              onChange={(e) => setDocument({ ...document, url: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="max-h-40 overflow-y-auto bg-white/70 rounded-lg p-3 border border-gray-100 shadow-inner">
          {dataList.length > 0 ? (
            <ul className="space-y-2">
              {dataList.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 transition rounded-md p-2"
                >
                  <input
                    type="checkbox"
                    checked={checkedItems.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <label className="text-gray-700">{item}</label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-3">No data available</p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md transition"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentModal;
