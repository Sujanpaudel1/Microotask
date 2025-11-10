/**
 * Testing script for messaging system
 * Tests conversation creation, sending messages, and fetching
 */

const BASE_URL = 'http://localhost:3000';

// You need to pass the auth token as a command line argument
const AUTH_TOKEN = process.argv[2];

if (!AUTH_TOKEN) {
    console.log('\n❌ Please provide auth token as argument');
    console.log('Usage: node scripts/test-messaging.js YOUR_AUTH_TOKEN\n');
    console.log('To get your token:');
    console.log('1. Login at http://localhost:3000/login');
    console.log('2. Open DevTools → Application → Cookies');
    console.log('3. Copy the "auth-token" cookie value\n');
    process.exit(1);
}

async function makeRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${AUTH_TOKEN}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

async function testMessaging() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     Messaging System Test Suite           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Test 1: Get conversations list
    console.log('1️⃣  Testing: GET /api/messages/conversations');
    try {
        const { status, data } = await makeRequest('/api/messages/conversations');
        if (status === 200) {
            console.log(`✅ Success! Found ${data.conversations.length} conversations`);
            if (data.conversations.length > 0) {
                console.log(`   First conversation with: ${data.conversations[0].other_user.name}`);
                console.log(`   Unread messages: ${data.conversations[0].unread_count}`);
            }
        } else {
            console.log(`❌ Failed: ${data.error}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 2: Create new conversation
    console.log('\n2️⃣  Testing: POST /api/messages/conversations');
    try {
        // Try to create conversation with user ID 2 (adjust based on your database)
        const { status, data } = await makeRequest('/api/messages/conversations', 'POST', {
            otherUserId: 2,
            taskId: 1 // Optional
        });
        if (status === 200) {
            console.log(`✅ Success! ${data.message}`);
            console.log(`   Conversation ID: ${data.conversation_id}`);
        } else {
            console.log(`❌ Failed: ${data.error}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 3: Send a message
    console.log('\n3️⃣  Testing: POST /api/messages');
    try {
        // Get first conversation ID
        const { data: convData } = await makeRequest('/api/messages/conversations');
        if (convData.conversations.length > 0) {
            const conversationId = convData.conversations[0].id;

            const { status, data } = await makeRequest('/api/messages', 'POST', {
                conversationId,
                content: 'Test message from automated script! 🚀'
            });

            if (status === 200) {
                console.log(`✅ Success! Message sent`);
                console.log(`   Message ID: ${data.message.id}`);
                console.log(`   Content: ${data.message.content}`);
            } else {
                console.log(`❌ Failed: ${data.error}`);
            }
        } else {
            console.log(`⚠️  Skipped: No conversations available`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 4: Fetch messages in a conversation
    console.log('\n4️⃣  Testing: GET /api/messages?conversationId=X');
    try {
        const { data: convData } = await makeRequest('/api/messages/conversations');
        if (convData.conversations.length > 0) {
            const conversationId = convData.conversations[0].id;

            const { status, data } = await makeRequest(`/api/messages?conversationId=${conversationId}`);

            if (status === 200) {
                console.log(`✅ Success! Found ${data.messages.length} messages`);
                if (data.messages.length > 0) {
                    console.log(`   Latest: "${data.messages[data.messages.length - 1].content}"`);
                }
            } else {
                console.log(`❌ Failed: ${data.error}`);
            }
        } else {
            console.log(`⚠️  Skipped: No conversations available`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Test 5: Get unread message count
    console.log('\n5️⃣  Testing: GET /api/messages/unread');
    try {
        const { status, data } = await makeRequest('/api/messages/unread');
        if (status === 200) {
            console.log(`✅ Success! Unread messages: ${data.unread_count}`);
        } else {
            console.log(`❌ Failed: ${data.error}`);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          Testing Complete!                 ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n📋 Manual Testing Steps:');
    console.log('  1. Visit http://localhost:3000/messages');
    console.log('  2. Check conversation list appears');
    console.log('  3. Click on a conversation');
    console.log('  4. Send a test message');
    console.log('  5. Verify real-time polling (wait 3 seconds)');
    console.log('  6. Open in another browser/incognito and reply');
    console.log('  7. Verify messages appear automatically\n');
}

// Run tests
testMessaging().catch(console.error);
