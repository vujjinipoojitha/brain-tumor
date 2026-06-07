import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Locate the root element in your index.html
const rootElement = document.getElementById('root');

// Safety Check: If the root element is missing, log a clear error to the console
if (!rootElement) {
  console.error("CRITICAL ERROR: Could not find the 'root' element in index.html. Ensure <div id='root'></div> exists.");
} else {
  // Create the React 18 root and render the App
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}










