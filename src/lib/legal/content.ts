import type { Locale } from "@/lib/i18n/dictionaries";
import type { LegalPageContent } from "./types";

const UPDATED = "August 1, 2026";
const UPDATED_ZH = "2026年8月1日";
const CONTACT = "support@eztravel.example.com";
const COMPANY = "ezTravel";

const privacyEn: LegalPageContent = {
  title: "Privacy Policy",
  updated: UPDATED,
  intro: [
    `This Privacy Policy explains how ${COMPANY} (“we,” “us,” or “our”) collects, uses, discloses, and protects personal information when you visit our website, create an order, purchase a travel eSIM, or contact support.`,
    "By using our services, you acknowledge the practices described in this Policy. If you do not agree, please do not use the services.",
  ],
  sections: [
    {
      heading: "1. Who we are",
      paragraphs: [
        `${COMPANY} operates an online store that sells travel eSIM data plans. For privacy inquiries, contact us at ${CONTACT}.`,
      ],
    },
    {
      heading: "2. Information we collect",
      paragraphs: ["We may collect the following categories of information:"],
      bullets: [
        "Account and order information: email address, optional WeChat ID, order reference, plan selection, destination, and purchase amount.",
        "Payment-related information: payment method chosen (Zelle, WeChat Pay, or card via Square). Card payments are processed by Square; we do not store full card numbers on our servers.",
        "eSIM fulfillment data: activation details, QR / SM-DP+ credentials, delivery status, and related provisioning logs needed to deliver your plan.",
        "Device and technical data: browser type, approximate location derived from IP address, pages viewed, referring URL, and cookie identifiers.",
        "Support communications: messages you send by email, WeChat, or our contact forms, including attachments you choose to provide.",
        "Preference data: language selection and cookie choices.",
      ],
    },
    {
      heading: "3. How we use information",
      bullets: [
        "To process orders, confirm payments, and deliver eSIM credentials.",
        "To provide customer support, troubleshooting, refunds, and service notices.",
        "To operate, secure, and improve our website and services.",
        "To detect fraud, abuse, and payment disputes.",
        "To comply with legal obligations and enforce our Terms of Service.",
        "With your consent where required (for example, non-essential cookies).",
      ],
    },
    {
      heading: "4. How we share information",
      paragraphs: [
        "We do not sell your personal information. We may share information with:",
      ],
      bullets: [
        "Payment processors and rails: Square for card payments; Zelle and WeChat Pay as directed by you for manual payments.",
        "eSIM network / wholesale suppliers that provision connectivity for the destination you purchase.",
        "Service providers that host our site, databases, email, analytics (if enabled), and security tooling, under confidentiality obligations.",
        "Professional advisors and authorities when required by law, legal process, or to protect rights, safety, and integrity of the service.",
      ],
      note: "Our suppliers may process data in the United States and other countries where they operate.",
    },
    {
      heading: "5. Retention",
      paragraphs: [
        "We retain order, payment confirmation, and eSIM delivery records for as long as reasonably necessary to fulfill the transaction, provide support, handle disputes, meet accounting and legal requirements, and maintain security logs. When retention is no longer required, we delete or de-identify information in accordance with our routines.",
      ],
    },
    {
      heading: "6. Security",
      paragraphs: [
        "We use administrative, technical, and organizational measures designed to protect personal information, including access controls, encrypted transport (HTTPS), and least-privilege practices for administrative tools. No method of transmission or storage is completely secure; please use a strong unique password for any accounts and keep your order link confidential.",
      ],
    },
    {
      heading: "7. Your privacy rights",
      paragraphs: [
        "Depending on your place of residence (including California and other U.S. states with consumer privacy laws), you may have rights to:",
      ],
      bullets: [
        "Request access to, or a copy of, personal information we hold about you.",
        "Request correction of inaccurate information.",
        "Request deletion of personal information, subject to legal exceptions (for example, completing a transaction or detecting fraud).",
        "Opt out of certain sharing that may be considered a “sale” or “sharing” under applicable law (we do not sell personal information).",
        "Appeal a denial of a consumer request where your state law provides that right.",
      ],
      note: `To exercise rights, email ${CONTACT} with the subject “Privacy Request” and enough detail for us to verify your identity and locate your records (such as order reference and email used at checkout).`,
    },
    {
      heading: "8. International users",
      paragraphs: [
        "Our services are directed primarily to customers in the United States purchasing connectivity for travel. If you access the services from outside the U.S., you understand that your information may be processed in the United States and other jurisdictions that may have different data-protection rules than your home country.",
      ],
    },
    {
      heading: "9. Children",
      paragraphs: [
        "Our services are not directed to children under 16, and we do not knowingly collect personal information from children under 16. If you believe a child has provided us information, contact us and we will take appropriate steps to delete it.",
      ],
    },
    {
      heading: "10. Cookies",
      paragraphs: [
        "We use cookies and similar technologies as described in our Cookie Policy and Manage Cookies page. You can update non-essential preferences at any time.",
      ],
    },
    {
      heading: "11. Changes",
      paragraphs: [
        "We may update this Policy from time to time. The “Last updated” date at the top will change when we do. Material changes will be highlighted on this page or communicated by other reasonable means. Continued use of the services after an update constitutes acceptance of the revised Policy where permitted by law.",
      ],
    },
    {
      heading: "12. Contact",
      paragraphs: [
        `Privacy questions and requests: ${CONTACT}`,
      ],
    },
  ],
};

