import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const blocks = await sql`
      SELECT x, y, color, owner_name, owner_link 
      FROM blocks
    `;
    return Response.json({ blocks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { x, y, color, ownerName, ownerLink } = await request.json();
    
    await sql`
      INSERT INTO blocks (x, y, color, owner_name, owner_link)
      VALUES (${x}, ${y}, ${color}, ${ownerName}, ${ownerLink})
      ON CONFLICT (x, y) DO UPDATE
      SET color = ${color},
          owner_name = ${ownerName},
          owner_link = ${ownerLink}
    `;
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}