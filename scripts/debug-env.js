const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20));
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length);
if (process.env.DATABASE_URL?.startsWith('postgresql://')) {
    console.log('Protocol is correct');
} else {
    console.log('Protocol is INCORRECT:', process.env.DATABASE_URL?.substring(0, 15));
}
