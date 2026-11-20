export const phoneOk = (v: string) => {
  const s = v.trim();
  const digits = s.replace(/\D/g, "");
  return /^[+\d\s()\-.]+$/.test(s) && digits.length >= 7 && digits.length <= 15;
};
export const socialOk = (v: string) => /^@?[A-Za-z0-9._]{2,32}$/.test(v.trim());
export const normSocial = (v: string) => {
  const s = v.trim();
  return s ? (s.startsWith("@") ? s : "@" + s) : "";
};