const privacyZh: LegalPageContent = {
  title: "隐私政策",
  updated: UPDATED_ZH,
  intro: [
    `本隐私政策说明 ${COMPANY}（“我们”）在您访问网站、创建订单、购买旅行 eSIM 或联系客服时，如何收集、使用、披露和保护个人信息。`,
    "使用我们的服务即表示您知悉本政策所述做法。如不同意，请勿使用本服务。",
  ],
  sections: [
    {
      heading: "1. 我们是谁",
      paragraphs: [
        `${COMPANY} 运营在线旅行 eSIM 商店。隐私相关事宜请联系：${CONTACT}。`,
      ],
    },
    {
      heading: "2. 我们收集的信息",
      paragraphs: ["我们可能收集以下类别的信息："],
      bullets: [
        "账户与订单信息：电子邮箱、可选微信号、订单编号、套餐选择、目的地与支付金额。",
        "支付相关信息：所选支付方式（Zelle、微信支付或通过 Square 的银行卡）。银行卡由 Square 处理，我们不会在服务器上存储完整卡号。",
        "eSIM 履约数据：激活信息、二维码 / SM-DP+ 凭证、发货状态及为交付套餐所需的配置日志。",
        "设备与技术数据：浏览器类型、由 IP 推断的大致位置、访问页面、来源网址与 Cookie 标识。",
        "客服沟通：您通过邮件、微信或联系表单发送的内容及附件。",
        "偏好数据：语言选择与 Cookie 偏好。",
      ],
    },
    {
      heading: "3. 我们如何使用信息",
      bullets: [
        "处理订单、确认付款并交付 eSIM 凭证。",
        "提供客服支持、故障排查、退款与服务通知。",
        "运营、保障并改进网站与服务。",
        "识别欺诈、滥用与支付争议。",
        "履行法律义务并执行服务条款。",
        "在法律要求时取得您的同意（例如非必要 Cookie）。",
      ],
    },
    {
      heading: "4. 我们如何共享信息",
      paragraphs: ["我们不出售您的个人信息。我们可能与以下各方共享信息："],
      bullets: [
        "支付处理方：Square（银行卡）；以及您发起的 Zelle / 微信支付人工转账相关信息。",
        "为您所购目的地提供连接的 eSIM 批发 / 网络供应商。",
        "在保密义务下为我们提供托管、数据库、邮件、分析（如启用）与安全服务的服务商。",
        "在法律要求、法律程序或为保护权利、安全与服务完整性所必需时，与专业顾问及主管机关共享。",
      ],
      note: "我们的供应商可能在美国及其他运营所在地处理数据。",
    },
    {
      heading: "5. 保留期限",
      paragraphs: [
        "我们在完成交易、提供支持、处理争议、满足财务与法律要求以及维护安全日志所合理必要的期限内保留订单、付款确认与 eSIM 交付记录。不再需要时，将按内部流程删除或去标识化。",
      ],
    },
    {
      heading: "6. 安全措施",
      paragraphs: [
        "我们采取行政、技术与组织措施保护个人信息，包括访问控制、HTTPS 传输加密以及对管理工具的最小权限原则。任何传输或存储方式都无法保证绝对安全；请妥善保管订单链接。",
      ],
    },
    {
      heading: "7. 您的隐私权利",
      paragraphs: [
        "视您所在地区（包括加利福尼亚等美国州隐私法）而定，您可能有权：",
      ],
      bullets: [
        "请求访问或获取我们持有的关于您的个人信息副本。",
        "请求更正不准确的信息。",
        "在法律允许的例外情形之外请求删除个人信息。",
        "选择退出在适用法律下可能被视为“出售”或“共享”的行为（我们不出售个人信息）。",
        "在州法赋予权利时，对请求被拒提出申诉。",
      ],
      note: `行使权利请发送邮件至 ${CONTACT}，主题注明 “Privacy Request”，并提供足以核验身份与定位记录的信息（如下单邮箱与订单编号）。`,
    },
    {
      heading: "8. 国际用户",
      paragraphs: [
        "本服务主要面向在美国的用户购买旅行连接。若您从美国以外访问，即理解您的信息可能在美国及其他数据保护规则可能与您所在国家不同的司法辖区处理。",
      ],
    },
    {
      heading: "9. 儿童",
      paragraphs: [
        "本服务不面向 16 岁以下儿童，我们不会故意收集其个人信息。如认为儿童向我们提供了信息，请联系我们以便删除。",
      ],
    },
    {
      heading: "10. Cookie",
      paragraphs: [
        "我们按照《Cookie 政策》与“管理 Cookie”页面使用 Cookie 及类似技术。您可随时更新非必要偏好。",
      ],
    },
    {
      heading: "11. 变更",
      paragraphs: [
        "我们可能不时更新本政策，并更新页面顶部的“最近更新”日期。重大变更将在本页提示或以其他合理方式通知。在法律允许的范围内，继续使用服务即表示接受修订后的政策。",
      ],
    },
    {
      heading: "12. 联系方式",
      paragraphs: [`隐私问题与请求：${CONTACT}`],
    },
  ],
};

