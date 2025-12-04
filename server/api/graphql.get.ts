// Simple GraphQL Playground HTML page
export default defineEventHandler((event) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>GraphQL Playground - Wrapsody in White</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    .query-box {
      width: 100%;
      min-height: 300px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: vertical;
    }
    button {
      background: #ef4444;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 10px;
    }
    button:hover {
      background: #dc2626;
    }
    .result-box {
      margin-top: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #ddd;
      white-space: pre-wrap;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      max-height: 500px;
      overflow-y: auto;
    }
    .example {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .example h3 {
      margin-top: 0;
    }
    .example code {
      display: block;
      margin-top: 5px;
      padding: 5px;
      background: white;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 GraphQL Playground</h1>
    
    <div class="example">
      <h3>Example Query:</h3>
      <code>query { bookings { id name email date time status } }</code>
    </div>

    <div class="example">
      <h3>Example Mutation:</h3>
      <code>mutation { createBooking(input: { name: "John Doe" email: "john@example.com" phone: "555-1234" service: "premium" date: "2024-12-25" time: "14:00" address: "123 Main St" numberOfGifts: 5 }) { id status } }</code>
    </div>

    <textarea class="query-box" id="queryInput" placeholder="Enter your GraphQL query or mutation here...">query {
  bookings {
    id
    name
    email
    date
    time
    status
  }
}</textarea>
    
    <button onclick="executeQuery()">Execute Query</button>
    
    <div class="result-box" id="result"></div>
  </div>

  <script>
    async function executeQuery() {
      const query = document.getElementById('queryInput').value;
      const resultDiv = document.getElementById('result');
      
      resultDiv.textContent = 'Executing...';
      
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query
          })
        });
        
        const data = await response.json();
        resultDiv.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
  `
  
  setHeader(event, 'Content-Type', 'text/html')
  return html
})

