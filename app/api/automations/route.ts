// app/api/automations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addAutomationRule } from "@/app/api/automations/store";
import type { AutomationType } from "@/app/api/automations/types";
import type { SyncTarget } from "@/lib/types";

interface CreateAutomationBody {
  userId: string;
  minAmount: number;
  targets: SyncTarget[];
  type?: AutomationType;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAutomationBody;
    const { userId, minAmount, targets, type } = body;

    if (!userId || typeof minAmount !== "number" || !Array.isArray(targets)) {
      return NextResponse.json(
        { ok: false, error: "Invalid body" },
        { status: 400 }
      );
    }

    const rule = addAutomationRule({
      userId,
      minAmount,
      targets,
      type: type ?? "high_value_deal",
    });

    return NextResponse.json({ ok: true, rule }, { status: 201 });
  } catch (err) {
    console.error("Error creating automation", err);
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
