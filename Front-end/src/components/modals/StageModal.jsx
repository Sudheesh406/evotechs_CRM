import React from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const StageModal = ({
  stageModal,
  setStageModal,
  stage,
  handleTaskUpdate,
  fetchTasks,
}) => {
  if (!stageModal) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          onClick={() => {
            fetchTasks?.();
            setStageModal(false);
          }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Update <span className="text-green-600">Stage</span>
        </h2>

        {/* Progress Stage Circles */}
        <div className="flex justify-between items-center mb-6 relative">
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative flex flex-col items-center">
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold border-2 transition-all duration-300 ${
                  Number(stage) === s
                    ? "bg-green-500 border-green-500 text-white shadow-lg"
                    : s < Number(stage)
                    ? "bg-green-100 border-green-400 text-green-600"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {s < Number(stage) ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  s
                )}
              </div>

              {/* ✅ Correct way to render text */}
              <span className="text-xs mt-2 text-gray-500">
                {s === 1
                  ? "Not Started"
                  : s === 2
                  ? "In Progress"
                  : "Completed"}
              </span>
            </div>
          ))}

          {/* Connecting lines between circles */}
          <div className="absolute top-6 left-6 right-6 h-[2px] bg-gray-200 -z-10">
            <div
              className="h-[2px] bg-green-500 transition-all duration-500"
              style={{
                width:
                  stage === 1
                    ? "0%"
                    : stage === 2
                    ? "50%"
                    : stage === 3
                    ? "100%"
                    : "0%",
              }}
            ></div>
          </div>
        </div>

        {/* Current Stage Info */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-lg">
            Current stage:
            <span className="ml-2 text-green-600 font-bold">Stage {stage}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {/* Previous Button */}
          {stage > 1 ? (
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              onClick={() => handleTaskUpdate(Number(stage) - 1, false)}
            >
              <ChevronLeft size={18} /> Stage {Number(stage) - 1}
            </button>
          ) : (
            <div></div>
          )}

          {/* Next Button */}
          {stage < 3 ? (
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium shadow-md"
              onClick={() => handleTaskUpdate(Number(stage) + 1, true)}
            >
              Stage {Number(stage) + 1} <ChevronRight size={18} />
            </button>
          ) : (
            <p className="text-green-600 font-semibold text-sm flex items-center gap-1">
              <CheckCircle2 size={18} /> Final stage reached
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StageModal;
