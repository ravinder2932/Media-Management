export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const checkSessionTimeout = (lastActivity: Date): boolean => {
  const now = new Date();
  const timeDiff = now.getTime() - lastActivity.getTime();
  return timeDiff < SESSION_TIMEOUT;
};

export const generatePassword = (length = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};