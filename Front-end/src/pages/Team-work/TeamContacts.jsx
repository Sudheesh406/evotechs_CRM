import React, { useEffect, useState } from "react";
import Table2 from "../../components/Table2";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from '../../instance/Axios'

export default function TeamContacts() {
  const [teamContacts, setTeamContacts] = useState([]);
  // const navigate = useNavigate();
  const [user, setUser] = useState();

  const [value, setValue] = useState(true);

  ////--------------------------------------send staff id to table to work ------------------------//

  const getTeamContacts = async () => {
    try {
      const response = await axios.get("/team/contacts/get");
      const contacts = response.data?.contacts || [];
      const userId = response.data?.userId;
      setUser(userId);

      // Transform data into table-friendly format
      const transformedContacts = contacts.map((contact) => ({
        staffId: contact.assignedStaff?.id,
        date: new Date(contact.createdAt).toLocaleDateString(),
        customerName: contact.name,
        amount: contact.amount,
        priority: contact.priority || "Normal",
        email: contact.email,
        phone: contact.phone,
        location: contact.location,
        followerName: contact.assignedStaff?.name || "-",
        followerEmail: contact.assignedStaff?.email || "-",
      }));

      setTeamContacts(transformedContacts);
    } catch (error) {
      console.log("Error fetching team contacts:", error);
    }
  };

  useEffect(() => {
    getTeamContacts();
  }, []);

  // Columns need key + label
  const columns = [
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "amount", label: "Amount" },
    { key: "priority", label: "Priority" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "followerName", label: "Follower Name" },
    { key: "followerEmail", label: "Follower Email" },
  ];

  const handleRowClick = (lead) => {
    // console.log("Row clicked:", lead);
  };


  const handleActionClick = (row) => {
    Swal.fire({
      title: "Confirm Transfer",
      text: "Do you want to reassign this customer to yourself?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reassign",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.patch("/team/contact/reassign", {
            phone: row.phone,
            email: row.email,
          });
          console.log("API Response:", response.data);

          Swal.fire(
            "Reassigned!",
            "This customer has been successfully reassigned to you.",
            "success"
          );

          // Optionally, refresh the table after reassignment
          getTeamContacts();
        } catch (error) {
          console.error("Error reassigning customer:", error);
          Swal.fire(
            "Error",
            "Failed to reassign the customer. Please try again.",
            "error"
          );
        }
      }
    });
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-6 text-black">Team contacts</h1>
      <Table2
        columns={columns}
        data={teamContacts}
        currentStaffId={user}
        onRowClick={handleRowClick}
        onActionClick={handleActionClick} // <-- new prop
        value={value}
      />
    </div>
  );
}
