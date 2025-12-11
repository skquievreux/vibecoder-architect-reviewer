const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const backupDbPath = path.join(__dirname, '..', 'dev-backup.db');

const db = new sqlite3.Database(backupDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening backup database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to backup database\n');
});

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
        console.error('Error fetching tables:', err);
        return;
    }

    console.log('📊 Tables in backup database:');
    console.log('='.repeat(60));

    tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.name}`);
    });

    console.log('='.repeat(60));
    console.log(`\nTotal: ${tables.length} tables\n`);

    // For each table, get row count and sample data
    let processed = 0;
    tables.forEach((table) => {
        db.get(`SELECT COUNT(*) as count FROM "${table.name}"`, [], (err, result) => {
            if (err) {
                console.error(`Error counting ${table.name}:`, err);
                return;
            }

            if (result.count > 0) {
                console.log(`\n📋 ${table.name}: ${result.count} rows`);

                // Get schema
                db.all(`PRAGMA table_info("${table.name}")`, [], (err, columns) => {
                    if (err) {
                        console.error(`Error getting schema for ${table.name}:`, err);
                        return;
                    }

                    console.log('   Columns:', columns.map(c => c.name).join(', '));

                    // Get sample row
                    db.get(`SELECT * FROM "${table.name}" LIMIT 1`, [], (err, row) => {
                        if (err) {
                            console.error(`Error getting sample from ${table.name}:`, err);
                            return;
                        }

                        if (row) {
                            console.log('   Sample:', JSON.stringify(row, null, 2).substring(0, 200) + '...');
                        }

                        processed++;
                        if (processed === tables.length) {
                            db.close();
                        }
                    });
                });
            } else {
                processed++;
                if (processed === tables.length) {
                    db.close();
                }
            }
        });
    });
});
