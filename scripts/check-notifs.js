const db = require('better-sqlite3')('microtask.db');
const notifs = db.prepare('SELECT * FROM notifications LIMIT 3').all();
console.log('Sample notifications:');
notifs.forEach(n => {
    const p = JSON.parse(n.payload);
    console.log(`ID ${n.id} [${n.type}]: ${p.message}`);
});
db.close();
