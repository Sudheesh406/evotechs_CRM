import { div } from "framer-motion/client";
import logo from "../../assets/images/InvoiceLogo.png";
import { useEffect, useState } from "react";

import { RotateCcw, Download } from "lucide-react";

const Invoice = () => {
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState({
    invoiceNo: "EVOOCT00119",
    date: "20-01-2026",
    company: {
      name: "EVO Finance Consultancy Pvt Ltd",
      address: "Tropicana Shopping Complex\nPATHANAMTHITTA, KERALA-689645",
      contact: "Mobile : 9446141240, 9544877473",
      gstin: "GSTN: 32GOYPS9637M1ZL",
    },
    customer: {
      name: "Arjundev V",
      address:
        "Puthumannel, Azheekkal, Azheekkal P O, Alappad, Azheekkalthura, Kollam",
      statePin: "Kerala, Pin 690547",
      phone: "8589042749",
    },
    bank: {
      name: "ICICI BANK",
      branch: "PATHANAMTHITTA",
      accNo: "021605001394",
      ifsc: "ICIC0000216",
    },
    // Added table values to state for dynamic calculation
    items: {
      description:
        "PMEGP Loan Project Report For 13,00,000 Lakhs and Consulting Fee",
      qty: 1,
      unitPrice: 22033.9,
      taxPercent: 18,
      advance: 15600.0,
    },
  });

  useEffect(() => {
    setData({
      invoiceNo: "EVOOCT00119",
      date: "20-01-2026",
      company: {
        name: "EVO Finance Consultancy Pvt Ltd",
        address: "Tropicana Shopping Complex\nPATHANAMTHITTA, KERALA-689645",
        contact: "Mobile : 9446141240, 9544877473",
        gstin: "GSTN: 32GOYPS9637M1ZL",
      },
      customer: {
        name: "Arjundev V",
        address:
          "Puthumannel, Azheekkal, Azheekkal P O, Alappad, Azheekkalthura, Kollam",
        statePin: "Kerala, Pin 690547",
        phone: "8589042749",
      },
      bank: {
        name: "ICICI BANK",
        branch: "PATHANAMTHITTA",
        accNo: "021605001394",
        ifsc: "ICIC0000216",
      },
      // Added table values to state for dynamic calculation
      items: {
        description:
          "PMEGP Loan Project Report For 13,00,000 Lakhs and Consulting Fee",
        qty: 1,
        unitPrice: 22033.9,
        taxPercent: 18,
        advance: 15600.0,
      },
    });
  }, [refresh]);

  // Calculation Logic
  const subtotal = Number(data.items.qty) * Number(data.items.unitPrice);
  const totalTax = (subtotal * Number(data.items.taxPercent)) / 100;
  const totalAmount = subtotal + totalTax;
  const balance = totalAmount - Number(data.items.advance);

  // Helper for formatting numbers with commas
  const formatCurr = (num) =>
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleRefresh = () => {
    console.log("form refresh to default stage");
    if (refresh) {
      setRefresh(false);
    } else {
      setRefresh(true);
    }
  };

  const inputBase =
    "w-full bg-transparent focus:outline-none focus:bg-gray-50 border-none p-0 m-0 text-inherit font-inherit";


    const handleDownload = ()=>{

    }

  return (
    <div>
      <div className="w-full flex justify-between">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto transition-colors flex items-center gap-2"
          onClick={() => handleRefresh()}
        >
          <RotateCcw size={16} />
          Refresh
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto transition-colors flex items-center gap-2"
          onClick={() => handleDownload()}
        >
          <Download size={16} />
          Download
        </button>
      </div>
      <div className="max-w-[800px] mx-auto my-10 bg-white border-[1px] border-black p-4 font-sans text-[13px] leading-tight text-black">
        <style
          dangerouslySetInnerHTML={{
            __html: `
        @media print {
          button { display: none !important; }
          input, textarea { border: none !important; background: transparent !important; }
        }
      `,
          }}
        />
        {/* Outer Border Wrapper */}
        <div className="border-[1.5px] border-black p-1">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center pt-5 pl-10">
              <img
                src={logo}
                alt="Logo"
                className="h-24 w-auto object-contain"
              />
            </div>

            <div className="w-1/2">
              <div className="border-2 border-black text-center py-1 bg-white mb-1">
                <h1 className="text-2xl font-bold tracking-[0.2em]">INVOICE</h1>
              </div>
              <div className="grid grid-cols-2 border border-black">
                <div className="border-r border-black p-1 text-center font-bold">
                  INVOICE. #
                </div>
                <div className="p-1 text-center font-bold">DATE</div>
                <div className="border-t border-r border-black p-1 text-center">
                  <input
                    className={`${inputBase} text-center`}
                    value={data.invoiceNo}
                    onChange={(e) =>
                      setData({ ...data, invoiceNo: e.target.value })
                    }
                  />
                </div>
                <div className="border-t border-black p-1 text-center">
                  <input
                    className={`${inputBase} text-center`}
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Company Section */}
            <div className="border border-black">
              <div className="bg-white border-b border-black p-1 font-bold text-sm">
                EVO Finance Consultancy Pvt Ltd
              </div>
              <div className="p-1">
                Tropicana Shopping Complex
                <br />
                PATHANAMTHITTA, KERALA-689645
                <br />
                Mobile : 9446141240, 9544877473
                <br />
                GSTN: 32GOYPS9637M1ZL
                <br />
                <div className="flex">
                  Web:
                  <a
                    href="https://www.evotechs.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs block pl-1"
                  >
                    www.evotechs.in
                  </a>
                </div>
                <div className="flex">
                  Email:
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=mail@evotechs.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs block pl-1"
                  >
                    mail@evotechs.in
                  </a>
                </div>
              </div>
            </div>

            <div className="border border-black">
              <div className="bg-black text-white p-1 font-bold text-xs">
                BILL TO
              </div>
              <div className="p-1">
                <input
                  className={`${inputBase} font-bold`}
                  value={data.customer.name}
                  onChange={(e) =>
                    setData({
                      ...data,
                      customer: { ...data.customer, name: e.target.value },
                    })
                  }
                />
                <textarea
                  className={`${inputBase} h-auto resize-none overflow-hidden`}
                  style={{ fieldSizing: "content" }}
                  value={data.customer.address}
                  onChange={(e) =>
                    setData({
                      ...data,
                      customer: { ...data.customer, address: e.target.value },
                    })
                  }
                />
                <input
                  className={inputBase}
                  value={data.customer.statePin}
                  onChange={(e) =>
                    setData({
                      ...data,
                      customer: { ...data.customer, statePin: e.target.value },
                    })
                  }
                />
                <div className="flex gap-1">
                  <span>Phone:</span>
                  <input
                    className={inputBase}
                    value={data.customer.phone}
                    onChange={(e) =>
                      setData({
                        ...data,
                        customer: { ...data.customer, phone: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-black mb-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black text-center font-bold">
                  <th className="border-r border-black p-1 w-10">Sl. No.</th>
                  <th className="border-r border-black p-1">DESCRIPTION</th>
                  <th className="border-r border-black p-1 w-12">QTY</th>
                  <th className="border-r border-black p-1 w-20">UNIT PRICE</th>
                  <th className="border-r border-black p-1 w-12">TAX</th>
                  <th className="border-r border-black p-1 w-16">KFC 1%</th>
                  <th className="border-r border-black p-1 w-16">TOTAL TAX</th>
                  <th className="p-1 w-20">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {/* Main Item Row */}
                <tr className="border-b border-black align-top h-24">
                  <td className="border-r border-black p-1 text-center">1</td>
                  <td className="border-r border-black p-1 font-medium">
                    <textarea
                      className={`${inputBase} h-20 resize-none`}
                      value={data.items.description}
                      onChange={(e) =>
                        setData({
                          ...data,
                          items: { ...data.items, description: e.target.value },
                        })
                      }
                    />
                  </td>
                  <td className="border-r border-black p-1 text-center">
                    <input
                      className={`${inputBase} text-center`}
                      value={data.items.qty}
                      onChange={(e) =>
                        setData({
                          ...data,
                          items: { ...data.items, qty: Number(e.target.value) },
                        })
                      }
                    />
                  </td>
                  <td className="border-r border-black p-1 text-right">
                    <input
                      className={`${inputBase} text-right`}
                      value={data.items.unitPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          setData({
                            ...data,
                            items: { ...data.items, unitPrice: val },
                          });
                        }
                      }}
                    />
                  </td>
                  <td className="border-r border-black p-1 text-center">
                    <input
                      className={`${inputBase} text-center`}
                      value={`${data.items.taxPercent}%`}
                      onChange={(e) =>
                        setData({
                          ...data,
                          items: {
                            ...data.items,
                            taxPercent: Number(e.target.value.replace("%", "")),
                          },
                        })
                      }
                    />
                  </td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black p-1 text-right font-semibold">
                    <div className={inputBase}>{formatCurr(totalTax)}</div>
                  </td>
                  <td className="p-1 text-right font-semibold">
                    <div className={inputBase}>{formatCurr(totalAmount)}</div>
                  </td>
                </tr>

                {/* Three New Blank Rows */}
                {[2, 3, 4].map((num) => (
                  <tr key={num} className="border-b border-black h-8">
                    <td className="border-r border-black text-center text-sm text-gray-400">
                      {num}
                    </td>
                    <td className="border-r border-black p-1">
                      <input className={inputBase} />
                    </td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))}

                {/* Advance Row */}
                <tr className="border-b border-black h-6">
                  <td className="border-r border-black text-center">5</td>
                  <td className="border-r border-black p-1 font-semibold">
                    <input className={inputBase} defaultValue="Advance" />
                  </td>
                  <td className="border-r border-black" colSpan="5"></td>
                  <td className="p-1 text-right font-semibold">
                    <input
                      className={`${inputBase} text-right font-semibold`}
                      value={data.items.advance}
                      onChange={(e) =>
                        setData({
                          ...data,
                          items: {
                            ...data.items,
                            advance: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </td>
                </tr>

                {/* Balance Row */}
                <tr className="border-b border-black h-6">
                  <td className="border-r border-black text-center">6</td>
                  <td className="border-r border-black p-1 font-semibold">
                    <input className={inputBase} defaultValue="Balance" />
                  </td>
                  <td className="border-r border-black" colSpan="5"></td>
                  <td className="p-1 text-right font-semibold text-red-600">
                    <div className={inputBase}>{formatCurr(balance)}</div>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2 border-black">
                  <td colSpan="4"></td>
                  <td
                    colSpan="1"
                    className="p-1 border border-black text-center"
                  >
                    Total
                  </td>
                  <td className="border border-black p-1 text-right">0.00</td>
                  <td className="border border-black p-1 text-right">
                    {formatCurr(totalTax)}
                  </td>
                  <td className="border border-black p-1 text-right">
                    {formatCurr(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Bottom Section */}
          <div className="flex justify-between items-end gap-4 mt-6">
            <div className="w-1/4 border border-black">
              <table className="w-full text-center">
                <thead className="border-b border-black bg-gray-50">
                  <tr className="font-bold">
                    <th className="border-r border-black">Tax</th>
                    <th className="border-r border-black">Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border-r border-black">CGST</td>
                    <td className="border-r border-black">
                      {data.items.taxPercent / 2}%
                    </td>
                    <td>{formatCurr(totalTax / 2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black">SGST</td>
                    <td className="border-r border-black">
                      {data.items.taxPercent / 2}%
                    </td>
                    <td>{formatCurr(totalTax / 2)}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border-r border-black">KFC</td>
                    <td className="border-r border-black">1%</td>
                    <td>0.00</td>
                  </tr>
                  <tr className="font-bold">
                    <td
                      colSpan="2"
                      className="border-r border-black text-center"
                    >
                      Total
                    </td>
                    <td className="text-right pr-1">{formatCurr(totalTax)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="w-1/3 text-center mb-10">
              <p className="font-bold mb-2">Amount in Words</p>
              <input
                className={`${inputBase} font-bold uppercase underline text-center`}
                defaultValue="TWENTY SIX THOUSAND ONLY"
              />
            </div>

            <div className="w-1/3 border-2 border-black font-bold">
              <div className="flex justify-between border-b border-black p-1">
                <span>SUBTOTAL</span>
                <span>{formatCurr(subtotal)}</span>
              </div>
              <div className="flex justify-between border-b border-black p-1">
                <span>TAX</span>
                <span>{formatCurr(totalTax)}</span>
              </div>
              <div className="flex justify-between p-1 bg-gray-50">
                <span>TOTAL</span>
                <span>{formatCurr(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="flex justify-end mt-4">
            <div className="w-1/2 border border-black">
              <div className="bg-gray-100 text-center font-bold border-b border-black text-[11px]">
                OUR BANK DETAILS
              </div>
              <table className="w-full text-left text-xs table-fixed">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="font-bold p-1 border-r border-black w-1/3">
                      BANK NAME
                    </td>
                    <td className="p-1">: {data.bank.name}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="font-bold p-1 border-r border-black">
                      BRANCH
                    </td>
                    <td className="p-1">: {data.bank.branch}</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="font-bold p-1 border-r border-black">
                      A/c No.
                    </td>
                    <td className="p-1">: {data.bank.accNo}</td>
                  </tr>
                  <tr>
                    <td className="font-bold p-1 border-r border-black">
                      IFSC
                    </td>
                    <td className="p-1">: {data.bank.ifsc}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-[10px] border-t border-black pt-1 italic">
            This is a Computer Generated Invoice, Hence No Physical Signature
            Needed
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