const legalEn: LegalPageContent = {
  title: "Legal Center",
  updated: UPDATED,
  intro: [
    `Welcome to the ${COMPANY} Legal Center. This page sets out the Terms of Service that govern your use of our website and purchase of travel eSIM plans, and points you to related legal documents.`,
    "Related documents: Privacy Policy, Cookie Policy / Manage Cookies, Trust Center, and Accessibility Statement.",
  ],
  sections: [
    {
      heading: "1. Agreement to terms",
      paragraphs: [
        `By accessing our website or placing an order, you agree to these Terms of Service (the “Terms”) and our Privacy Policy. If you do not agree, do not use the services. We may update these Terms; the “Last updated” date will reflect changes. Continued use after updates constitutes acceptance where permitted by law.`,
      ],
    },
    {
      heading: "2. Eligibility",
      paragraphs: [
        "You must be at least 18 years old (or the age of majority where you live) and able to form a binding contract to purchase from us. You represent that information you provide is accurate and that you will use eSIM products in compliance with local laws and carrier rules at your destination.",
      ],
    },
    {
      heading: "3. The product",
      paragraphs: [
        "We sell data-only travel eSIM plans for listed destinations. Coverage, speeds (including 5G where available), fair-use / FUP policies, networks, and validity are described on each plan page and may depend on local partners. eSIMs generally do not include a phone number for voice/SMS; your physical SIM or primary line may continue to handle calls and SMS where your device supports dual connectivity.",
        "Service availability, network quality, and roaming partner performance are outside our exclusive control. We do not guarantee uninterrupted or error-free connectivity.",
      ],
    },
    {
      heading: "4. Orders, pricing, and taxes",
      paragraphs: [
        "Prices are displayed in United States dollars (USD) unless otherwise stated. Approximate foreign-currency conversions shown on the site are estimates only. You are responsible for any taxes, duties, or fees that apply to your purchase where not included in the displayed price.",
        "Placing an order constitutes an offer to buy. We may refuse or cancel an order for suspected fraud, pricing error, stock/provisioning issues, or violation of these Terms.",
      ],
    },
    {
      heading: "5. Payment",
      bullets: [
        "Card payments via Square are typically confirmed instantly upon successful authorization.",
        "Zelle and WeChat Pay are manual rails: you must send the exact amount with the required order reference. We aim to confirm within one (1) hour during operating coverage; confirmation time may vary.",
        "You authorize us and our processors to charge or verify the amounts due. Failed, incomplete, or mismatched manual payments may delay or cancel fulfillment.",
      ],
    },
    {
      heading: "6. Delivery and activation",
      paragraphs: [
        "After payment is confirmed, we provision and display eSIM installation details (such as a QR code and/or activation credentials) on your order page. Delivery is digital. You are responsible for installing the eSIM on a compatible, unlocked device and for enabling data roaming on the eSIM line as instructed.",
        "Plan validity typically begins upon first network attachment in a covered area (or as otherwise stated for that plan), not merely upon purchase or installation. Install over Wi-Fi before travel when possible.",
      ],
    },
    {
      heading: "7. Refunds and cancellations",
      paragraphs: [
        "If an eSIM cannot be installed on a compatible unlocked device for reasons attributable to our provisioning, or never connects on covered networks after reasonable troubleshooting with our support team, you may request a refund of the unused plan.",
        "Refunds are generally not available after successful installation and data use, for incompatible or carrier-locked devices (including many China-mainland SKUs), for user error, or for coverage/speed variations inherent to roaming networks. Chargebacks filed without contacting support first may result in suspension of future purchases.",
      ],
    },
    {
      heading: "8. Acceptable use",
      bullets: [
        "Do not use the services for unlawful, abusive, or fraudulent purposes.",
        "Do not resell plans or credentials except as expressly permitted in writing.",
        "Do not attempt to reverse engineer, scrape at abusive scale, or interfere with our systems or supplier networks.",
        "Comply with export controls and local telecommunications regulations.",
      ],
    },
    {
      heading: "9. Intellectual property",
      paragraphs: [
        `The website, branding, text, design, and software are owned by ${COMPANY} or its licensors. You receive a limited, non-exclusive, non-transferable license to access the site for personal, non-commercial use related to purchasing and managing your eSIM orders.`,
      ],
    },
    {
      heading: "10. Disclaimers",
      paragraphs: [
        'THE SERVICES AND eSIM PLANS ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT CONNECTIVITY WILL MEET YOUR EXPECTATIONS IN EVERY LOCATION OR AT ALL TIMES.',
      ],
    },
    {
      heading: "11. Limitation of liability",
      paragraphs: [
        `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY} AND ITS SUPPLIERS SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST DATA, OR BUSINESS INTERRUPTION. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATED TO A PURCHASE OR THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO US FOR THE ORDER GIVING RISE TO THE CLAIM.`,
        "Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted.",
      ],
    },
    {
      heading: "12. Indemnity",
      paragraphs: [
        `You agree to indemnify and hold harmless ${COMPANY} and its officers, agents, and suppliers from claims arising out of your misuse of the services, violation of these Terms, or violation of applicable law, except to the extent caused by our willful misconduct.`,
      ],
    },
    {
      heading: "13. Governing law and disputes",
      paragraphs: [
        `These Terms are governed by the laws of the State of California, United States, without regard to conflict-of-law rules. Exclusive venue for disputes shall be the state or federal courts located in California, unless applicable law requires otherwise. Before filing a claim, you agree to contact us at ${CONTACT} and attempt good-faith resolution for at least thirty (30) days.`,
      ],
    },
    {
      heading: "14. Miscellaneous",
      paragraphs: [
        "If any provision is held unenforceable, the remainder remains in effect. These Terms, together with the Privacy Policy and policies referenced herein, are the entire agreement between you and us regarding the services. Our failure to enforce a provision is not a waiver. You may not assign your rights without our consent; we may assign in connection with a merger, acquisition, or sale of assets.",
      ],
    },
    {
      heading: "15. Contact",
      paragraphs: [`Legal and terms inquiries: ${CONTACT}`],
    },
  ],
};

