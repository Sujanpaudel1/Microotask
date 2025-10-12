// Test the signup API endpoint directly
async function testSignup() {
    try {
        console.log('Testing signup API...');

        const response = await fetch('http://localhost:3001/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'TestPassword123'
            }),
        });

        const data = await response.json();
        console.log('Signup Response status:', response.status);
        console.log('Signup Response data:', data);

        if (response.ok) {
            console.log('✅ Signup test passed!');

            // Now test login with the same credentials
            console.log('\nTesting login API...');
            const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'TestPassword123'
                }),
            });

            const loginData = await loginResponse.json();
            console.log('Login Response status:', loginResponse.status);
            console.log('Login Response data:', loginData);

            if (loginResponse.ok) {
                console.log('✅ Login test passed!');
            } else {
                console.log('❌ Login test failed:', loginData.error);
            }

        } else {
            console.log('❌ Signup test failed:', data.error);
        }

    } catch (error) {
        console.error('Error testing auth:', error);
    }
}

testSignup();