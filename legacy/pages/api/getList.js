import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req,res){
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    const data  = req.query
    
    // Validate admin parameter exists
    if (!data.admin) {
        return res.status(400).json({ error: 'Missing admin parameter' });
    }
    
    // Only allow specific safe fields for filtering
    const allowedFields = ['admin', 'date'];
    const filter = {};
    
    for (const field of allowedFields) {
        if (data[field]) {
            filter[field] = data[field];
        }
    }
    
    await db.collection('Queue').find(filter).toArray()
    .then((result)=>{
        res.json(result);
    }) 
    .catch((err)=>{
        console.error("Database error:", err);
        res.status(500).json({ error: "Error fetching queue" });
    })

}