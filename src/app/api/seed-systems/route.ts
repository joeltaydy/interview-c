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
    { name: "Supabase Database", category: "Database" },
    { name: "Next.js API Routes", category: "Backend" },
    { name: "React Components", category: "Frontend" },
    { name: "User Interface", category: "Frontend" },
  ]);

  // Seed interfaces_with
  await supabase.from("interfaces_with").delete().neq("id", "");
  await supabase.from("interfaces_with").insert([
    {
      system_a_id: "Supabase Database",
      system_b_id: "Next.js API Routes",
      connection_type: "API",
      directional: 1,
    },
    {
      system_a_id: "Next.js API Routes",
      system_b_id: "React Components",
      connection_type: "Internal",
      directional: 1,
    },
    {
      system_a_id: "React Components",
      system_b_id: "User Interface",
      connection_type: "Render",
      directional: 1,
    },
  ]);

  // Seed system_hierarchy
  await supabase.from("system_hierarchy").delete().neq("child_id", "");
  await supabase.from("system_hierarchy").insert([
    { parent_id: "Supabase Database", child_id: "Next.js API Routes" },
    { parent_id: "Next.js API Routes", child_id: "React Components" },
    { parent_id: "React Components", child_id: "User Interface" },
  ]);

  return NextResponse.json({ message: "Seeded systems, interfaces, and hierarchy!" });
}