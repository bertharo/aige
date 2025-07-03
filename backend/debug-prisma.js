const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Prisma Debug Script ===');
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);

// Check if prisma directory exists
const prismaDir = path.join(process.cwd(), 'prisma');
console.log('Prisma directory exists:', fs.existsSync(prismaDir));

if (fs.existsSync(prismaDir)) {
  console.log('Prisma directory contents:', fs.readdirSync(prismaDir));
  
  // Check if schema file exists
  const schemaFile = path.join(prismaDir, 'schema.prisma');
  console.log('Schema file exists:', fs.existsSync(schemaFile));
  
  if (fs.existsSync(schemaFile)) {
    console.log('Schema file size:', fs.statSync(schemaFile).size, 'bytes');
  }
}

// Check DATABASE_URL
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 20) + '...');
}

// Try to generate Prisma client
console.log('\n=== Attempting Prisma Generation ===');
try {
  const result = execSync('npx prisma generate', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('Prisma generation successful!');
  console.log('Output:', result);
} catch (error) {
  console.error('Prisma generation failed!');
  console.error('Error message:', error.message);
  console.error('Error code:', error.status);
  console.error('Error output:', error.stdout);
  console.error('Error stderr:', error.stderr);
}

console.log('\n=== Checking Generated Client ===');
const generatedDir = path.join(process.cwd(), 'generated');
console.log('Generated directory exists:', fs.existsSync(generatedDir));

if (fs.existsSync(generatedDir)) {
  console.log('Generated directory contents:', fs.readdirSync(generatedDir));
  
  const prismaClientDir = path.join(generatedDir, 'prisma');
  if (fs.existsSync(prismaClientDir)) {
    console.log('Prisma client directory contents:', fs.readdirSync(prismaClientDir));
  }
}

console.log('\n=== Debug Complete ==='); 