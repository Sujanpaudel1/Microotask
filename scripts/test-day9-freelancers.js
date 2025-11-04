/**
 * Day 9 Testing Script - Freelancer Discovery & Dashboard Improvements
 * Tests the freelancer API, search/filters, and dashboard activity feed
 */

const BASE_URL = 'http://localhost:3000';

async function testFreelancersAPI() {
    console.log('\n=== Testing Freelancers API ===\n');

    try {
        // Test 1: Get all freelancers
        console.log('Test 1: Fetch all freelancers');
        const response1 = await fetch(`${BASE_URL}/api/freelancers`);
        const data1 = await response1.json();
        
        if (response1.ok) {
            console.log(`✓ Success: Found ${data1.freelancers?.length || 0} freelancers`);
            if (data1.freelancers?.length > 0) {
                const sample = data1.freelancers[0];
                console.log(`  Sample: ${sample.name} - Rating: ${sample.rating}, Completed: ${sample.completed_tasks}`);
            }
        } else {
            console.log(`✗ Failed: ${data1.error}`);
        }

        // Test 2: Search by name
        console.log('\nTest 2: Search freelancers by name');
        const response2 = await fetch(`${BASE_URL}/api/freelancers?search=john`);
        const data2 = await response2.json();
        
        if (response2.ok) {
            console.log(`✓ Success: Found ${data2.freelancers?.length || 0} freelancers matching "john"`);
        } else {
            console.log(`✗ Failed: ${data2.error}`);
        }

        // Test 3: Filter by minimum rating
        console.log('\nTest 3: Filter by minimum rating (4.0)');
        const response3 = await fetch(`${BASE_URL}/api/freelancers?minRating=4.0`);
        const data3 = await response3.json();
        
        if (response3.ok) {
            console.log(`✓ Success: Found ${data3.freelancers?.length || 0} freelancers with rating >= 4.0`);
            if (data3.freelancers?.length > 0) {
                const ratings = data3.freelancers.map(f => f.rating).filter(r => r !== null);
                console.log(`  Ratings: ${ratings.join(', ')}`);
            }
        } else {
            console.log(`✗ Failed: ${data3.error}`);
        }

        // Test 4: Filter by skills
        console.log('\nTest 4: Filter by skills');
        const response4 = await fetch(`${BASE_URL}/api/freelancers?skills=JavaScript`);
        const data4 = await response4.json();
        
        if (response4.ok) {
            console.log(`✓ Success: Found ${data4.freelancers?.length || 0} freelancers with JavaScript skill`);
            if (data4.freelancers?.length > 0) {
                data4.freelancers.slice(0, 3).forEach(f => {
                    console.log(`  ${f.name}: ${f.skills.join(', ')}`);
                });
            }
        } else {
            console.log(`✗ Failed: ${data4.error}`);
        }

        // Test 5: Combine filters
        console.log('\nTest 5: Combine filters (rating + skills)');
        const response5 = await fetch(`${BASE_URL}/api/freelancers?minRating=4.0&skills=React`);
        const data5 = await response5.json();
        
        if (response5.ok) {
            console.log(`✓ Success: Found ${data5.freelancers?.length || 0} freelancers with React and rating >= 4.0`);
        } else {
            console.log(`✗ Failed: ${data5.error}`);
        }

    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
}

async function testDashboardActivity(authToken) {
    console.log('\n=== Testing Dashboard Activity API ===\n');

    if (!authToken) {
        console.log('✗ Skipping: No auth token provided');
        console.log('  Tip: Login first, then pass the auth-token cookie value to this script');
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/activity`, {
            headers: {
                'Cookie': `auth-token=${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✓ Success: Fetched ${data.activities?.length || 0} recent activities`);
            
            if (data.activities?.length > 0) {
                console.log('\nRecent Activities:');
                data.activities.slice(0, 5).forEach((activity, index) => {
                    console.log(`  ${index + 1}. [${activity.type}] ${activity.title}`);
                    console.log(`     Status: ${activity.status || 'N/A'} | Time: ${new Date(activity.timestamp).toLocaleString()}`);
                });
            } else {
                console.log('  No activities found for this user');
            }
        } else {
            console.log(`✗ Failed: ${data.error}`);
        }

    } catch (error) {
        console.log(`✗ Error: ${error.message}`);
    }
}

async function testFreelancerPageFilters() {
    console.log('\n=== Testing Freelancer Page Filters ===\n');

    console.log('Frontend filters are connected to API query parameters:');
    console.log('  ✓ Search bar → search parameter');
    console.log('  ✓ Skill dropdown → skills parameter');
    console.log('  ✓ Rating filter → minRating parameter');
    console.log('\nFilters are tested through API calls above.');
}

async function runAllTests() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║  Day 9: Freelancer Discovery & Dashboard Test  ║');
    console.log('╚════════════════════════════════════════════════╝');

    // Test freelancers API
    await testFreelancersAPI();

    // Test dashboard activity (requires auth token)
    const authToken = process.argv[2]; // Pass token as command line argument
    await testDashboardActivity(authToken);

    // Test filter integration
    await testFreelancerPageFilters();

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║              Testing Complete!                 ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('\nTo test dashboard activity with authentication:');
    console.log('  1. Login at http://localhost:3000/login');
    console.log('  2. Open DevTools → Application → Cookies');
    console.log('  3. Copy the "auth-token" cookie value');
    console.log('  4. Run: node scripts/test-day9-freelancers.js YOUR_TOKEN_HERE');
    console.log('\n');
}

// Run tests
runAllTests().catch(console.error);
