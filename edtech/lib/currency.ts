export const USD_TO_UGX = 3700;

export function formatUgx(amount: number) {
  return `UGX ${Math.round(amount).toLocaleString("en-UG")}`;
}
