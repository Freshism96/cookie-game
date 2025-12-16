import { API_CONFIG } from '@/constants/game';

interface StudentData {
  name: string;
  totalCookie: number;
}

interface ApiResponse {
  result: boolean;
  data?: {
    name: string;
    totalCookie: number;
  };
  message?: string;
}

// Tester codes for testing purposes
const TESTER_CODES: Record<string, StudentData> = {
  'TESTER': { name: '테스터', totalCookie: 1000 },
  'TEST': { name: '테스트 계정', totalCookie: 500 },
  'DEMO': { name: '데모 계정', totalCookie: 300 },
};

export async function fetchStudentData(studentCode: string): Promise<StudentData | null> {
  // Check for tester codes first
  const upperCode = studentCode.toUpperCase();
  if (TESTER_CODES[upperCode]) {
    return TESTER_CODES[upperCode];
  }

  try {
    const apiKey = localStorage.getItem('custom_api_key') || API_CONFIG.apiKey;
    const response = await fetch(
      `${API_CONFIG.baseUrl}/get/student/total?code=${studentCode}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    if (result.result && result.data) {
      return {
        name: result.data.name,
        totalCookie: result.data.totalCookie
      };
    } else {
      console.error('Student verification failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('API Error:', error);
    // Return test mode data on failure
    return {
      name: '오프라인 모드',
      totalCookie: 500
    };
  }
}
