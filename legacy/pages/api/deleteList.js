import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req,res){
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { db } = await connectToDatabase()
    
    const data  = req.query
    
    // Validate admin parameter exists
    if (!data.admin) {
        return res.status(400).json({ error: 'Missing admin parameter' });
    }
    
    // Only delete based on admin field, prevent arbitrary field injection
    const filter = { admin: data.admin };
    
    // Optionally add date restriction if provided
    if (data.date) {
        filter.date = data.date;
    }
    
    await db.collection('Queue').deleteMany(filter)
    .then(()=>{
        res.json({ message : "deleted" });
    }) 
    .catch((err)=>{
        console.error("Database error:", err);
        res.status(500).json({ error: "Error deleting queue items" });
    })

}