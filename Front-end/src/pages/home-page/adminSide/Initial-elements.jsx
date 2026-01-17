import { useState, useEffect } from "react";
import axios from "../../../instance/Axios";

// Recursive function to build nodes & edges
const buildNodesAndEdgesRecursive = (node, parentId, xOffset, currentY, nodes, edges, level = 0) => {
  const nodeId = `node-${node.id || node.name}-${level}-${Math.random().toString(36).substr(2, 5)}`;

  // Determine label: show name + email if available
  let label = node.name;
  if (node.email) {
    label += `\n${node.email}`;
  } else if (node.leadInfo) {
    label = `${node.leadInfo.name}\n${node.leadInfo.email}`;
  }

  nodes.push({
    id: nodeId,
    type: "customNode",
    data: {
      label: label,
      icon: node.icon || "📄",
      color: node.color || "bg-white",
      isPipe: node.isPipe || false
    },
    position: { x: xOffset * level, y: currentY }
  });

  if (parentId) {
    edges.push({
      id: `edge-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: "smoothstep"
    });
  }

  let childY = currentY + 100;

  // Handle children recursively
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      buildNodesAndEdgesRecursive(child, nodeId, xOffset, childY, nodes, edges, level + 1);
      childY += 100;
    });
  }

  // Handle team members under lead/staff
  if (node.teamMembers && node.teamMembers.length > 0) {
    node.teamMembers.forEach((member) => {
      buildNodesAndEdgesRecursive(member, nodeId, xOffset, childY, nodes, edges, level + 1);
      childY += 100;
    });
  }
};

// Hook to fetch & build pipeline data
export const usePipelineData = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndBuild = async () => {
      try {
        const { data } = await axios.get("home/connection");

        if (!data || !data.pipelines) {
          setNodes([]);
          setEdges([]);
          return;
        }

        let nodesArray = [];
        let edgesArray = [];
        const xOffset = 250;
        let yOffset = 100;

        data.pipelines.forEach((pipeline, index) => {
          buildNodesAndEdgesRecursive(
            { ...pipeline, icon: "📊" },
            null,
            xOffset,
            yOffset + index * 200,
            nodesArray,
            edgesArray,
            0
          );
        });

        setNodes(nodesArray);
        setEdges(edgesArray);
      } catch (err) {
        console.error("Error fetching pipeline:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndBuild();
  }, []);

  return { nodes, edges, loading };
};