const legalZh: LegalPageContent = {
  title: "法律中心",
  updated: UPDATED_ZH,
  intro: [
    `欢迎访问 ${COMPANY} 法律中心。本页载明规范您使用本网站及购买旅行 eSIM 套餐的《服务条款》，并指引您查阅相关法律文件。`,
    "相关文件：隐私政策、Cookie 政策 / 管理 Cookie、信任中心、无障碍声明。",
  ],
  sections: [
    {
      heading: "1. 接受条款",
      paragraphs: [
        "访问本网站或下单，即表示您同意本《服务条款》及《隐私政策》。如不同意，请勿使用服务。我们可能更新条款，并以“最近更新”日期标明；在法律允许范围内，更新后继续使用即视为接受。",
      ],
    },
    {
      heading: "2. 资格",
      paragraphs: [
        "您须年满 18 岁（或所在地法定成年年龄）并具备订立约束性合同的能力。您保证所提供信息真实准确，并在目的地遵守当地法律与运营商规定使用 eSIM。",
      ],
    },
    {
      heading: "3. 产品说明",
      paragraphs: [
        "我们出售所列目的地的纯流量旅行 eSIM。覆盖、速率（含可用时的 5G）、公平使用 / FUP、网络与有效期以各套餐页面说明为准，并可能取决于本地合作方。eSIM 通常不包含语音/短信号码；在设备支持双卡的情况下，通话与短信仍可通过主卡进行。",
        "服务可用性、网络质量与漫游合作方表现不完全由我们控制。我们不保证连接永不中断或完全无差错。",
      ],
    },
    {
      heading: "4. 订单、价格与税费",
      paragraphs: [
        "价格以美元（USD）显示（另有说明除外）。页面上的外币换算仅为估算。显示价格未包含的税费由您自行承担。",
        "下单即构成购买要约。我们可因涉嫌欺诈、定价错误、供应/配置问题或违反本条款而拒绝或取消订单。",
      ],
    },
    {
      heading: "5. 付款",
      bullets: [
        "通过 Square 的银行卡付款通常在授权成功后即时确认。",
        "Zelle 与微信支付为人工确认：您须按要求备注订单编号并转账准确金额。我们力争在运营覆盖时间内一（1）小时内确认，实际时间可能有所不同。",
        "您授权我们及处理方收取或核验应付金额。失败、不完整或不匹配的人工付款可能导致延迟或取消发货。",
      ],
    },
    {
      heading: "6. 交付与激活",
      paragraphs: [
        "付款确认后，我们将在订单页提供 eSIM 安装信息（如二维码和/或激活凭证）。交付为数字化方式。您须在兼容且已解锁的设备上安装，并按说明为 eSIM 线路开启数据漫游。",
        "套餐有效期通常自在覆盖区域首次附着网络时起算（或按该套餐另有说明），而非仅自购买或安装时起算。建议出行前在 Wi-Fi 下完成安装。",
      ],
    },
    {
      heading: "7. 退款与取消",
      paragraphs: [
        "若因我方配置原因导致 eSIM 无法在兼容已解锁设备上安装，或在合理协助排查后仍无法在覆盖网络上连接，您可申请未使用套餐的退款。",
        "成功安装并已使用流量、设备不兼容或运营商锁机（含多数中国大陆版本机型）、用户操作失误，或漫游网络固有的覆盖/速率差异，一般不予退款。未先联系客服即发起拒付，可能导致限制后续购买。",
      ],
    },
    {
      heading: "8. 可接受使用",
      bullets: [
        "不得将服务用于违法、滥用或欺诈目的。",
        "未经书面许可不得转售套餐或凭证。",
        "不得对本系统或供应商网络进行逆向工程、滥用式抓取或干扰。",
        "遵守出口管制与当地电信法规。",
      ],
    },
    {
      heading: "9. 知识产权",
      paragraphs: [
        `网站、品牌、文案、设计与软件归 ${COMPANY} 或其许可方所有。您仅获得为个人非商业用途访问网站、购买并管理 eSIM 订单的有限、非独占、不可转让许可。`,
      ],
    },
    {
      heading: "10. 免责声明",
      paragraphs: [
        "在法律允许的最大范围内，服务与 eSIM 套餐按“现状”和“可用”提供。我们不作任何明示或默示保证，包括适销性、特定用途适用性与不侵权。我们不保证连接在所有地点、所有时间均符合您的预期。",
      ],
    },
    {
      heading: "11. 责任限制",
      paragraphs: [
        `在法律允许的最大范围内，${COMPANY} 及其供应商不对间接、附带、特殊、后果性、惩戒性或惩罚性损害，或利润损失、数据丢失或业务中断承担责任。因购买或本条款引起的任何索赔，我们的总责任不超过您就该订单向我们支付的金额。`,
        "部分司法辖区不允许某些限制；在此情况下，责任限制以法律允许的最大范围为限。",
      ],
    },
    {
      heading: "12. 赔偿",
      paragraphs: [
        `除因我方故意不当行为导致的情形外，您同意就因滥用服务、违反本条款或违反适用法律而产生的索赔，赔偿并使 ${COMPANY} 及其管理人员、代理人与供应商免受损害。`,
      ],
    },
    {
      heading: "13. 适用法律与争议",
      paragraphs: [
        `本条款受美国加利福尼亚州法律管辖（不考虑冲突法规则）。争议专属管辖地为加利福尼亚州州法院或联邦法院，适用法律另有强制规定除外。提起诉讼前，您同意通过 ${CONTACT} 联系我们并善意协商至少三十（30）日。`,
      ],
    },
    {
      heading: "14. 其他",
      paragraphs: [
        "任一条款被认定不可执行时，其余条款继续有效。本条款连同隐私政策及其中援引的政策构成您与我们之间关于服务的完整协议。我们未行使某项权利不构成弃权。未经同意您不得转让权利；我们可在合并、收购或资产出售时转让。",
      ],
    },
    {
      heading: "15. 联系方式",
      paragraphs: [`法律与条款相关：${CONTACT}`],
    },
  ],
};

