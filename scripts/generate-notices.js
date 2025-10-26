import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate the JSON file with license information
try {
  execSync('npx license-checker --production --json --out THIRD_PARTY_NOTICES.json');

  // Read and process the JSON file
  const licenses = JSON.parse(readFileSync('THIRD_PARTY_NOTICES.json', 'utf8'));

  let output = 'THIRD-PARTY SOFTWARE NOTICES AND INFORMATION\n\n' +
    'This file contains third-party software components and their respective license information.\n\n';

  // Add each package's information
  for (const [pkg, data] of Object.entries(licenses)) {
    const info = data;
    output += `--- ${pkg} ---\n`;
    output += `License: ${info.licenses || 'Not specified'}\n`;
    output += `Repository: ${info.repository || 'Not specified'}\n\n`;
  }

  // Write the final output
  writeFileSync('THIRD_PARTY_NOTICES.txt', output);

  // Clean up
  unlinkSync('THIRD_PARTY_NOTICES.json');

  console.log('Successfully generated THIRD_PARTY_NOTICES.txt');
} catch (error) {
  console.error('Error generating third-party notices:', error);
  process.exit(1);
}
