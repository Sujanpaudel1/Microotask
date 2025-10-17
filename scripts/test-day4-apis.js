// Day 4 API Testing Script
// Tests all task management APIs

const BASE_URL = 'http://localhost:3001';

// Test data
let authToken = '';
let userId = '';
let taskId = '';
let proposalId = '';

async function login() {
    console.log('\n📝 Logging in...');
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'r47327468@gmail.com',
            password: 'password123'
        })
    });

    if (res.ok) {
        const cookies = res.headers.get('set-cookie');
        if (cookies) {
            authToken = cookies.split(';')[0].split('=')[1];
            console.log('✅ Login successful');
        }

        const data = await res.json();
        userId = data.user?.id;
        console.log(`User ID: ${userId}`);
    } else {
        console.error('❌ Login failed');
        process.exit(1);
    }
}

async function createTestTask() {
    console.log('\n📝 Creating test task...');
    const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
        },
        body: JSON.stringify({
            title: 'Test Task for Day 4',
            description: 'This is a test task to verify Day 4 functionality',
            category: 'Development',
            budget_min: 500,
            budget_max: 1000,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            skills_required: JSON.stringify(['JavaScript', 'Node.js']),
            difficulty: 'Medium'
        })
    });

    if (res.ok) {
        const data = await res.json();
        taskId = data.task?.id;
        console.log(`✅ Task created with ID: ${taskId}`);
    } else {
        const error = await res.text();
        console.error('❌ Task creation failed:', error);
    }
}

async function testEditTask() {
    console.log('\n📝 Testing task edit...');
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
        },
        body: JSON.stringify({
            title: 'Updated Test Task for Day 4',
            budget_max: 1500
        })
    });

    if (res.ok) {
        console.log('✅ Task updated successfully');
    } else {
        const error = await res.text();
        console.error('❌ Task update failed:', error);
    }
}

async function createTestProposal() {
    console.log('\n📝 Creating test proposal...');
    // Login as different user first (freelancer)
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'r473274678@gmail.com',
            password: 'password123'
        })
    });

    if (!loginRes.ok) {
        console.error('❌ Freelancer login failed');
        return;
    }

    const cookies = loginRes.headers.get('set-cookie');
    const freelancerToken = cookies ? cookies.split(';')[0].split('=')[1] : '';
    const freelancerData = await loginRes.json();
    const freelancerId = freelancerData.user?.id;

    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/proposals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${freelancerToken}`
        },
        body: JSON.stringify({
            freelancerId: freelancerId,
            message: 'I am interested in this project',
            proposedPrice: 750,
            estimatedDuration: '5 days'
        })
    });

    if (res.ok) {
        const data = await res.json();
        proposalId = data.proposal?.id;
        console.log(`✅ Proposal created with ID: ${proposalId}`);
    } else {
        const error = await res.text();
        console.error('❌ Proposal creation failed:', error);
    }
}

async function testAcceptProposal() {
    console.log('\n📝 Testing proposal acceptance...');
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
        },
        body: JSON.stringify({
            proposalId: proposalId
        })
    });

    if (res.ok) {
        const data = await res.json();
        console.log('✅ Proposal accepted successfully');
        console.log(`Task status: ${data.task?.status}`);
    } else {
        const error = await res.text();
        console.error('❌ Proposal acceptance failed:', error);
    }
}

async function testCompleteTask() {
    console.log('\n📝 Testing task completion...');
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `auth-token=${authToken}`
        }
    });

    if (res.ok) {
        const data = await res.json();
        console.log('✅ Task marked as completed');
        console.log(`Task status: ${data.task?.status}`);
    } else {
        const error = await res.text();
        console.error('❌ Task completion failed:', error);
    }
}

async function testCancelTask() {
    console.log('\n📝 Testing task cancellation...');
    // Create a new task first
    await createTestTask();
    
    const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Cookie': `auth-token=${authToken}`
        }
    });

    if (res.ok) {
        console.log('✅ Task cancelled successfully');
    } else {
        const error = await res.text();
        console.error('❌ Task cancellation failed:', error);
    }
}

async function runTests() {
    console.log('🚀 Starting Day 4 API Tests...\n');

    await login();
    await createTestTask();
    await testEditTask();
    await createTestProposal();
    await testAcceptProposal();
    await testCompleteTask();
    await testCancelTask();

    console.log('\n✅ All tests completed!');
}

runTests().catch(console.error);
