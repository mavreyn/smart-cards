import React from 'react';
import axios from 'axios';
import { useState } from 'react';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      setUploadStatus('Uploading...');
      const response = await axios.post('http://localhost:5000/upload', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('Upload successful!');
      console.log('Upload response:', response.data);
    } catch (error) {
      setUploadStatus('Upload failed. Check connection.');
      console.error('Upload error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 overflow-hidden">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md overflow-y-auto max-h-full">
        <label className="block mb-4">
          <span className="sr-only">Choose file</span>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
        {previewUrl && (
          <div className="mb-4">
            <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg" />
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className={`
            w-full px-4 py-2 rounded-lg
            font-semibold text-sm
            bg-blue-500 text-white
            transition-colors duration-300
            ${selectedFile 
              ? 'hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75' 
              : 'opacity-50 cursor-not-allowed'
            }
          `}
        >
          Upload Image
        </button>
        {uploadStatus && <p className="mt-4 text-center text-sm text-gray-600">{uploadStatus}</p>}
      </div>
    </div>
  );
};



export default Upload;