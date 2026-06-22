

async function testAttendance() {
  const token = '3XhJHxqhxFVM8jQbIVdgNlM7vzLkLU3UVqhmnTCakt53NWL6LKEVhvNIzvmC-yQZIsHqi6I_bxARPpkIGsNwEw';
  
  const payload = {
    employee_id: 0,
    date: '2026-06-13',
    check_in: '11:20:44.859Z',
    check_out: null,
    notes: 'test check_in'
  };

  const response = await fetch('http://srv1029267.hstgr.cloud:8000/api/employee/me/attendance', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(payload)
  });

  console.log('STATUS:', response.status);
  const text = await response.text();
  console.log('RESPONSE:', text);
}

testAttendance();
