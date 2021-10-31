import React, { useState, useEffect } from "react";
import "./styles.css";
import csv from "csvtojson";
import json2csv from "./json2csv";
import { CSVLink } from "react-csv";
import { csvFileContent } from "./csvFileContent";

const twoDecimals = (val) => parseFloat(val.toFixed(2));

const csvOutputFormat = (obj) => ({
  Hot: obj.hot,
  URL: obj.url,
  Product: obj.product,
  ASIN: obj.asin,
  Price: obj.price,
  Reviews: obj.reviews,
  "Amazon Fees": obj.amazonFees,
  "Landed Cost": obj.landedCost,
  "Monthly Revenue": obj.monthlyRevenue,
  "Monthly Sales": obj.monthlySales,
  // "Profit Margin": obj.profitMargin,
  // ROI: obj.roi,
  "$5k and < 200 reviews": obj.domL1,
  "$10k and < 500 reviews": obj.domL2
});

export default function App() {
  const [csvData, setCsvData] = useState(csvFileContent);
  const [output, setOutput] = useState([]);
  const [amazonFees, setAmazonFees] = useState(0);
  const [landedCost, setLandedCost] = useState(0);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    csv()
      .fromString(csvData)
      .then((jsonObj) => {
        jsonObj.length = 10;

        const newObj = {
          hot: false,
          url: jsonObj[0]["Url"],
          product: productName,
          asin: jsonObj[0]["ASIN"],
          price: 0,
          reviews: 0,
          amazonFees: parseFloat(amazonFees),
          landedCost: parseFloat(landedCost),
          monthlyRevenue: 0,
          monthlySales: 0,
          // profitMargin: 0,
          // roi: 0,
          domL1: 0,
          domL2: 0
        };

        jsonObj.forEach((item) => {
          newObj.price += parseFloat(item["Price ($)"] || 0);
          newObj.reviews += parseFloat(item["Reviews"] || 0);
          newObj.monthlyRevenue += parseFloat(item["Revenue ($)"] || 0);
          newObj.monthlySales += parseFloat(item["Monthly Sales"] || 0);
        }, []);

        // Averages
        newObj.price /= jsonObj.length;
        newObj.reviews /= jsonObj.length;
        newObj.monthlyRevenue /= jsonObj.length;
        newObj.monthlySales /= jsonObj.length;

        newObj.price = twoDecimals(newObj.price);
        newObj.reviews = twoDecimals(newObj.reviews);
        newObj.monthlySales = twoDecimals(newObj.monthlySales);

        // Profit margin
        // const profitMargin = twoDecimals(
        //   newObj.price - (newObj.amazonFees + newObj.landedCost)
        // );
        // // const percentageMargin = twoDecimals(
        // //   newObj.profitMargin / newObj.price
        // // );
        // // newObj.profitMargin = `${profitMargin} (${percentageMargin}%)`;
        // newObj.profitMargin = profitMargin;

        // ROI
        // newObj.roi = twoDecimals((profitMargin / newObj.landedCost) * 100);

        // Depth of market Level 1 and 2
        const domL1 = jsonObj
          .filter((item) => item["Revenue ($)"] > 5000 && item["Reviews"] < 200)
          .map((item) => item["#"]);

        newObj.domL2 = jsonObj.filter(
          (item) =>
            item["Revenue ($)"] > 10000 &&
            item["Reviews"] < 500 &&
            !domL1.includes(item["#"])
        ).length;

        newObj.domL1 = domL1.length;

        setOutput(csvOutputFormat(newObj));
      });
  }, [csvData, amazonFees, landedCost, productName]);

  const handleChange = (event) => setCsvData(event.target.value);
  const handleChangeAmazonFees = (event) => setAmazonFees(event.target.value);
  const handleChangeLandedCost = (event) => setLandedCost(event.target.value);
  const handleChangeProductName = (event) => setProductName(event.target.value);

  const csvReport = {
    data: json2csv([output]),
    filename: "Clue_Mediator_Report.csv"
  };

  return (
    <div className="App">
      <h1>Product Analyzer Tool</h1>
      <h2>Paste your CSV file contents</h2>
      <textarea cols="80" rows="10" onChange={handleChange} value={csvData} />
      <br />
      <br />
      Product Name:{" "}
      <input onChange={handleChangeProductName} value={productName} />
      <br />
      <br />
      Amazon Fees:{" "}
      <input onChange={handleChangeAmazonFees} value={amazonFees} />
      <br />
      <br />
      Landed Cost:{" "}
      <input onChange={handleChangeLandedCost} value={landedCost} />
      <br />
      <br />
      <code className="json-output">{json2csv([output])}</code>
      <br />
      <br />
      <CSVLink {...csvReport}>Export to CSV</CSVLink>
    </div>
  );
}
