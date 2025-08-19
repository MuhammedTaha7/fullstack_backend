export const baseUrl='http://localhost:8080/api';
// export const baseUrl = '/api';

// const isDevelopment = process.env.NODE_ENV === 'development';
// const isLocalDevelopment = window.location.hostname === 'localhost' && window.location.port === '3000';

// export const baseUrl = isDevelopment || isLocalDevelopment 
//   ? 'http://localhost:8080/api'  // For local development
//   : '/api';  // For Docker/production (relative URL)

// login Api's
export const LOGIN = `${baseUrl}/login`;

export const REGISTER = `${baseUrl}/register`;
export const LOGOUT = `${baseUrl}/logout`;
export const FORGOT_PASSWORD = `${baseUrl}/forgot-password`;
export const RESET_PASSWORD = `${baseUrl}/reset-password`;
export const VERIFY_EMAIL = `${baseUrl}/verify-email`;
export const PROFILE = `${baseUrl}/profile`;

// user Api's
export const GET_USER = `${baseUrl}/user`;
export const VERIFY_TOKEN = `${baseUrl}/verify-token`;
export const RESEND_EMAIL = `${baseUrl}/resend-email`;
export const UPDATE_PROFILE = `${baseUrl}/update-profile`;
export const CHANGE_PASSWORD = `${baseUrl}/change-password`;


export const GENERATE_REPORT = `${baseUrl}/generate-report`;