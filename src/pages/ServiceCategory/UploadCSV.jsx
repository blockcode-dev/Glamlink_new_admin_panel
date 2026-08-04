import React, { useState } from 'react';
import Papa from 'papaparse';

const UploadCSV = ({ category_id }) => {
  const [csvData, setCsvData] = useState([]);

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const formattedData = results.data.map((row) => ({
            title: row.title,        // CSV contains only 'title'
            category_id: category_id // Add the category_id from params
          }));
          setCsvData(formattedData);
        }
      });
    }
  };

  // Handle the upload to API
  const handleUploadClick = async () => {
    if (csvData.length > 0) {
      try {
        const response = await fetch('https://node.glamlink.net/api/v1/admin/create-service-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ services: csvData }),  // Send data to API in the required format
        });

        const result = await response.json();
        console.log('API response:', result);
        // Handle success response (e.g., show success message)
      } catch (error) {
        console.error('Error uploading CSV data:', error);
        // Handle error (e.g., show error message)
      }
    } else {
      console.error('No CSV data to upload');
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <button onClick={handleUploadClick}>Upload CSV</button>
    </div>
  );
};

export default UploadCSV;
