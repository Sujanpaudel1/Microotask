/**
 * Test Script for Bookmark/Saved Tasks Feature
 * Tests saving, removing, and viewing saved tasks
 */

const BASE_URL = 'http://localhost:3000';

// You need to provide an auth token to test
// Login to the app, open DevTools > Application > Cookies > copy 'auth-token' value
const AUTH_TOKEN = process.argv[2];

if (!AUTH_TOKEN) {
    console.log('⚠️  No auth token provided');
    console.log('Usage: node scripts/test-bookmarks.js YOUR_AUTH_TOKEN');
    console.log('\nTo get your auth token:');
    console.log('  1. Login at http://localhost:3000/login');
    console.log('  2. Open DevTools → Application → Cookies');
    console.log('  3. Copy the "auth-token" cookie value');
    console.log('  4. Run: node scripts/test-bookmarks.js YOUR_TOKEN_HERE\n');
    process.exit(1);
}

async function testBookmarks() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║     Bookmark/Saved Tasks Feature Test     ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const headers = {
        'Cookie': `auth-token=${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        // Test 1: Get initial saved tasks
        console.log('Test 1: Fetch saved tasks (initial state)');
        let res = await fetch(`${BASE_URL}/api/bookmarks`, { headers });
        let data = await res.json();

        if (res.ok) {
            console.log(`✓ Success: Found ${data.count} saved tasks`);
            const initialCount = data.count;
        } else {
            console.log(`✗ Failed: ${data.error}`);
            return;
        }

        // Test 2: Save a task (you need to replace with a real task ID from your database)
        console.log('\nTest 2: Save a task');
        console.log('First, let\'s get a task to save...');

        const tasksRes = await fetch(`${BASE_URL}/api/tasks`);
        const tasksData = await tasksRes.json();

        if (tasksData.tasks && tasksData.tasks.length > 0) {
            const taskToSave = tasksData.tasks[0];
            console.log(`Found task: "${taskToSave.title}" (ID: ${taskToSave.id})`);

            res = await fetch(`${BASE_URL}/api/bookmarks`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ taskId: taskToSave.id })
            });
            data = await res.json();

            if (res.ok) {
                console.log(`✓ Success: Task saved`);
            } else {
                console.log(`✗ Failed: ${data.error}`);
            }
        } else {
            console.log('✗ No tasks available to save');
        }

        // Test 3: Verify task was saved
        console.log('\nTest 3: Verify task appears in saved list');
        res = await fetch(`${BASE_URL}/api/bookmarks`, { headers });
        data = await res.json();

        if (res.ok) {
            console.log(`✓ Success: Now have ${data.count} saved tasks`);
            if (data.savedTasks.length > 0) {
                console.log('  Saved tasks:');
                data.savedTasks.forEach((task, i) => {
                    console.log(`    ${i + 1}. ${task.title} (Saved on: ${new Date(task.saved_at).toLocaleString()})`);
                });
            }
        } else {
            console.log(`✗ Failed: ${data.error}`);
        }

        // Test 4: Check if specific task is saved
        if (tasksData.tasks && tasksData.tasks.length > 0) {
            const taskId = tasksData.tasks[0].id;
            console.log(`\nTest 4: Check if task ${taskId} is saved`);
            res = await fetch(`${BASE_URL}/api/bookmarks/${taskId}`, { headers });
            data = await res.json();

            if (res.ok) {
                console.log(`✓ Success: Task is ${data.isSaved ? 'saved' : 'not saved'}`);
            } else {
                console.log(`✗ Failed to check status`);
            }
        }

        // Test 5: Try to save the same task again (should fail)
        console.log('\nTest 5: Try to save same task again (should fail)');
        if (tasksData.tasks && tasksData.tasks.length > 0) {
            res = await fetch(`${BASE_URL}/api/bookmarks`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ taskId: tasksData.tasks[0].id })
            });
            data = await res.json();

            if (!res.ok && data.error.includes('already saved')) {
                console.log(`✓ Success: Duplicate save prevented - ${data.error}`);
            } else {
                console.log(`✗ Failed: Should have rejected duplicate`);
            }
        }

        // Test 6: Remove a saved task
        console.log('\nTest 6: Remove a saved task');
        if (tasksData.tasks && tasksData.tasks.length > 0) {
            const taskId = tasksData.tasks[0].id;
            res = await fetch(`${BASE_URL}/api/bookmarks?taskId=${taskId}`, {
                method: 'DELETE',
                headers
            });
            data = await res.json();

            if (res.ok) {
                console.log(`✓ Success: Task removed from saved`);
            } else {
                console.log(`✗ Failed: ${data.error}`);
            }
        }

        // Test 7: Verify task was removed
        console.log('\nTest 7: Verify task was removed');
        res = await fetch(`${BASE_URL}/api/bookmarks`, { headers });
        data = await res.json();

        if (res.ok) {
            console.log(`✓ Success: Now have ${data.count} saved tasks`);
        } else {
            console.log(`✗ Failed: ${data.error}`);
        }

        // Test 8: Try to remove non-existent saved task
        console.log('\nTest 8: Try to remove non-existent saved task');
        res = await fetch(`${BASE_URL}/api/bookmarks?taskId=99999`, {
            method: 'DELETE',
            headers
        });
        data = await res.json();

        if (!res.ok && data.error.includes('not found')) {
            console.log(`✓ Success: Properly handled non-existent task - ${data.error}`);
        } else {
            console.log(`✗ Failed: Should have returned error`);
        }

    } catch (error) {
        console.log(`\n✗ Error: ${error.message}`);
    }

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Testing Complete!                 ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\nManual Testing:');
    console.log('  1. Visit http://localhost:3000/tasks');
    console.log('  2. Click the bookmark icon on any task card');
    console.log('  3. Visit http://localhost:3000/saved-tasks');
    console.log('  4. Verify the task appears in your saved list');
    console.log('  5. Click bookmark again to remove\n');
}

testBookmarks().catch(console.error);
