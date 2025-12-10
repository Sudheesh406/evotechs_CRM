// src/pages/home-page/adminSide/ViewOnlyPipelineDiagram.jsx (NEW FILE)
import React, { useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import axios from '../instance/Axios';

// --- Helper: Get initials for a placeholder avatar (KEEP from original) ---
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

// --- Data Transformation (KEEP from original, modified to remove 'selected: false' as it's not needed for view-only) ---
const transformPipelineData = (apiResponseData) => {
  if (!apiResponseData || !apiResponseData.data) {
    console.warn("Invalid pipeline data structure received.");
    return { nodes: [], edges: [] };
  }

  const reactFlowNodes = apiResponseData.data.nodes || [];
  const reactFlowEdges = apiResponseData.data.edges || [];

  // No need to explicitly set 'selected: false' in view-only mode, 
  // as node selection logic is removed. We'll rely on ReactFlow's defaults.
  return {
    nodes: reactFlowNodes,
    edges: reactFlowEdges,
  };
};

// --- Custom Node Component (KEEP from original, simplified styling to remove red selection border logic) ---
const CustomNode = ({ data }) => {
  // Determine professional colors based on type or provided color
  const baseColor = data.color || 'bg-white border-gray-300';
  const textColor = 'text-gray-800';
  const avatarColor = 'bg-gray-500';

  // Apply 'isPipe' (pipeline stage) specific styling
  const finalBaseColor = data.isPipe ? 'bg-indigo-50 border-indigo-400' : baseColor;
  const finalTextColor = data.isPipe ? 'text-indigo-800' : textColor;
  const finalAvatarColor = data.isPipe ? 'bg-indigo-600' : avatarColor;

  // Removed 'selected' prop and selectedStyle logic since it's view-only

  return (
    <div
      className={`p-3 rounded-xl shadow-lg transition duration-200 flex items-center text-sm font-semibold min-w-[180px] border ${finalBaseColor}`}
      style={{ minHeight: '50px' }}
    >
      {/* Handles are still included but are inactive in the 'ViewOnly' mode below */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-indigo-500 border-none" />

      {/* Profile/Icon Section */}
      <div className="flex-shrink-0 mr-3">
        {data.profileImage ? (
          <img
            src={data.profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow ${finalAvatarColor}`}
          >
            {getInitials(data.label)}
          </div>
        )}
      </div>

      {/* Label Section */}
      <div className={`flex-grow ${finalTextColor}`}>
        {data.label}
        {data.subLabel && <div className="text-xs font-normal text-gray-500">{data.subLabel}</div>}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-indigo-500 border-none" />
    </div>
  );
};

const nodeTypes = { customNode: CustomNode };

// --- View-Only Pipeline Component (NEW) ---
export default function ViewOnlyPipelineDiagram() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Function to fetch pipeline data
  const getPipelineData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('home/pipeline');
      const data = response.data;

      const { nodes: newNodes, edges: newEdges } = transformPipelineData(data.pipeline);

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      setNodes([]);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    getPipelineData();
  }, []);


  if (loading) return <p className="p-5 text-lg text-gray-600">Loading pipeline view...</p>;

  return (
    <div className="p-5 font-sans h-[70vh] w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Cluster Diagram
        </h1>
        {/* REMOVED: All interactive buttons */}
      </div>

      <div className="h-full border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{ style: { stroke: '#4f46e5', strokeWidth: 2 }, type: 'smoothstep', animated: true }}
          
          // ⭐ KEY CHANGES FOR VIEW-ONLY MODE ⭐
          // 1. Disable all change handlers
          onNodesChange={null} // Disable node dragging, selection, etc.
          onEdgesChange={null} // Disable edge removal, etc.
          onConnect={null} // Disable new connections
          onPaneClick={null} // Disable pane click handler

          // 2. Set 'pro' props to disable interactivity
          nodesDraggable={false} // Prevent nodes from being dragged
          nodesConnectable={false} // Prevent new edges
          elementsSelectable={false} // Prevent node/edge selection
          panOnDrag={true} // Allow panning (drag the background) - keep if wanted
          zoomOnScroll={true} // Allow zooming - keep if wanted
        >
          {/* Controls are useful for viewing, but we'll remove the interactive button */}
          <Controls showInteractive={false} className='shadow-lg' /> 
          <MiniMap nodeStrokeColor={(node) => node.data.isPipe ? '#4f46e5' : '#1f2937'} nodeColor="#ffffff" maskColor="#eef2ff" className='rounded-xl' />
          <Background variant="lines" gap={20} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>

    </div>
  );
}