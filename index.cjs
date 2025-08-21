// index.js
// Run: node index.js
// If using Atlas, replace uri with your atlas connection string (mongodb+srv://...).

const { MongoClient } = require("mongodb");

let uri = "mongodb+srv://maheshug23it:72UoRJyCZmAtyKTD@cluster0.vktapld.mongodb.net/"; // local MongoDB
// Example Atlas (uncomment & replace): 
// uri = "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // 1) fullstackDB -> users & books
    const fullstackDB = client.db("fullstackDB");
    const users = fullstackDB.collection("users");
    const books = fullstackDB.collection("books");

    // Insert user
    await users.insertOne({ name: "Arun", email: "arun@gmail.com", role: "student" });
    const user = await users.findOne({ email: "arun@gmail.com" });
    console.log("[users] inserted/fetched:", user);

    // Insert book
    const bookRes = await books.insertOne({ title: "React Guide", author: "Admin" });
    const book = await books.findOne({ _id: bookRes.insertedId });
    console.log("[books] inserted/fetched:", book);

    // 2) schoolDB -> students (seed, CRUD, aggregation)
    const schoolDB = client.db("schoolDB");
    const students = schoolDB.collection("students");

    // Clean and seed
    await students.deleteMany({});
    const seed = [
      { name: "Karthik", rollNo: 101, department: "CSE",  marks: 92 },
      { name: "Priya",   rollNo: 102, department: "ECE",  marks: 78 },
      { name: "Anu",     rollNo: 103, department: "CSE",  marks: 85 },
      { name: "Rahul",   rollNo: 104, department: "MECH", marks: 67 },
      { name: "Varun",   rollNo: 105, department: "ECE",  marks: 88 }
    ];
    await students.insertMany(seed);
    console.log("\n[students] seeded:", seed.length);

    // READ: all
    const all = await students.find().toArray();
    console.log("\nAll students:", all.map(s => `${s.rollNo}-${s.name}(${s.marks})`).join(", "));

    // READ: marks > 80 (mini activity)
    const gt80 = await students.find({ marks: { $gt: 80 } }).toArray();
    console.log("Marks > 80:", gt80.map(s => `${s.name}(${s.marks})`).join(", "));

    // UPDATE: Priya's marks -> 82
    const upd = await students.updateOne({ rollNo: 102 }, { $set: { marks: 82 } });
    console.log("\nUpdate result (Priya): modifiedCount =", upd.modifiedCount);

    // DELETE: remove Rahul
    const del = await students.deleteOne({ rollNo: 104 });
    console.log("Delete result (Rahul): deletedCount =", del.deletedCount);

    // AGGREGATION: average marks per department
    const agg = await students.aggregate([
      { $group: { _id: "$department", avgMarks: { $avg: "$marks" }, count: { $sum: 1 } } },
      { $sort: { avgMarks: -1 } }
    ]).toArray();

    console.log("\nAverage marks per department:");
    agg.forEach(r => console.log(` - ${r._id}: avg=${r.avgMarks.toFixed(2)}, count=${r.count}`));

    console.log("\n✅ Practical activity complete");
  } catch (err) {
    console.error("Error:", err.message || err);
  } finally {
    await client.close();
    console.log("Disconnected.");
  }
}

main();
