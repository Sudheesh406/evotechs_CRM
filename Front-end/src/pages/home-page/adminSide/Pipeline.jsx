// src/pages/home-page/adminSide/Pipeline.jsx
import React, { useCallback, useEffect } from 'react';
import Swal from "sweetalert2";

import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import axios from '../../../instance/Axios';

// --- Helper: Get initials for a placeholder avatar (KEEP) ---
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};


const transformPipelineData = (apiResponseData) => {
  if (!apiResponseData || !apiResponseData.data) {
    console.warn("Invalid pipeline data structure received.");
    return { nodes: [], edges: [] };
  }

  // Your fetched data structure is: pipeline: { data: { nodes: [...], edges: [...] } }
  const reactFlowNodes = apiResponseData.data.nodes || [];
  const reactFlowEdges = apiResponseData.data.edges || [];

  // ✅ MODIFICATION: Ensure all nodes are deselected upon load
  const cleanedNodes = reactFlowNodes.map(node => ({
    ...node,
    selected: false, // Explicitly set selected to false to prevent initial red border
  }));

  return {
    nodes: cleanedNodes,
    edges: reactFlowEdges,
  };
};

// --- Helper: Find Node ID by Label (Case-Insensitive Match) (KEEP) ---
const findNodeIdByLabel = (nodes, searchString) => {
  if (!searchString) return null;
  const searchLower = searchString.trim().toLowerCase();

  // Attempt to match against data.label, data.subLabel, or id
  const foundNode = nodes.find(n => {
    if (!n.data) return false;

    // 1. Check for exact ID match
    const idMatch = n.id.toLowerCase() === searchLower;
    if (idMatch) return true;

    // 2. Check for partial label match (Name)
    const labelMatch = n.data.label && n.data.label.toLowerCase().includes(searchLower);
    if (labelMatch) return true;

    // 3. Check for partial subLabel match (Email/Detail)
    const subLabelMatch = n.data.subLabel && n.data.subLabel.toLowerCase().includes(searchLower);
    if (subLabelMatch) return true;

    return false;
  });

  return foundNode ? foundNode.id : null;
};