const trustEn: LegalPageContent = {
  title: "Trust Center",
  updated: UPDATED,
  intro: [
    `The ${COMPANY} Trust Center summarizes how we protect customers, payments, and personal data when you buy a travel eSIM.`,
    "This page is an overview. Binding terms appear in our Legal Center (Terms of Service) and Privacy Policy.",
  ],
  sections: [
    {
      heading: "Payments you can verify",
      paragraphs: [
        "Card payments are processed by Square. Manual Zelle and WeChat Pay transfers require your order reference in the memo so we can match payment to order. We confirm manual payments as quickly as practical, targeting within one hour.",
      ],
    },
    {
      heading: "Digital delivery you control",
      paragraphs: [
        "After payment confirmation, your eSIM QR code and activation details appear on a unique order page tied to your email. Keep that link private. You can install before you fly; most plans start when the eSIM first connects in a covered destination.",
      ],
    },
    {
      heading: "Refunds when it will not work",
      paragraphs: [
        "If your eSIM cannot be installed on a compatible unlocked device due to our provisioning, or never connects after we troubleshoot with you, we will refund the unused plan as described in our Terms.",
      ],
    },
    {
      heading: "Data handling",
      bullets: [
        "HTTPS encryption in transit for the website.",
        "We do not store full payment card numbers.",
        "Access to order and admin tools is restricted.",
        "We do not sell personal information.",
      ],
      note: "Full details are in the Privacy Policy.",
    },
    {
      heading: "Human support",
      paragraphs: [
        `Bilingual support (English / Chinese) is available at ${CONTACT} and via WeChat as published on the Support page. We help with installation, compatibility, and payment matching.`,
      ],
    },
    {
      heading: "Device compatibility",
      paragraphs: [
        "eSIM requires a compatible, unlocked device. Many phones sold for the China mainland market do not support eSIM. Use our Compatibility checker and the *#06# EID test before you buy.",
      ],
    },
    {
      heading: "Report a security issue",
      paragraphs: [
        `If you believe you have found a vulnerability affecting customer data or payments, email ${CONTACT} with the subject “Security Report.” Please do not publicly disclose details until we have had a reasonable chance to investigate.`,
      ],
    },
  ],
};

