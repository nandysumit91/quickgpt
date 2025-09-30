// Using built-in fetch

const testData = {
    name: "Test User",
    email: "test@test.com", 
    password: "123456"
};

try {
    const response = await fetch('http://localhost:3000/api/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', result);
} catch (error) {
    console.error('Error:', error.message);
}
