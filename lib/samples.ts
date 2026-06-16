import type { InputType } from "./types";

export type Sample = {
  id: "reactAuthBug" | "apiValidationBug" | "sqlInjectionRisk";
  title: string;
  inputType: InputType;
  content: string;
};

export const samples: Record<Sample["id"], Sample> = {
  reactAuthBug: {
    id: "reactAuthBug",
    title: "React auth bug",
    inputType: "diff",
    content: `diff --git a/app/admin/users/page.tsx b/app/admin/users/page.tsx
--- a/app/admin/users/page.tsx
+++ b/app/admin/users/page.tsx
@@ -12,8 +12,11 @@ export default async function UsersPage({ searchParams }) {
-  const session = await getSession()
-  if (!session?.user?.isAdmin) redirect("/")
+  const userId = searchParams.userId
+  const user = await getUser(userId)
 
   return (
     <UserTable user={user} />
   )
 }`,
  },
  apiValidationBug: {
    id: "apiValidationBug",
    title: "API validation bug",
    inputType: "files",
    content: `File: app/api/invoices/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  await createInvoice({
    amount: body.amount,
    email: body.email,
    dueDate: body.dueDate
  })
  return Response.json({ ok: true })
}`,
  },
  sqlInjectionRisk: {
    id: "sqlInjectionRisk",
    title: "SQL injection risk",
    inputType: "files",
    content: "File: lib/users.ts\nexport function getUser(id: string) {\n  const query = `select * from users where id = ${id}`\n  return db.query(query)\n}",
  },
};

export const sampleList = Object.values(samples);
