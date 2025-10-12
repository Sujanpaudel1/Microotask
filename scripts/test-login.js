// Test the login API endpoint directly
async function testLogin() {
    try {
        console.log('Testing login API...');

        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'r47327468@gmail.com',
                password: 'TestPassword123'  // Try a common test password
            }),
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
            console.log('✅ Login test passed!');
        } else {
            console.log('❌ Login test failed:', data.error);
        }

    } catch (error) {
        console.error('Error testing login:', error);
    }
}

testLogin();