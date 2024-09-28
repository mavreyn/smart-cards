import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [text, setText] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/send-text', { text });
      alert(response.data.message);
    } catch (error) {
      console.error('Error sending text:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Send Text to Backend</h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
};

export default Upload;