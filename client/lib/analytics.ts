export async function trackSubmission(data: {
  username: string;
  challengeId: string;
  code: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  executionTime?: number;
  testCasesPassed?: number;
  testCasesTotal?: number;
}) {
  try {
    const csrfRes = await fetch('/api/csrf-token');
    const csrfData = await csrfRes.json();
    
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfData.csrfToken
      },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Failed to track submission:', e);
  }
}