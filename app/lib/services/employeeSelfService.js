import { fetchApi } from '../api';

export const employeeSelfService = {
  // Get dashboard data
  getDashboard: async () => {
    return fetchApi('/api/employee/me/dashboard');
  },

  // Get current employee profile
  getProfile: async () => {
    return fetchApi('/api/employee/me');
  },

  // Update employee profile
  updateProfile: async (data) => {
    return fetchApi('/api/employee/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change user password
  changePassword: async (oldPassword, newPassword) => {
    return fetchApi('/api/employee/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword
      }),
    });
  },

  /**
   * Submit attendance check-in or check-out.
   * API expects: { employee_id, date, check_in, check_out, notes }
   *   - date:      "YYYY-MM-DD"
   *   - check_in:  "HH:MM:SS.mmmZ"  ← UTC time portion from ISO string
   *   - check_out: "HH:MM:SS.mmmZ"  ← same format
   *   - For check-in only:  send check_in, set check_out: null
   *   - For check-out only: send check_out, set check_in: null
   * employee_id is ignored by the backend (uses token), but required by schema.
   */
  submitAttendance: async ({ employee_id, type, notes, latitude, longitude }) => {
    const now = new Date();

    // Date portion: "YYYY-MM-DD"
    const date = now.toISOString().split('T')[0];

    // Time portion: "HH:MM:SS.mmmZ" — exactly what the backend example shows
    // e.g. new Date().toISOString() = "2026-06-12T11:20:44.859Z"
    //      .split('T')[1]          = "11:20:44.859Z"
    const timeStr = now.toISOString().split('T')[1];

    // Parse employee_id to ensure it's a valid integer
    let empId = parseInt(employee_id, 10);
    if (isNaN(empId)) empId = 0;

    const payload = {
      employee_id: empId,
      date,
      check_in: type === 'check_in' ? timeStr : null,
      check_out: type === 'check_out' ? timeStr : null,
      notes: notes || '',
    };

    return fetchApi('/api/employee/me/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get employee attendance log.
   * API uses start_date / end_date query params (not skip/limit).
   * Backend currently has a bug returning 400, so we return [] gracefully.
   */
  getAttendance: async (startDate, endDate) => {
    let url = '/api/employee/me/attendance';
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length > 0) url += '?' + params.join('&');

    try {
      const data = await fetchApi(url);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      // Backend has a known bug ("Attendance has no attribute 'attendance_date'")
      // Return empty array gracefully rather than crashing the UI
      console.warn('⚠️ Attendance API error (backend bug):', err.message);
      return [];
    }
  },

  /**
   * Get monthly attendance summary.
   * Backend currently has a bug returning 400.
   */
  getAttendanceSummary: async (month, year) => {
    const now = new Date();
    const m = month || (now.getMonth() + 1);
    const y = year || now.getFullYear();

    try {
      return await fetchApi(`/api/employee/me/attendance/summary?month=${m}&year=${y}`);
    } catch (err) {
      console.warn('⚠️ Attendance summary API error (backend bug):', err.message);
      return { present_days: 0, total_hours: 0, absent_days: 0 };
    }
  },

  // Get employee leaves history
  getLeaves: async (skip = 0, limit = 100) => {
    return fetchApi(`/api/employee/me/leaves?skip=${skip}&limit=${limit}`);
  },

  /**
   * Submit leave request.
   * API uses multipart/form-data with fields:
   *   employee_id_ignored, leave_type, start_date, end_date, total_days, reason, files[], document_types[]
   */
  submitLeave: async (leaveData, files = [], documentTypes = []) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    const formData = new FormData();
    formData.append('employee_id_ignored', '0');
    formData.append('leave_type', leaveData.leave_type || '');
    formData.append('start_date', leaveData.start_date || '');
    formData.append('end_date', leaveData.end_date || '');
    formData.append('total_days', String(leaveData.total_days || 1));
    if (leaveData.reason) formData.append('reason', leaveData.reason);

    files.forEach((file) => formData.append('files', file));
    documentTypes.forEach((dt) => formData.append('document_types', dt));

    const response = await fetch('/api/employee/me/leaves', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(txt || `Failed to submit leave (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Get leave balance — returns raw API object:
   * { employee_id, annual_entitlement, leaves_taken, leaves_pending, balance }
   * Used by the dashboard for the detailed breakdown card.
   */
  getLeaveBalanceRaw: async () => {
    const data = await fetchApi('/api/employee/me/leave-balance');
    return data;
  },

  /**
   * Get leave balance transformed to array for legacy use.
   * Returns [{ leave_type, balance, annual_entitlement, leaves_taken, leaves_pending }]
   */
  getLeaveBalance: async () => {
    const data = await fetchApi('/api/employee/me/leave-balance');
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      return [{
        leave_type: 'Annual Leave',
        balance: data.balance ?? data.annual_entitlement ?? 0,
        annual_entitlement: data.annual_entitlement ?? 0,
        leaves_taken: data.leaves_taken ?? 0,
        leaves_pending: data.leaves_pending ?? 0,
      }];
    }
    return [];
  },

  // Cancel pending leave
  cancelLeave: async (leaveId) => {
    return fetchApi(`/api/employee/me/leaves/${leaveId}`, {
      method: 'DELETE',
    });
  },

  // Get employee documents list
  getDocuments: async () => {
    return fetchApi('/api/employee/me/documents');
  },

  // Upload a document
  uploadDocument: async (file, documentType, documentName) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType || 'other');
    formData.append('document_name', documentName || file.name || 'document');

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch('/api/employee/me/documents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to upload document');
    }

    return await response.json();
  },

  // Download a document
  downloadDocument: async (documentId, fileName) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const response = await fetch(`/api/employee/me/documents/${documentId}/download`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to download document (${response.status})`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `document_${documentId}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  // Get salary history log
  getSalaryHistory: async () => {
    return fetchApi('/api/employee/me/salary-history');
  },

  // Get current salary details
  getCurrentSalary: async () => {
    return fetchApi('/api/employee/me/salary');
  },

  // Get positions history log
  getPositionHistory: async () => {
    return fetchApi('/api/employee/me/positions');
  },

  /**
   * Get document expiry tracking.
   * API returns: { passport_expiry, visa_expiry, eid_expiry, insurance_expiry,
   *                passport_days_left, visa_days_left, eid_days_left, insurance_days_left }
   * We transform to array: [{ document_name, expiry_date, days_remaining }]
   */
  getExpiries: async () => {
    const data = await fetchApi('/api/employee/me/expiries');

    // If already an array, return as-is
    if (Array.isArray(data)) return data;

    if (data && typeof data === 'object') {
      const docs = [
        { key: 'passport', label: 'Passport', expiry: data.passport_expiry, days: data.passport_days_left },
        { key: 'visa', label: 'Visa', expiry: data.visa_expiry, days: data.visa_days_left },
        { key: 'eid', label: 'Emirates ID', expiry: data.eid_expiry, days: data.eid_days_left },
        { key: 'insurance', label: 'Medical Insurance', expiry: data.insurance_expiry, days: data.insurance_days_left },
      ];

      return docs
        .filter(d => d.expiry) // only include docs with an expiry date set
        .map(d => ({
          document_name: d.label,
          document_type: d.key,
          expiry_date: d.expiry,
          days_remaining: d.days ?? 0,
        }));
    }

    return [];
  },

  /**
   * Get employee profile
   * Uses GET /api/employee/me
   */
  getProfile: async () => {
    return fetchApi('/api/employee/me');
  },

  /**
   * Update employee profile (contact info)
   * Uses PUT /api/employee/me
   * API expects: { mobile_number, personal_email, emergency_contact }
   */
  updateProfile: async (data) => {
    return fetchApi('/api/employee/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change employee password
   * Uses PUT /api/employee/me/password
   * API expects: { old_password, new_password }
   */
  changePassword: async (old_password, new_password) => {
    return fetchApi('/api/employee/me/password', {
      method: 'PUT',
      body: JSON.stringify({ old_password, new_password }),
    });
  },
};
