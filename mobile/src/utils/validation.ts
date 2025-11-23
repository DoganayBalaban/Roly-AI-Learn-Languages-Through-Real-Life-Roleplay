export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCredentials = (
  email: string, 
  password: string, 
  fullName?: string, 
  isRegistering: boolean = false
) => {
  if (!email || !password) {
    return "Lütfen tüm alanları doldurun.";
  }

  if (!isValidEmail(email)) {
    return "Geçerli bir e-posta adresi girin.";
  }

  if (password.length < 6) {
    return "Şifre en az 6 karakter olmalıdır.";
  }

  if (isRegistering) {
    if (!fullName) return "İsim alanı zorunludur.";
    if (fullName.length < 2) return "İsim en az 2 karakter olmalıdır.";
  }

  return null; // Hata yok
};