const trustZh: LegalPageContent = {
  title: "信任中心",
  updated: UPDATED_ZH,
  intro: [
    `${COMPANY} 信任中心概述我们在您购买旅行 eSIM 时如何保护客户、付款与个人数据。`,
    "本页为概览。具有约束力的条款见法律中心（服务条款）与隐私政策。",
  ],
  sections: [
    {
      heading: "可核验的付款",
      paragraphs: [
        "银行卡付款由 Square 处理。Zelle 与微信支付需在备注中填写订单编号以便核对。我们尽快确认人工付款，目标为一小时内。",
      ],
    },
    {
      heading: "由您掌控的数字交付",
      paragraphs: [
        "付款确认后，eSIM 二维码与激活信息显示在与您邮箱关联的专属订单页。请妥善保管该链接。可在起飞前安装；多数套餐在覆盖目的地首次联网时开始计时。",
      ],
    },
    {
      heading: "无法使用时的退款",
      paragraphs: [
        "若因我方配置导致无法在兼容已解锁设备上安装，或经协助排查后仍无法连接，我们将按服务条款退还未使用套餐。",
      ],
    },
    {
      heading: "数据处理",
      bullets: [
        "网站使用 HTTPS 加密传输。",
        "不存储完整银行卡号。",
        "订单与管理工具访问受限。",
        "不出售个人信息。",
      ],
      note: "完整说明见隐私政策。",
    },
    {
      heading: "真人客服",
      paragraphs: [
        `中英双语客服：${CONTACT}，以及支持页公布的微信。协助安装、兼容性与付款核对。`,
      ],
    },
    {
      heading: "设备兼容",
      paragraphs: [
        "eSIM 需要兼容且已解锁的设备。许多中国大陆销售机型不支持 eSIM。购买前请使用兼容查询与 *#06# EID 检测。",
      ],
    },
    {
      heading: "报告安全问题",
      paragraphs: [
        `如发现可能影响客户数据或付款的漏洞，请发送邮件至 ${CONTACT}，主题注明 “Security Report”。在我们有合理时间调查前，请勿公开披露细节。`,
      ],
    },
  ],
};

const cookiesEn: LegalPageContent = {
  title: "Cookie Policy",
  updated: UPDATED,
  intro: [
    `This Cookie Policy explains how ${COMPANY} uses cookies and similar technologies on our website, and how you can manage your preferences.`,
    "For personal data practices more broadly, see our Privacy Policy.",
  ],
  sections: [
    {
      heading: "1. What are cookies?",
      paragraphs: [
        "Cookies are small text files stored on your device when you visit a website. They help the site function, remember preferences, and (if enabled) understand how the site is used.",
      ],
    },
    {
      heading: "2. Cookies we use",
      bullets: [
        "Strictly necessary: required for core functions such as security, load balancing, admin session authentication (for authorized staff), and remembering that you submitted essential choices. These cannot be switched off in our controls without breaking the site.",
        "Preferences: remember settings such as your language (locale) selection so the site stays in English or Chinese.",
        "Analytics (optional): if enabled, help us understand aggregate traffic and improve the product. We will not set optional analytics cookies unless you allow them.",
      ],
    },
    {
      heading: "3. Legal bases",
      paragraphs: [
        "Where required by law, we rely on necessity for strictly necessary cookies and on your consent for non-essential cookies. You may withdraw consent at any time using Manage Cookies below or browser controls.",
      ],
    },
    {
      heading: "4. Browser controls",
      paragraphs: [
        "Most browsers let you block or delete cookies via settings. Blocking strictly necessary cookies may prevent checkout, language persistence, or login to administrative tools from working correctly.",
      ],
    },
    {
      heading: "5. Updates",
      paragraphs: [
        "We may update this Cookie Policy when our practices change. Check the “Last updated” date on this page.",
      ],
    },
    {
      heading: "6. Contact",
      paragraphs: [`Questions: ${CONTACT}`],
    },
  ],
};

