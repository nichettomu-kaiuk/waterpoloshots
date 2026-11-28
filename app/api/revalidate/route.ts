import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_DATA_TAG } from "@/lib/supabase/public";

// Called by the Admin panel after it saves something: purges the cached
// public data and pages so visitors see the change right away. Only a
// signed-in admin can trigger it.
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  revalidateTag(PUBLIC_DATA_TAG);
  revalidatePath("/[tournament]", "layout");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
