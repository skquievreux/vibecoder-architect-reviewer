const tremor = require('@tremor/react');
const requiredComponents = ['Table', 'TableHead', 'TableHeaderCell', 'TableBody', 'TableRow', 'TableCell'];

console.log('Checking Tremor components...');
requiredComponents.forEach(comp => {
    if (tremor[comp]) {
        console.log(`✅ ${comp} found`);
    } else {
        console.error(`❌ ${comp} NOT found`);
    }
});
