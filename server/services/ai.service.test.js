// Run with: node server/services/ai.service.test.js
import { analyzeComplaint } from './ai.service.js';

const testCases = [
  {
    title:       'Water leakage near electrical panel in C-Block',
    description: 'There is water dripping directly onto the main electrical switchboard in C-Block ground floor. Sparks were seen last night. Very dangerous.',
    category:    'plumbing',  // user picked wrong — AI should correct to 'electrical' + critical
  },
  {
    title:       'WiFi not working in Room 204',
    description: 'The WiFi has been down in my room for 2 days. I cannot attend online classes.',
    category:    'wifi',
  },
  {
    title:       'Mess food quality is bad',
    description: 'The dal served today had insects in it. Multiple students are complaining.',
    category:    'food',  // should be high/critical due to food safety
  },
  {
    title:       'Light bulb broken in corridor',
    description: 'The bulb in the 3rd floor corridor near Room 310 is not working.',
    category:    'electrical',  // should be low
  },
];

(async () => {
  for (const tc of testCases) {
    console.log('\n─────────────────────────────────');
    console.log('Input:', tc.title);
    const result = await analyzeComplaint(tc.title, tc.description, tc.category);
    console.log('Result:', JSON.stringify(result, null, 2));
  }
})();