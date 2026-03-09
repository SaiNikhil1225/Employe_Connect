const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth-token');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

export interface HolidayEntry {
    _id?: string;
    name: string;
    date: string; // ISO string
    type?: 'PUBLIC' | 'OPTIONAL' | 'REGIONAL';
    description?: string;
}

export interface HolidayCalendar {
    _id?: string;
    title: string;
    year: number;
    country: string;
    state?: string;
    client?: string;
    bannerImage?: string;
    holidays: HolidayEntry[];
    isActive: boolean;
    employeeCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AssignedEmployee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    location?: string;
}

export async function getHolidayCalendars(filters?: { year?: number; country?: string; isActive?: boolean }): Promise<HolidayCalendar[]> {
    const params = new URLSearchParams();
    if (filters?.year) params.set('year', String(filters.year));
    if (filters?.country) params.set('country', filters.country);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));

    const res = await fetch(`${API_URL}/holiday-calendars?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch calendars');
    return data.data;
}

export async function getHolidayCalendarById(id: string): Promise<HolidayCalendar> {
    const res = await fetch(`${API_URL}/holiday-calendars/${id}`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch calendar');
    return data.data;
}

export async function createHolidayCalendar(payload: Omit<HolidayCalendar, '_id' | 'employeeCount' | 'createdAt' | 'updatedAt'>): Promise<HolidayCalendar> {
    const res = await fetch(`${API_URL}/holiday-calendars`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create calendar');
    return data.data;
}

export async function updateHolidayCalendar(id: string, payload: Partial<HolidayCalendar>): Promise<HolidayCalendar> {
    const res = await fetch(`${API_URL}/holiday-calendars/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update calendar');
    return data.data;
}

export async function deleteHolidayCalendar(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/holiday-calendars/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete calendar');
}

export async function getAssignedEmployees(calendarId: string): Promise<AssignedEmployee[]> {
    const res = await fetch(`${API_URL}/holiday-calendars/${calendarId}/employees`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch assigned employees');
    return data.data;
}

export async function assignCalendarToEmployees(calendarId: string, employeeIds: string[]): Promise<string> {
    const res = await fetch(`${API_URL}/holiday-calendars/${calendarId}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ employeeIds }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to assign calendar');
    return data.message;
}

export async function bulkAssignByLocation(calendarId: string, location: string): Promise<string> {
    const res = await fetch(`${API_URL}/holiday-calendars/${calendarId}/assign-by-location`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ location }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to bulk assign by location');
    return data.message;
}

export async function bulkAssignByDepartment(calendarId: string, department: string): Promise<string> {
    const res = await fetch(`${API_URL}/holiday-calendars/${calendarId}/assign-by-dept`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ department }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to bulk assign by department');
    return data.message;
}

export async function unassignEmployee(calendarId: string, empId: string): Promise<string> {
    const res = await fetch(`${API_URL}/holiday-calendars/${calendarId}/unassign/${empId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to unassign employee');
    return data.message;
}
