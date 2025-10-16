// Test the dashboard APIs
console.log('Testing Dashboard APIs...\n');

const BASE_URL = 'http://localhost:3001';

async function testDashboardAPIs() {
    try {
        // Step 1: Login first to get auth token
        console.log('1. Testing Login...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'r47327468@gmail.com',
                password: 'TestPassword123' // Update if you have a different password
            }),
        });

        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResponse.status);
            const error = await loginResponse.json();
            console.error('Error:', error);
            return;
        }

        // Extract cookie from response
        const setCookie = loginResponse.headers.get('set-cookie');
        console.log('✅ Login successful!');
        console.log('Cookie:', setCookie ? 'Received' : 'Not received');

        if (!setCookie) {
            console.error('❌ No auth cookie received');
            return;
        }

        // Step 2: Test Dashboard Stats API
        console.log('\n2. Testing Dashboard Stats API...');
        const statsResponse = await fetch(`${BASE_URL}/api/dashboard/stats`, {
            headers: {
                'Cookie': setCookie
            }
        });

        if (!statsResponse.ok) {
            console.error('❌ Stats API failed:', statsResponse.status);
            const error = await statsResponse.json();
            console.error('Error:', error);
        } else {
            const statsData = await statsResponse.json();
            console.log('✅ Stats API successful!');
            console.log('Stats:', JSON.stringify(statsData.stats, null, 2));
        }

        // Step 3: Test My Tasks API
        console.log('\n3. Testing My Tasks API...');
        const tasksResponse = await fetch(`${BASE_URL}/api/dashboard/my-tasks`, {
            headers: {
                'Cookie': setCookie
            }
        });

        if (!tasksResponse.ok) {
            console.error('❌ Tasks API failed:', tasksResponse.status);
            const error = await tasksResponse.json();
            console.error('Error:', error);
        } else {
            const tasksData = await tasksResponse.json();
            console.log('✅ Tasks API successful!');
            console.log('Tasks count:', tasksData.tasks.length);
            console.log('Tasks:', JSON.stringify(tasksData.tasks, null, 2));
        }

        console.log('\n✅ All API tests completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

testDashboardAPIs();
