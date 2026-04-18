import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req,res){
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    
    await db.collection('Admin').find({}).toArray()
    .then((result)=>{
        // Remove sensitive data (passwords) before returning
        const safeResult = result.map(admin => {
            const { password, ...safeAdmin } = admin;
            return safeAdmin;
        });
        res.json(safeResult);
    }) 
    .catch((err)=>{
        console.error("Database error:", err);
        res.status(500).json({ error: "Error fetching admin list" });
    })
}
