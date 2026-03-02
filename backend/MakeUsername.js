// first initial + last name + MMYY req #20

export function makeUsername(firstName, lastName) {
  const first = (firstName || "").trim().charAt(0).toLowerCase();
  const last = (lastName || "").trim().toLowerCase();

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);

  return first + last + month + year;
}
