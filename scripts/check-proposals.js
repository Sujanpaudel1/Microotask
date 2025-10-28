const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'microtask.db');
const db = new Database(dbPath);

console.log('\n=== Checking Proposals in Database ===\n');

// Get all proposals
const proposals = db.prepare(`
    SELECT 
        p.id,
        p.task_id,
        p.freelancer_id,
        p.proposed_price,
        p.status,
        p.created_at,
        t.title as task_title,
        t.client_id,
        u.name as freelancer_name,
        u.email as freelancer_email
    FROM proposals p
    JOIN tasks t ON p.task_id = t.id
    JOIN users u ON p.freelancer_id = u.id
    ORDER BY p.created_at DESC
`).all();

if (proposals.length === 0) {
    console.log('❌ No proposals found in database');
    console.log('\nTo test proposals:');
    console.log('1. Login as a freelancer');
    console.log('2. Go to a task detail page');
    console.log('3. Submit a proposal');
} else {
    console.log(`✅ Found ${proposals.length} proposal(s):\n`);
    proposals.forEach((p, i) => {
        console.log(`${i + 1}. Proposal ID: ${p.id}`);
        console.log(`   Task: ${p.task_title} (ID: ${p.task_id})`);
        console.log(`   Freelancer: ${p.freelancer_name} (${p.freelancer_email})`);
        console.log(`   Price: NPR ${p.proposed_price}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   Submitted: ${p.created_at}`);
        console.log(`   Task Owner ID: ${p.client_id}`);
        console.log('');
    });

    console.log('\nTo view proposals:');
    console.log('1. Login as the task owner (client_id shown above)');
    console.log('2. Go to http://localhost:3001/tasks/[task_id]');
    console.log('3. You should see the proposals section');
}

db.close();