// --- Custom Node Component (KEEP) ---
const CustomNode = ({ data, selected }) => {
  // Determine professional colors based on type or provided color
  // Default (Normal) Colors
  const baseColor = data.color || 'bg-white border-gray-300';
  const textColor = 'text-gray-800';
  const avatarColor = 'bg-gray-500';

  // Apply 'isPipe' (pipeline stage) specific styling if the flag is true
  const finalBaseColor = data.isPipe ? 'bg-indigo-50 border-indigo-400' : baseColor;
  const finalTextColor = data.isPipe ? 'text-indigo-800' : textColor;
  const finalAvatarColor = data.isPipe ? 'bg-indigo-600' : avatarColor;

  // Apply a selection border style for visual feedback
  // This uses the 'selected' prop provided by ReactFlow
  const selectedStyle = selected ? 'ring-2 ring-red-500 ring-offset-2 border-red-500' : '';

  return (
    <div
      className={`p-3 rounded-xl shadow-lg transition duration-200 hover:shadow-xl flex items-center text-sm font-semibold min-w-[180px] border ${finalBaseColor} ${selectedStyle}`}
      style={{ minHeight: '50px' }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-indigo-500 border-none" />

      {/* Profile/Icon Section */}
      <div className="flex-shrink-0 mr-3">
        {data.profileImage ? (
          // Placeholder for actual image
          <img
            src={data.profileImage}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          // Initial-based Avatar Placeholder
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

// --- Main Pipeline Component ---
export default function PipelineDiagram() {
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  // ❌ REMOVED: const [nodeCount, setNodeCount] = React.useState(0); // This was causing the issue
  // State to track the node selected for removal
  const [selectedNodeId, setSelectedNodeId] = React.useState(null);


  // ✅ CORRECTION APPLIED HERE: Updated onNodesChange to reliably track selection state
  const onNodesChange = useCallback((changes) => {
    // 1. Apply changes first (Standard ReactFlow requirement)
    setNodes((nds) => applyNodeChanges(changes, nds));

    // 2. Determine the final selected node ID from the changes
    let newSelectedId = null;
    let hasDeselection = false;

    changes.forEach(change => {
      if (change.type === 'select') {
        if (change.selected) {
          // Found a *new* selection. This takes precedence.
          newSelectedId = change.id;
        } else {
          // Found a deselection
          hasDeselection = true;
        }
      }
    });

    // 3. Update the state:
    if (newSelectedId !== null) {
      // If a new node was selected, set it.
      setSelectedNodeId(newSelectedId);
    } else if (hasDeselection) {
      // If no new selection was made, but a deselection occurred, 
      // check if the currently tracked node was deselected.
      setSelectedNodeId(prevId => {
        // If the change list contained a deselection for the *current* ID, clear it.
        const deselectedOurNode = changes.some(
          change => change.type === 'select' && !change.selected && change.id === prevId
        );

        // If our tracked node was deselected (e.g., clicking background or another node), clear state.
        if (deselectedOurNode) {
          return null;
        }

        return prevId; // Otherwise, keep the existing ID.
      });
    }

  }, []); // Dependency on selectedNodeId is removed to prevent stale closures.

  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#4f46e5', strokeWidth: 2 }
  }, eds)), []);


  // Save pipeline to backend (UPDATED ALERT)
  const savePipeline = async () => {
    try {
      // Note: The backend should handle assigning permanent IDs to any "temp_" nodes.
      await axios.post('home/pipeline', { nodes, edges });
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Pipeline Structure Saved Successfully!',
        confirmButtonColor: '#10b981',
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: 'Failed to save pipeline structure. See console for details.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  // 🔄 Function to fetch pipeline data
  const getPipelineData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('home/pipeline');
      const data = response.data;

      // Use the modified transformer to ensure nodes are deselected
      const { nodes: newNodes, edges: newEdges } = transformPipelineData(data.pipeline);

      setNodes(newNodes);
      setEdges(newEdges);

      // ✅ MODIFICATION: Ensure internal selection state is also cleared on load
      setSelectedNodeId(null);

      // ❌ REMOVED: Logic to set nodeCount based on existing nodes (no longer needed)

    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null); // Clear selection on error too
    } finally {
      setLoading(false);
    }
  }

  // 👇 FUNCTION: Remove Selected Node and its Edges (UPDATED WITH SweetAlert2)
  const removeSelectedNode = async () => {
    if (!selectedNodeId) {
      // Using Swal.fire for a simple info/warning modal
      Swal.fire({
        icon: 'warning',
        title: 'No Node Selected',
        text: 'Please select a node first by clicking on it in the pipeline diagram.',
        confirmButtonText: 'Got It',
        confirmButtonColor: '#4f46e5', // Tailwind indigo-600
      });
      return;
    }

    const nodeToRemove = nodes.find(n => n.id === selectedNodeId);
    if (!nodeToRemove) {
      setSelectedNodeId(null);
      return;
    }

    // Using Swal.fire for confirmation
    const result = await Swal.fire({
      title: `Are you sure you want to remove?`,
      html: `You are about to remove the node: <strong>"${nodeToRemove.data.label}"</strong> (ID: ${selectedNodeId}).<br><br><strong>This will also remove all its connections (edges).</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // Tailwind red-600
      cancelButtonColor: '#6b7280', // Tailwind gray-500
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      // 1. Remove the node
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));

      // 2. Remove all connected edges
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
      );

      // 3. Clear the selection
      setSelectedNodeId(null);

      // Success alert
      Swal.fire({
        icon: 'success',
        title: 'Node Removed!',
        text: `Node "${nodeToRemove.data.label}" removed successfully. Don't forget to save changes!`,
        confirmButtonColor: '#10b981', // Tailwind emerald-500
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      // Optional: Show a brief message if cancelled
      Swal.fire({
        icon: 'info',
        title: 'Removal Cancelled',
        text: 'The node was not removed.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };


  // 👇 FUNCTION: Add New Node and Connect (FIXED ID GENERATION)
  const addNewNodeAndConnect = async () => {
    // 1. Prompt user for the node label (Name)
    const { value: newNodeLabel, isDismissed: nameDismissed } = await Swal.fire({
      title: '1/3: Enter Name/Label',
      input: 'text',
      inputLabel: 'Name/Label for the new data point:',
      inputPlaceholder: 'e.g., John Doe, API Stage',
      showCancelButton: true,
      confirmButtonText: 'Next: Enter Detail',
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return 'You must enter a Name/Label!';
        }
      }
    });

    if (nameDismissed || !newNodeLabel) {
      Swal.fire({
        icon: 'info',
        title: 'Creation Cancelled',
        text: 'Node creation cancelled.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // 2. Prompt user for the subLabel (Email/Detail)
    const { value: newNodeSubLabelInput, isDismissed: subLabelDismissed } = await Swal.fire({
      title: '2/3: Enter Sub-Label ',
      input: 'text',
      inputLabel: 'Email or Detail for the new data point (Optional):',
      inputPlaceholder: 'e.g., john.doe@example.com, In Progress',
      showCancelButton: true,
      confirmButtonText: 'Next: Connect Node',
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return 'You must enter a Sub-Label!';
        }
      }
    });

    const newNodeSubLabel = newNodeSubLabelInput ? newNodeSubLabelInput.trim() : '';

    if (subLabelDismissed) {
      Swal.fire({
        icon: 'info',
        title: 'Creation Cancelled',
        text: 'Node creation cancelled.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // 3. Prompt user for the source node Label/Name/ID
    const idLabelList = nodes.map(n =>
      `- ${n.data.label}${n.data.subLabel ? ` (${n.data.subLabel})` : ''} (ID: ${n.id})`
    ).join('\n') || 'No existing nodes.';

    const { value: sourceSearchTermInput, isDismissed: connectionDismissed } = await Swal.fire({
      title: '3/3: Connect Node (Optional)',
      html: `Enter the Name, Email, or ID of the node to connect FROM (source).<br><br>Existing Stages:<pre class="text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">${idLabelList}</pre><br><strong>Leave blank to create an unconnected node.</strong>`,
      input: 'text',
      inputLabel: 'Source Node Search Term:',
      inputPlaceholder: 'e.g., "Alice", "bob@example.com", "node_3"',
      showCancelButton: true,
      confirmButtonText: 'Create Node',
      confirmButtonColor: '#10b981', // Tailwind emerald-500
    });

    if (connectionDismissed) {
      Swal.fire({
        icon: 'info',
        title: 'Creation Cancelled',
        text: 'Node creation cancelled.',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    const sourceSearchTerm = sourceSearchTermInput ? sourceSearchTermInput.trim() : '';
    let sourceNodeId = null;
    let connectionMessage = "but no connection was made (no source specified).";

    // Resolve the Source ID using the helper
    if (sourceSearchTerm !== '') {
      sourceNodeId = findNodeIdByLabel(nodes, sourceSearchTerm);

      if (!sourceNodeId) {
        connectionMessage = `but no connection was made (could not find node matching "${sourceSearchTerm}").`;
      } else {
        const sourceLabel = nodes.find(n => n.id === sourceNodeId)?.data?.label || sourceNodeId;
        connectionMessage = `and successfully connected it from ${sourceLabel}.`;
      }
    }

    // 🟢 FIX: Generate a highly unique ID using timestamp and random string
    const newId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create the new node object
    const newNode = {
      id: newId,
      // Use a random position to prevent stacking on the same coordinates
      position: { x: 50 + Math.random() * 500, y: 150 + Math.random() * 300 },
      data: {
        label: newNodeLabel.trim(),
        subLabel: newNodeSubLabel,
      },
      type: 'customNode',
      selected: false, // Ensure the new node is not selected initially
    };

    // Create the new edge object (connection)
    let newEdge = null;
    if (sourceNodeId) {
      newEdge = {
        id: `e-${sourceNodeId}-${newId}`,
        source: sourceNodeId,
        target: newId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#4f46e5', strokeWidth: 2 },
      };
    }

    // Update the state
    setNodes((prevNodes) => [...prevNodes, newNode]);

    if (newEdge) {
      setEdges((prevEdges) => [...prevEdges, newEdge]);
    }

    // Unified success feedback with SweetAlert2
    Swal.fire({
      icon: newEdge ? 'success' : 'info',
      title: newEdge ? 'Node Created & Connected!' : 'Node Created Unconnected!',
      html: `Added node <strong>"${newNodeLabel.trim()}"</strong> (Detail: ${newNodeSubLabel || 'N/A'}) ${connectionMessage}<br><br>Don't forget to Save Pipeline Changes!`,
      confirmButtonColor: '#4f46e5',
    });

    // ❌ Removed: setNodeCount update
  };


  useEffect(() => {
    getPipelineData();
  }, []);


  // Check loading state
  if (loading) return <p className="p-5 text-lg text-gray-600">Loading data pipeline...</p>;

  return (
    <div className="p-5 font-sans h-[80vh] w-full bg-gray-50">
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          <span className="text-indigo-600">Pipeline</span>  Flowchart
        </h1>
        <div className="flex gap-4">
          <button
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-purple-600 text-white shadow-md hover:bg-purple-700 transition duration-150"
            onClick={addNewNodeAndConnect}
          >
            Add New
          </button>

          <button
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white shadow-md hover:bg-red-700 transition duration-150"
            onClick={removeSelectedNode}
            // Button is enabled only if selectedNodeId is NOT null
            style={selectedNodeId ? {} : { opacity: 0.6, cursor: 'not-allowed' }}
            title={selectedNodeId ? "Remove the currently selected node" : "Select a node first"}
            disabled={!selectedNodeId} // Added disabled prop for semantic correctness
          >
            Remove
          </button>
          <button
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-green-600 text-white shadow-md hover:bg-green-700 transition duration-150"
            onClick={savePipeline}
          >
            💾 Save Pipeline Changes
          </button>
        </div>
      </div>

      <div className="h-full border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{ style: { stroke: '#4f46e5', strokeWidth: 2 }, type: 'smoothstep', animated: true }}
          // Deselect node if user clicks the canvas background (KEEP)
          onPaneClick={() => setSelectedNodeId(null)}
        >
          <Controls showInteractive={false} className='shadow-lg' />
          <MiniMap nodeStrokeColor={(node) => node.data.isPipe ? '#4f46e5' : '#1f2937'} nodeColor="#ffffff" maskColor="#eef2ff" className='rounded-xl' />
          <Background variant="lines" gap={20} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>

      <p className="mt-4 text-sm text-gray-600 flex items-center">
        <span className="mr-2 text-indigo-500">✨</span> Tip: **Click on a name to select it** (it will get a red border), then click the **Remove** button to delete it.
      </p>
    </div>
  );
}