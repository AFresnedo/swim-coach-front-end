const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.453592;

export function cmToFtIn(cm: number) {
  const totalInches = cm / CM_PER_INCH;
  let ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    ft += 1;
    inches = 0;
  }
  return { ft, inches };
}

export function kgToLbs(kg: number) {
  return Math.round(kg / KG_PER_LB);
}

export function ftInToCm(ft: number, inches: number) {
  return Math.round((ft * 12 + inches) * CM_PER_INCH * 10) / 10;
}

export function lbsToKg(lbs: number) {
  return Math.round(lbs * KG_PER_LB * 10) / 10;
}

export { CM_PER_INCH, KG_PER_LB };
