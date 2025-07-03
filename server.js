// Unique log line to confirm deployment
console.log('🚦 TEST ROUTE REGISTERED: /api/test - Deployment check at', new Date().toISOString());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working! 🎉',
    timestamp: new Date().toISOString()
  });
}); 