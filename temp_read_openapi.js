const fs = require('fs');
const path = require('path');

try {
  const openapiPath = path.join(__dirname, 'openapi.json');
  console.log('Reading:', openapiPath);
  const data = fs.readFileSync(openapiPath, 'utf8');
  const openapi = JSON.parse(data);
  const schema = openapi.components?.schemas?.DismantleItemRequest;
  console.log('DismantleItemRequest Schema:', JSON.stringify(schema, null, 2));
} catch (e) {
  console.error('Error:', e.message);
}