const cookiesZh: LegalPageContent = {
  title: "Cookie 政策",
  updated: UPDATED_ZH,
  intro: [
    `本 Cookie 政策说明 ${COMPANY} 如何在网站上使用 Cookie 及类似技术，以及您如何管理偏好。`,
    "更广泛的个人信息处理见《隐私政策》。",
  ],
  sections: [
    {
      heading: "1. 什么是 Cookie？",
      paragraphs: [
        "Cookie 是您访问网站时存储在设备上的小型文本文件，用于保障网站运行、记住偏好，并在启用时了解网站使用情况。",
      ],
    },
    {
      heading: "2. 我们使用的 Cookie",
      bullets: [
        "严格必要：用于安全、负载、管理员会话（授权人员）以及记住您已提交的必要选择等核心功能。关闭后网站可能无法正常工作。",
        "偏好：记住语言（区域）等设置，使网站保持英文或中文。",
        "分析（可选）：如启用，帮助我们了解总体流量并改进产品。未经您允许，我们不会设置可选分析 Cookie。",
      ],
    },
    {
      heading: "3. 法律依据",
      paragraphs: [
        "在法律要求时，严格必要 Cookie 基于必要性，非必要 Cookie 基于您的同意。您可随时通过下方“管理 Cookie”或浏览器设置撤回同意。",
      ],
    },
    {
      heading: "4. 浏览器控制",
      paragraphs: [
        "大多数浏览器允许拦截或删除 Cookie。拦截严格必要 Cookie 可能导致结账、语言保持或管理工具登录异常。",
      ],
    },
    {
      heading: "5. 更新",
      paragraphs: [
        "实践变更时我们可能更新本政策，请查看本页“最近更新”日期。",
      ],
    },
    {
      heading: "6. 联系方式",
      paragraphs: [`相关问题：${CONTACT}`],
    },
  ],
};

const accessibilityEn: LegalPageContent = {
  title: "Accessibility Statement",
  updated: UPDATED,
  intro: [
    `${COMPANY} is committed to providing a website that is accessible to as many people as possible, including people with disabilities.`,
    "We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA where reasonably practicable for a commerce experience that includes maps of destinations, plan comparisons, and payment flows.",
  ],
  sections: [
    {
      heading: "Measures we take",
      bullets: [
        "Semantic headings and labels on key forms (checkout, order lookup, language controls).",
        "Keyboard-accessible navigation and focusable controls for primary actions.",
        "Text alternatives for meaningful non-text content where provided.",
        "Color contrast intended to remain readable on our dark theme for body text and primary controls.",
        "Support for browser zoom and responsive layouts on common screen sizes.",
      ],
    },
    {
      heading: "Known limitations",
      paragraphs: [
        "Some third-party embedded content (for example, payment processors or media) may not fully meet WCAG. Complex data tables for plan comparison and horizontal destination carousels may present challenges for some assistive technologies. We continue to improve these experiences.",
      ],
    },
    {
      heading: "Compatibility",
      paragraphs: [
        "The site is designed to work with current versions of major browsers (Chrome, Safari, Firefox, Edge) and common assistive technologies. Accessibility support may vary by browser and OS version.",
      ],
    },
    {
      heading: "Feedback",
      paragraphs: [
        `If you encounter an accessibility barrier, please email ${CONTACT} with the subject “Accessibility,” the page URL, a description of the issue, and your assistive technology if relevant. We will review requests in good faith and respond within a reasonable time.`,
      ],
    },
    {
      heading: "Enforcement and alternatives",
      paragraphs: [
        "If you need information from this site in an alternative format, contact us and we will work with you to provide a reasonable alternative where feasible (for example, assisting with an order by email).",
      ],
    },
  ],
};

const accessibilityZh: LegalPageContent = {
  title: "无障碍声明",
  updated: UPDATED_ZH,
  intro: [
    `${COMPANY} 致力于让尽可能多的人（包括残障人士）能够使用本网站。`,
    "我们以 Web 内容无障碍指南（WCAG）2.1 AA 级为目标，在目的地浏览、套餐对比与支付流程等商务场景中在合理可行范围内加以落实。",
  ],
  sections: [
    {
      heading: "我们采取的措施",
      bullets: [
        "关键表单（结账、订单查询、语言切换）使用语义化标题与标签。",
        "主要操作支持键盘导航与可聚焦控件。",
        "在提供时为有意义的非文本内容配备文本替代。",
        "深色主题下正文与主要控件保持可读对比度。",
        "支持浏览器缩放，并在常见屏幕尺寸下响应式布局。",
      ],
    },
    {
      heading: "已知限制",
      paragraphs: [
        "部分第三方嵌入内容（如支付处理方或媒体）可能无法完全符合 WCAG。套餐对比的复杂表格与横向目的地列表可能对部分辅助技术造成困难。我们持续改进这些体验。",
      ],
    },
    {
      heading: "兼容性",
      paragraphs: [
        "网站面向主流浏览器（Chrome、Safari、Firefox、Edge）当前版本及常见辅助技术设计。支持程度可能因浏览器与操作系统版本而异。",
      ],
    },
    {
      heading: "反馈",
      paragraphs: [
        `如遇到无障碍障碍，请发送邮件至 ${CONTACT}，主题注明 “Accessibility”，并说明页面网址、问题描述及相关辅助技术。我们将善意审阅并在合理时间内回复。`,
      ],
    },
    {
      heading: "替代方案",
      paragraphs: [
        "如需以替代格式获取本站信息，请联系我们；在可行范围内我们将提供合理替代（例如通过邮件协助下单）。",
      ],
    },
  ],
};

export type LegalSlug =
  | "privacy"
  | "legal"
  | "trust"
  | "cookies"
  | "accessibility";

const pages: Record<LegalSlug, Record<Locale, LegalPageContent>> = {
  privacy: { en: privacyEn, zh: privacyZh },
  legal: { en: legalEn, zh: legalZh },
  trust: { en: trustEn, zh: trustZh },
  cookies: { en: cookiesEn, zh: cookiesZh },
  accessibility: { en: accessibilityEn, zh: accessibilityZh },
};

export function getLegalPage(slug: LegalSlug, locale: Locale): LegalPageContent {
  return pages[slug][locale];
}

export const linkDirectory: Record<
  Locale,
  {
    title: string;
    updated: string;
    intro: string;
    groups: { heading: string; links: { href: string; label: string }[] }[];
  }
> = {
  en: {
    title: "Link Directory",
    updated: UPDATED,
    intro:
      "A directory of primary ezTravel pages for customers, support, and legal information.",
    groups: [
      {
        heading: "Shop",
        links: [
          { href: "/", label: "Home" },
          { href: "/destinations", label: "Destinations" },
          { href: "/destinations?tab=local", label: "Local eSIMs" },
          { href: "/destinations?tab=regional", label: "Regional bundles" },
          { href: "/destinations?tab=global", label: "Global eSIMs" },
        ],
      },
      {
        heading: "Learn & support",
        links: [
          { href: "/how-it-works", label: "How it works" },
          { href: "/compatibility", label: "Compatibility" },
          { href: "/support", label: "Support" },
          { href: "/order", label: "Find my order" },
          { href: "/cart", label: "Cart" },
        ],
      },
      {
        heading: "Trust & legal",
        links: [
          { href: "/trust", label: "Trust center" },
          { href: "/privacy", label: "Privacy policy" },
          { href: "/legal", label: "Legal center" },
          { href: "/cookies", label: "Manage cookies" },
          { href: "/accessibility", label: "Accessibility statement" },
          { href: "/links", label: "Link directory" },
        ],
      },
    ],
  },
  zh: {
    title: "链接目录",
    updated: UPDATED_ZH,
    intro: "ezTravel 主要页面目录，涵盖购物、支持与法律信息。",
    groups: [
      {
        heading: "商店",
        links: [
          { href: "/", label: "首页" },
          { href: "/destinations", label: "目的地" },
          { href: "/destinations?tab=local", label: "单国 eSIM" },
          { href: "/destinations?tab=regional", label: "多国套餐" },
          { href: "/destinations?tab=global", label: "全球 eSIM" },
        ],
      },
      {
        heading: "了解与支持",
        links: [
          { href: "/how-it-works", label: "使用流程" },
          { href: "/compatibility", label: "兼容查询" },
          { href: "/support", label: "客服支持" },
          { href: "/order", label: "查询订单" },
          { href: "/cart", label: "购物车" },
        ],
      },
      {
        heading: "信任与法律",
        links: [
          { href: "/trust", label: "信任中心" },
          { href: "/privacy", label: "隐私政策" },
          { href: "/legal", label: "法律中心" },
          { href: "/cookies", label: "管理 Cookie" },
          { href: "/accessibility", label: "无障碍声明" },
          { href: "/links", label: "链接目录" },
        ],
      },
    ],
  },
};
