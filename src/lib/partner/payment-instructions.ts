/** Master-portal payment destinations shown to partners for balance top-ups. */

export type PartnerPayMethod = "ZELLE" | "VENMO" | "WECHAT" | "CASH";

export function getPartnerPaymentInstructions(method: PartnerPayMethod) {
  const zelleName = process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_NAME || "ezTravel LLC";
  const zelleHandle =
    process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_HANDLE || "pay@eztravel.example.com";
  const venmo =
    process.env.NEXT_PUBLIC_VENMO_HANDLE || process.env.NEXT_PUBLIC_ZELLE_RECIPIENT_HANDLE || "@ezTravel";
  const wechat =
    process.env.NEXT_PUBLIC_WECHAT_ID || "ezTravelPay";
  const cashNote =
    process.env.NEXT_PUBLIC_CASH_INSTRUCTIONS ||
    "Arrange cash drop-off / pickup with partner support, then submit this request with the INV memo.";

  switch (method) {
    case "ZELLE":
      return {
        title: "Send Zelle",
        lines: [
          `Recipient name: ${zelleName}`,
          `Zelle email / phone: ${zelleHandle}`,
          "Include your INV number in the payment memo.",
        ],
        note: "After you send payment, keep this request pending — master portal verifies receipt and credits your balance.",
      };
    case "VENMO":
      return {
        title: "Send Venmo",
        lines: [
          `Venmo username: ${venmo}`,
          "Include your INV number in the payment note.",
        ],
        note: "Balance updates only after master portal confirms the Venmo transfer.",
      };
    case "WECHAT":
      return {
        title: "Send WeChat Pay",
        lines: [
          `WeChat ID: ${wechat}`,
          "Message the INV number with your payment screenshot.",
        ],
        note: "Master portal verifies WeChat receipt manually before crediting balance.",
      };
    case "CASH":
      return {
        title: "Cash payment",
        lines: [cashNote, "Reference your INV number when coordinating."],
        note: "Cash is verified manually by master portal staff.",
      };
  }
}
