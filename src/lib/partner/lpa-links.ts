/** Build one-tap install deep links from an LPA activation string. */

export function normalizeLpa(activationCode: string): string {
  const code = activationCode.trim();
  if (!code) return "";
  if (code.startsWith("LPA:")) return code;
  // If only SM-DP+ / matching pieces were pasted, leave as-is.
  return code;
}

export function iosEsimInstallUrl(activationCode: string): string {
  const lpa = normalizeLpa(activationCode);
  return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpa)}`;
}

export function androidEsimInstallUrl(activationCode: string): string {
  const lpa = normalizeLpa(activationCode);
  // Opens the device eSIM activation flow with the LPA activation code.
  return `intent://esim?#Intent;scheme=lpa;action=android.telephony.euicc.action.START_EUICC_ACTIVATION;S.activation_code=${encodeURIComponent(lpa)};end`;
}

export const SAMPLE_LPA =
  "LPA:1$rsp.esimaccess.mock$EZTR-SAMPLE-ABCD12";
export const SAMPLE_ICCID = "8985200123456789012";
export const SAMPLE_SMDP = "rsp.esimaccess.mock";
