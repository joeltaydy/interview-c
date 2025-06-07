import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  // Seed systems
  await supabase.from("systems").delete().neq("name", "");
  await supabase.from("systems").insert([
    { name: "System A", category: "Alpha" },
    { name: "System B", category: "Beta" },
    { name: "System C", category: "Gamma" },
    { name: "System D", category: "Delta" },
    { name: "System E", category: "Epsilon" },
  ]);

  // Seed interfaces_with
  await supabase.from("interfaces_with").delete().neq("id", "");
  await supabase.from("interfaces_with").insert([
    {
      system_a_id: "System A",
      system_b_id: "System B",
      connection_type: "API",
      directional: 1,
    },
    {
      system_a_id: "System B",
      system_b_id: "System C",
      connection_type: "Internal",
      directional: 1,
    },
    {
      system_a_id: "System A",
      system_b_id: "System D",
      connection_type: "Render",
      directional: 1,
    },
  ]);

  // Seed system_hierarchy
  await supabase.from("system_hierarchy").delete().neq("child_id", "");
  await supabase.from("system_hierarchy").insert([
    { parent_id: "System A", child_id: "System C" },
    { parent_id: "System E", child_id: "System D" },
  ]);

  return NextResponse.json({
    message: "Seeded systems, interfaces, and hierarchy!",
  });
}
