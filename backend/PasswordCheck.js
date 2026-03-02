// password validation req #10
// 8+ chars
// starts with a letter
// contains a letter, number, and special character

export function passwordCheck(password) {
  if (!password) return false;

  if (password.length < 8) return false;
  if (!/^[A-Za-z]/.test(password)) return false;
  if (!/[A-Za-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}
