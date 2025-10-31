// Fix old notification payloads to include message field
const Database = require('better-sqlite3');
const db = new Database('./microtask.db');

console.log('Updating old notification payloads...\n');

const notifications = db.prepare('SELECT * FROM notifications').all();
let updated = 0;

for (const notif of notifications) {
    try {
        const payload = JSON.parse(notif.payload);
        
        // If payload doesn't have a message field, add one
        if (!payload.message) {
            let message = '';
            
            switch (notif.type) {
                case 'proposal_submitted':
                    message = `New proposal received for "${payload.title || 'your task'}"`;
                    break;
                case 'proposal_accepted':
                    message = `Your proposal for "${payload.title || payload.taskTitle || 'a task'}" has been accepted!`;
                    break;
                case 'proposal_rejected':
                    message = `Your proposal for "${payload.title || payload.taskTitle || 'a task'}" was not selected`;
                    break;
                case 'task_completed':
                    message = `Task "${payload.title || payload.taskTitle || 'completed'}" has been marked as complete`;
                    break;
                case 'task_assigned':
                    message = `You have been assigned to "${payload.title || payload.taskTitle || 'a task'}"`;
                    break;
                default:
                    message = payload.title || 'You have a new notification';
            }
            
            payload.message = message;
            if (payload.title) {
                payload.taskTitle = payload.title;
                delete payload.title;
            }
            
            const newPayload = JSON.stringify(payload);
            db.prepare('UPDATE notifications SET payload = ? WHERE id = ?').run(newPayload, notif.id);
            updated++;
            console.log(`✓ Updated notification ${notif.id}: ${message}`);
        }
    } catch (error) {
        console.error(`✗ Error updating notification ${notif.id}:`, error.message);
    }
}

console.log(`\nTotal updated: ${updated} notifications`);

db.close();
