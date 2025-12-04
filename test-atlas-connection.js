// Test MongoDB Atlas Connection
const { MongoClient } = require('mongodb');

// Try different connection string formats
const uris = [
  'mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/?retryWrites=true&w=majority',
  'mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/wrapsody-in-white?retryWrites=true&w=majority',
  'mongodb+srv://userdefault:RgwUrjgOJRXdTdxJ@cluster0.g5mwfqm.mongodb.net/?retryWrites=true&w=majority&authSource=admin'
];

async function testConnection(uri, index) {
  try {
    console.log(`\nTesting URI ${index + 1}:`);
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('wrapsody-in-white');
    const result = await db.adminCommand({ ping: 1 });
    console.log('✅ Connection successful!', result);
    await client.close();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

(async () => {
  for (let i = 0; i < uris.length; i++) {
    const success = await testConnection(uris[i], i);
    if (success) {
      console.log(`\n✅ Working connection string: ${uris[i]}`);
      break;
    }
  }
})();
