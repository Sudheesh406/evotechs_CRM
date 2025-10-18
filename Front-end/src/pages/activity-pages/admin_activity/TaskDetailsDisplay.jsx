import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../../../instance/Axios'

const TaskDetailsDisplay = () => {
  // Data for the card (you can pass this as props in a real app)

  const [setTaskData, taskData] = useState()
  const [setCurrentStage, currentStage] = useState()

  const {data} = useParams()

  const caseData = {
    customerName: 'greeshma',
    title: 'salary slip has a delay.',
    stage: 1,
    finishBy: '2025-10-21',
    amount: '2000.00',
    phone: '7895641235',
    priority: 'Normal',
    description: 'customer name greeshma. home loan. pathanamthitta',
  };

    let parsed = null;
  if (data) {
    try {
      parsed = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error("Could not parse data:", e);
    }
  }

   const getTaskDetails = async () => {
    if (!parsed) return;
    try {
      const response = await axios.post("task/status/get", { parsed });
      if (response.data.success) {
        setTaskData(response.data.data);
        setCurrentStage(response.data.data.taskDetails?.[0]?.stage || 0);
        console.log('response',response)
      }
    } catch (error) {
      console.error("Error in get task details", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(()=>{
    getTaskDetails()
  },[])

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {/* Header with Back Button */}
      <div className="flex justify-end mb-4">
        <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          {/* Using a simple arrow for the back icon */}
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Card Component - Exact Design Match */}
        <div className="max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Card Title/Status */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Not Started
            </h2>
          </div>

          {/* Main Card Content */}
          <div className="p-4">
            {/* Customer Header Section */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                {/* Initial/Avatar */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white text-lg font-medium mr-3">
                  G
                </div>
                <div>
                  <div className="text-gray-900 font-semibold leading-none capitalize">
                    {caseData.customerName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {caseData.title}
                  </div>
                </div>
              </div>
              {/* Three Dots Menu */}
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            
            {/* Horizontal Separator */}
            <div className="border-t border-gray-100 mb-4"></div>
            
            {/* Details Section (Stage, Finish By, Amount, Phone, Priority) */}
            <div className="space-y-3 text-sm">
              
              {/* Stage */}
              <div className="flex justify-between">
                <span className="text-gray-600">Stage</span>
                <span className="font-medium text-gray-900">{caseData.stage}</span>
              </div>

              {/* Finish By */}
              <div className="flex justify-between">
                <span className="text-gray-600">Finish By</span>
                <span className="font-medium text-gray-900">
                  {caseData.finishBy}
                </span>
              </div>

              {/* Amount */}
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">
                {caseData.amount}
                </span>
              </div>

              {/* Phone */}
              <div className="flex justify-between">
                <span className="text-gray-600">Phone</span>
                <span className="font-medium text-green-600">
                  {caseData.phone}
                </span>
              </div>

              {/* Priority */}
              <div className="flex justify-between">
                <span className="text-gray-600">Priority</span>
                <span className="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  {caseData.priority}
                </span>
              </div>
            </div>

            {/* Horizontal Separator */}
            <div className="border-t border-gray-100 my-4"></div>

            {/* Description Section */}
            <div>
              <div className="text-gray-600 mb-1 text-sm">Description:</div>
              <p className="text-gray-800 text-sm whitespace-pre-line">
                {caseData.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsDisplay;