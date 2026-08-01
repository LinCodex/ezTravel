import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCartGroup, generateOrderRef } from "@/lib/utils";

type PaymentMethod = "ZELLE" | "WECHAT" | "SQUARE";

type IncomingItem = {
  planId?: string;
  days?: number;
  qty?: number;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function buildOrderLines(items: IncomingItem[]) {
  const lines: Array<{
    planId: string;
    days: number;
    amountUsd: number;
  }> = [];

  for (const raw of items) {
    if (!raw.planId) continue;
    const plan = await prisma.plan.findUnique({ where: { id: raw.planId } });
    if (!plan || !plan.visible) {
      return { error: NextResponse.json({ error: "plan not found" }, { status: 404 }) };
    }
    const isDaily = plan.dataType === "Daily Unlimited";
    const days = isDaily
      ? Math.min(Math.max(Math.floor(raw.days ?? 1), 1), 90)
      : 1;
    const qty = Math.min(Math.max(Math.floor(raw.qty ?? 1), 1), 20);
    const unit = Math.round(plan.priceUsd * days * 100) / 100;
    for (let i = 0; i < qty; i++) {
      lines.push({ planId: plan.id, days, amountUsd: unit });
    }
  }

  if (lines.length === 0) {
    return { error: NextResponse.json({ error: "no items" }, { status: 400 }) };
  }
  if (lines.length > 30) {
    return {
      error: NextResponse.json({ error: "too many items" }, { status: 400 }),
    };
  }

  return { lines };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const {
    planId,
    days,
    items: rawItems,
    email,
    wechatId,
    paymentMethod,
  } = body as {
    planId?: string;
    days?: number;
    items?: IncomingItem[];
    email?: string;
    wechatId?: string;
    paymentMethod?: string;
  };

  if (
    !email ||
    !isValidEmail(email) ||
    !["ZELLE", "WECHAT", "SQUARE"].includes(paymentMethod ?? "")
  ) {
    return NextResponse.json({ error: "invalid parameters" }, { status: 400 });
  }

  const method = paymentMethod as PaymentMethod;
  const status =
    method === "SQUARE" ? "AWAITING_PAYMENT" : "AWAITING_CONFIRMATION";
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedWechat = wechatId?.trim() || null;

  const incoming: IncomingItem[] =
    Array.isArray(rawItems) && rawItems.length > 0
      ? rawItems
      : planId
        ? [{ planId, days, qty: 1 }]
        : [];

  const built = await buildOrderLines(incoming);
  if ("error" in built && built.error) return built.error;
  const lines = built.lines!;

  const cartGroup = lines.length > 1 ? generateCartGroup() : null;
  const orderRefs: string[] = [];
  let totalUsd = 0;

  await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const orderRef = generateOrderRef();
      orderRefs.push(orderRef);
      totalUsd += line.amountUsd;
      await tx.order.create({
        data: {
          orderRef,
          cartGroup,
          planId: line.planId,
          days: line.days,
          email: normalizedEmail,
          wechatId: normalizedWechat,
          paymentMethod: method,
          amountUsd: line.amountUsd,
          status,
        },
      });
    }
  });

  totalUsd = Math.round(totalUsd * 100) / 100;

  if (cartGroup) {
    return NextResponse.json({
      cartGroup,
      orderRefs,
      totalUsd,
      orderRef: orderRefs[0],
    });
  }

  return NextResponse.json({ orderRef: orderRefs[0], totalUsd });
}
