import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../assets/images/InvoiceLogo.png";

const Invoice = () => {
  // --- Initial Data for Refresh ---
  const defaultMeta = {
    invoiceNo: "EVOOCT00119",
    date: "20-01-2026"
  };

  const defaultBillTo = {
    name: "Arjundev V",
    address: "Puthumannel, Azheekkal, Azheekkal P O, Alappad,\nAzheekkalthura, Kollam\nKerala, Pin 690547",
    phone: "8589042749"
  };

  // Updated to an array of 3 items to make rows 2 and 3 editable
  const defaultItems = [
    { description: "PMEGP Loan Project Report For 13,00,000 Lakhs and Consulting Fee", unitPrice: 22033.90 },
    { description: "", unitPrice: 0 },
    { description: "", unitPrice: 0 }
  ];

  // --- State ---
  const [meta, setMeta] = useState(defaultMeta);
  const [billTo, setBillTo] = useState(defaultBillTo);
  const [items, setItems] = useState(defaultItems);
  const [advance, setAdvance] = useState(15600.00);
  const [isPrinting, setIsPrinting] = useState(false);

  // --- Refs ---
  const invoiceRef = useRef(null);
  const addressRef = useRef(null);
  const descRefs = useRef([]); // Array of refs for multiple rows

  // --- Auto-Resizing Logic ---
  const autoResize = (ref) => {
    if (ref && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize({ current: addressRef.current });
    descRefs.current.forEach(ref => {
        if(ref) {
            ref.style.height = "auto";
            ref.style.height = `${ref.scrollHeight}px`;
        }
    });
  }, [billTo.address, items, isPrinting]);

  // --- Handlers ---
  const handleRefresh = () => {
    setMeta(defaultMeta);
    setBillTo(defaultBillTo);
    setItems(defaultItems);
    setAdvance(15600.00);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === "unitPrice" ? parseFloat(value) || 0 : value;
    setItems(updatedItems);
  };

  const handleDownload = async () => {
    setIsPrinting(true);
    
    setTimeout(async () => {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794 
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${meta.invoiceNo}.pdf`);
      
      setIsPrinting(false);
    }, 250); 
  };

  // --- Automatic Calculations ---
  const subtotal = items.reduce((sum, itm) => sum + itm.unitPrice, 0);
  const taxRate = 0.18; 
  const totalTax = subtotal * taxRate;
  const totalAmount = subtotal + totalTax;
  const balance = totalAmount - advance;

  const fmt = (num) => Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const toWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const format = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
      if (n < 1000) return format(Math.floor(n / 100)) + 'Hundred ' + format(n % 100);
      if (n < 100000) return format(Math.floor(n / 1000)) + 'Thousand ' + format(n % 1000);
      if (n < 10000000) return format(Math.floor(n / 100000)) + 'Lakh ' + format(n % 100000);
      return format(Math.floor(n / 10000000)) + 'Crore ' + format(n % 10000000);
    };

    const whole = Math.floor(num);
    const decimal = Math.round((num - whole) * 100);
    let str = format(whole) + "Rupees ";
    if (decimal > 0) str += "and " + format(decimal) + "Paise ";
    return str + "Only";
  };

  const cellStyle = { padding: '8px 4px', lineHeight: '1.4' };

  return (
    <div>
      <div className="w-full flex justify-between p-4 no-print">
        <button 
          onClick={handleRefresh}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#b18f1d', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Form Reset
        </button>
        <button 
          onClick={handleDownload}
          style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isPrinting ? "Generating..." : "Download"}
        </button>
      </div>

      <div 
        className="invoice-container" 
        ref={invoiceRef} 
        style={{ 
          background: 'white', 
          padding: '10px', 
          width: '794px', 
          minHeight: '1123px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div 
          className="invoice-border-outer" 
          style={{ 
            border: '1px solid #000', 
            padding: '15px', 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column' 
          }}
        >
          <div style={{ flex: 1 }}>
            {/* Header Section */}
            <div className="header-wrapper" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="logo-section">
                <img src={logo} alt="EVO Logo" style={{ width: "180px" }} />
              </div>
              <div className="invoice-info-box" style={{ textAlign: 'center', border: '1px solid #000' }}>
                <div className="invoice-title" style={{ fontWeight: 'bold', borderBottom: '1px solid #000', padding: '5px' }}>INVOICE</div>
                <table className="invoice-meta-table">
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>INVOICE. #</td>
                      <td style={{ padding: '4px' }}>DATE</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #000' }}>
                      <td style={{ padding: '4px', borderRight: '1px solid #000' }}>
                        {isPrinting ? (
                          <span>{meta.invoiceNo}</span>
                        ) : (
                          <input 
                            style={{border:'none', textAlign:'center', outline:'none', width:'100%', background:'transparent', font:'inherit'}}
                            value={meta.invoiceNo}
                            onChange={(e) => setMeta({...meta, invoiceNo: e.target.value})}
                          />
                        )}
                      </td>
                      <td style={{ padding: '4px' }}>
                        {isPrinting ? (
                          <span>{meta.date}</span>
                        ) : (
                          <input 
                            style={{border:'none', textAlign:'center', outline:'none', width:'100%', background:'transparent', font:'inherit'}}
                            value={meta.date}
                            onChange={(e) => setMeta({...meta, date: e.target.value})}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Address Section */}
            <div className="address-section" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div className="company-details" style={{ border: '1px solid #000', padding: '10px', width: '45%' }}>
                <div className="company-name" style={{ fontWeight: 'bold' }}>EVO Finance Consultancy Pvt Ltd</div>
                <div className="company-info" style={{ lineHeight: '1.4', fontSize: '0.9rem' }}>
                  Tropicana Shopping Complex<br />
                  PATHANAMTHITTA, KERALA-689645<br />
                  Mobile : 9446141240, 9544877473<br />
                  Web: <span style={{color: 'blue'}}>evofins.com</span><br />
                  Email: <span style={{color: 'blue'}}>mail@evotechs.in</span>
                </div>
              </div>

              <div className="bill-to-section" style={{ border: '1px solid #000', width: '45%' }}>
                <div className="bill-to-header" style={{ fontWeight: 'bold', background: '#000', color: '#fff', padding: '4px' }}>BILL TO</div>
                <div className="bill-to-info" style={{ lineHeight: '1.4', padding: '10px' }}>
                  {isPrinting ? (
                    <div style={{fontWeight: 'bold'}}>{billTo.name}</div>
                  ) : (
                    <input 
                      style={{fontWeight:'bold', border:'none', width:'100%', outline:'none'}} 
                      value={billTo.name}
                      onChange={(e) => setBillTo({...billTo, name: e.target.value})}
                    />
                  )}
                  
                  {isPrinting ? (
                    <div style={{whiteSpace: 'pre-wrap'}}>{billTo.address}</div>
                  ) : (
                    <textarea 
                      ref={addressRef}
                      style={{border:'none', width:'100%', outline:'none', resize:'none', font: 'inherit', overflow:'hidden'}} 
                      rows="1"
                      value={billTo.address}
                      onChange={(e) => setBillTo({...billTo, address: e.target.value})}
                    />
                  )}

                  {isPrinting ? (
                    <div>{billTo.phone}</div>
                  ) : (
                    <input 
                      style={{border:'none', width:'100%', outline:'none'}} 
                      value={billTo.phone}
                      onChange={(e) => setBillTo({...billTo, phone: e.target.value})}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #000' }}>
  <thead>
    <tr style={{ borderBottom: '1px solid #000' }}>
      <th style={{...cellStyle, borderRight: '1px solid #000'}}>Sl. No.</th>
      <th style={{...cellStyle, width: '60%', borderRight: '1px solid #000'}}>DESCRIPTION</th>
      <th style={{...cellStyle, borderRight: '1px solid #000'}}>QTY</th>
      <th style={{...cellStyle, borderRight: '1px solid #000'}}>UNIT PRICE</th>
      <th style={cellStyle}>AMOUNT</th>
    </tr>
  </thead>
  <tbody>
    {items.map((itm, index) => (
      <tr key={index} style={{ borderBottom: '1px solid #000' }}>
        <td align="center" style={{...cellStyle, borderRight: '1px solid #000'}}>{index + 1}</td>
        <td style={{...cellStyle, borderRight: '1px solid #000'}}>
          {isPrinting ? (
            <div style={{whiteSpace: 'pre-wrap'}}>{itm.description}</div>
          ) : (
            <textarea 
              ref={el => descRefs.current[index] = el}
              style={{border:'none', width:'100%', outline:'none', resize:'none', font: 'inherit', background:'transparent', overflow:'hidden'}}
              rows="1"
              value={itm.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            />
          )}
        </td>
        <td align="center" style={{...cellStyle, borderRight: '1px solid #000'}}>{itm.unitPrice > 0 ? "1" : ""}</td>
        <td align="right" style={{...cellStyle, borderRight: '1px solid #000'}}>
          {isPrinting ? (
            <span>{itm.unitPrice > 0 ? fmt(itm.unitPrice) : ""}</span>
          ) : (
            <input 
              type="number"
              style={{border:'none', textAlign:'right', outline:'none', width:'80px', background:'transparent'}}
              value={itm.unitPrice || ""}
              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
            />
          )}
        </td>
        <td align="right" style={cellStyle}>{itm.unitPrice > 0 ? fmt(itm.unitPrice) : ""}</td>
      </tr>
    ))}
    
    <tr style={{ borderBottom: '1px solid #000' }}>
      <td style={{...cellStyle, borderRight: '1px solid #000'}}>{items.length + 1}</td>
      <td style={{...cellStyle, borderRight: '1px solid #000'}}><strong>Advance</strong></td>
      <td colSpan="2" style={{...cellStyle, borderRight: '1px solid #000'}}></td>
      <td align="right" style={cellStyle}>
        {isPrinting ? (
          <strong>{fmt(advance)}</strong>
        ) : (
          <input 
            type="number"
            style={{border:'none', textAlign:'right', outline:'none', width:'80px', background:'transparent', fontWeight:'bold'}}
            value={advance}
            onChange={(e) => setAdvance(parseFloat(e.target.value) || 0)}
          />
        )}
      </td>
    </tr>
    <tr style={{ borderBottom: '1px solid #000' }}>
      <td style={{...cellStyle, borderRight: '1px solid #000'}}>{items.length + 2}</td>
      <td style={{...cellStyle, borderRight: '1px solid #000'}}><strong>Balance</strong></td>
      <td colSpan="2" style={{...cellStyle, borderRight: '1px solid #000'}}></td>
      <td align="right" style={{...cellStyle, color: 'red', fontWeight: 'bold'}}>{fmt(balance)}</td>
    </tr>
    <tr style={{background: '#f9f9f9', fontWeight: 'bold'}}>
      <td colSpan="4" align="right" style={{...cellStyle, borderRight: '1px solid #000'}}>Total</td>
      <td align="right" style={cellStyle}>{fmt(totalAmount)}</td>
    </tr>
  </tbody>
</table>

            {/* Bottom Section */}
            <div className="summary-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            

              <div className="amount-in-words" style={{ width: '40%', padding: '10px', textAlign: 'center' }}>
                <strong>Amount in Words</strong><br />
                <span style={{textDecoration: 'underline', textTransform: 'uppercase', fontSize: '0.8rem', lineHeight: '1.4', display: 'block'}}>
                  {toWords(totalAmount)}
                </span>
              </div>

              <div className="totals-box" style={{ width: '200px', border: '1px solid #000', padding: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>SUBTOTAL</span><span>{fmt(subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>TAX</span><span>{fmt(totalTax)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderTop: '1px solid #000', fontWeight: 'bold' }}><span>TOTAL</span><span>{fmt(totalAmount)}</span></div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bank-details-wrapper" style={{ marginTop: '20px' }}>
              <table className="bank-table" style={{ border: '1px solid #000', width: '300px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#000', color: '#150101' }}><th colSpan="2" style={{ padding: '4px' }}>OUR BANK DETAILS</th></tr>
                </thead>
                <tbody>
                  <tr style={{borderBottom: '1px solid #eee'}}><td style={{ padding: '4px' }}><strong>BANK NAME</strong></td><td style={{ padding: '4px' }}>: ICICI BANK</td></tr>
                  <tr style={{borderBottom: '1px solid #eee'}}><td style={{ padding: '4px' }}><strong>BRANCH</strong></td><td style={{ padding: '4px' }}>: PATHANAMTHITTA</td></tr>
                  <tr style={{borderBottom: '1px solid #eee'}}><td style={{ padding: '4px' }}><strong>A/c No.</strong></td><td style={{ padding: '4px' }}>: 021605001394</td></tr>
                  <tr><td style={{ padding: '4px' }}><strong>IFSC</strong></td><td style={{ padding: '4px' }}>: ICIC0000216</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="footer-text" style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            This is a Computer Generated Invoice, Hence No Physical Signature Needed
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;