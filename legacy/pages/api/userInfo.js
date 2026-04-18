import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { db } = await connectToDatabase();
  const data = req.query;
  
  // Validate admin parameter
  if (!data.admin) {
    return res.status(400).json({ error: 'Missing admin parameter' });
  }
  
  // Validate ObjectId format
  if (!ObjectId.isValid(data.admin)) {
    return res.status(400).json({ error: 'Invalid admin ID format' });
  }
  
  try {
    const docs = await db
      .collection("Admin")
      .find({ _id: new ObjectId(data.admin) })
      .toArray();
    
    // Remove sensitive data before returning
    const safeDocs = docs.map(doc => {
      const { password, ...safeUser } = doc;
      return safeUser;
    });
    
    res.send(safeDocs);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Error fetching user info" });
  }
}
