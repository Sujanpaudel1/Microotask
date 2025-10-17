const http = require('http');

// Test profile API endpoints
console.log('Testing Profile API Endpoints...\n');

// Function to make HTTP request
function makeRequest(path, method = 'GET', data = null, cookies = '') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function testProfileAPIs() {
    try {
        // Step 1: Login first to get auth token
        console.log('1. Logging in...');
        const loginResponse = await makeRequest('/api/auth/login', 'POST', {
            email: 'r47327468@gmail.com',
            password: 'test123'
        });

        if (loginResponse.status !== 200) {
            console.log('❌ Login failed:', loginResponse.body);
            return;
        }

        // Extract auth token from cookies
        const setCookie = loginResponse.headers['set-cookie'];
        let authToken = '';
        if (setCookie) {
            const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
            const authCookie = cookieArray.find(c => c.startsWith('auth-token='));
            if (authCookie) {
                authToken = authCookie.split(';')[0];
            }
        }

        console.log('✅ Login successful');
        console.log(`Auth token: ${authToken.substring(0, 30)}...\n`);

        // Step 2: Get profile
        console.log('2. Fetching profile...');
        const profileResponse = await makeRequest('/api/profile', 'GET', null, authToken);
        
        console.log(`Status: ${profileResponse.status}`);
        if (profileResponse.status === 200) {
            console.log('✅ Profile fetched successfully');
            console.log('Profile data:', JSON.stringify(profileResponse.body, null, 2));
        } else {
            console.log('❌ Failed to fetch profile:', profileResponse.body);
        }

        // Step 3: Update profile
        console.log('\n3. Updating profile...');
        const updateData = {
            name: 'Test User Updated',
            bio: 'This is my updated bio from automated test',
            skills: 'JavaScript, React, Node.js, Testing',
            hourly_rate: 2500,
            location: 'Kathmandu, Nepal',
            phone: '+977-9812345678'
        };

        const updateResponse = await makeRequest('/api/profile', 'PATCH', updateData, authToken);
        
        console.log(`Status: ${updateResponse.status}`);
        if (updateResponse.status === 200) {
            console.log('✅ Profile updated successfully');
            console.log('Updated profile:', JSON.stringify(updateResponse.body, null, 2));
        } else {
            console.log('❌ Failed to update profile:', updateResponse.body);
        }

        // Step 4: Verify update by fetching again
        console.log('\n4. Verifying update...');
        const verifyResponse = await makeRequest('/api/profile', 'GET', null, authToken);
        
        if (verifyResponse.status === 200) {
            console.log('✅ Verification successful');
            const profile = verifyResponse.body.profile;
            console.log(`Name: ${profile.name}`);
            console.log(`Bio: ${profile.bio}`);
            console.log(`Skills: ${profile.skills}`);
            console.log(`Hourly Rate: NPR ${profile.hourly_rate}`);
            console.log(`Location: ${profile.location}`);
            console.log(`Phone: ${profile.phone}`);
        }

        console.log('\n✅ All profile API tests completed successfully!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

// Run tests
testProfileAPIs();
