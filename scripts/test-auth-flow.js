// Test the complete authentication flow
async function testAuthFlow() {
    try {
        console.log('Testing complete authentication flow...');

        // Test 1: Create a new user
        console.log('\n1. Testing signup...');
        const signupResponse = await fetch('http://localhost:3002/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'TestPassword123'
            }),
        });

        const signupData = await signupResponse.json();
        console.log('Signup Response:', signupResponse.status, signupData);

        if (signupResponse.ok) {
            console.log('✅ Signup successful!');

            // Test 2: Login with the created user
            console.log('\n2. Testing login...');
            const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'testuser@example.com',
                    password: 'TestPassword123'
                }),
            });

            const loginData = await loginResponse.json();
            console.log('Login Response:', loginResponse.status, loginData);

            if (loginResponse.ok) {
                console.log('✅ Login successful!');
                console.log('User should be redirected to dashboard');

                // Check if we got the auth cookie
                const cookies = loginResponse.headers.get('set-cookie');
                if (cookies && cookies.includes('auth-token')) {
                    console.log('✅ Auth token cookie set correctly');
                } else {
                    console.log('❌ Auth token cookie not found');
                }

            } else {
                console.log('❌ Login failed:', loginData.error);
            }

        } else {
            console.log('❌ Signup failed:', signupData.error);

            // If signup failed because user exists, try login with existing user
            if (signupData.error?.includes('already exists')) {
                console.log('\n2. User exists, testing login...');
                const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: 'testuser@example.com',
                        password: 'TestPassword123'
                    }),
                });

                const loginData = await loginResponse.json();
                console.log('Login Response:', loginResponse.status, loginData);

                if (loginResponse.ok) {
                    console.log('✅ Login successful with existing user!');
                }
            }
        }

    } catch (error) {
        console.error('Error testing auth flow:', error);
    }
}

testAuthFlow();