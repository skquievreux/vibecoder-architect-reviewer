const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const backupDbPath = path.join(__dirname, '..', 'dev-backup.db');

const db = new sqlite3.Database(backupDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening backup database:', err);
        process.exit(1);
    }
    console.log('✅ Connected to backup database\n');
});

const output = {
    repositories: [],
    technologies: [],
    interfaces: [],
    repoHealth: [],
    costSnapshots: []
};

async function exportData() {
    return new Promise((resolve, reject) => {
        // Export Repositories
        db.all('SELECT * FROM Repository', [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            output.repositories = rows;
            console.log(`✅ Exported ${rows.length} repositories`);

            // Export Technologies
            db.all('SELECT * FROM Technology', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                output.technologies = rows;
                console.log(`✅ Exported ${rows.length} technologies`);

                // Export Interfaces
                db.all('SELECT * FROM Interface', [], (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    output.interfaces = rows;
                    console.log(`✅ Exported ${rows.length} interfaces`);

                    // Export RepoHealth
                    db.all('SELECT * FROM RepoHealth', [], (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        output.repoHealth = rows;
                        console.log(`✅ Exported ${rows.length} repo health records`);

                        // Export CostSnapshots
                        db.all('SELECT * FROM CostSnapshot', [], (err, rows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            output.costSnapshots = rows;
                            console.log(`✅ Exported ${rows.length} cost snapshots`);

                            // Save to JSON file
                            const outputPath = path.join(__dirname, '..', 'backup-export.json');
                            fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
                            console.log(`\n📄 Data exported to: ${outputPath}`);

                            db.close();
                            resolve(output);
                        });
                    });
                });
            });
        });
    });
}

exportData()
    .then((data) => {
        console.log('\n📊 Summary:');
        console.log('='.repeat(60));
        console.log(`Repositories: ${data.repositories.length}`);
        console.log(`Technologies: ${data.technologies.length}`);
        console.log(`Interfaces: ${data.interfaces.length}`);
        console.log(`Repo Health: ${data.repoHealth.length}`);
        console.log(`Cost Snapshots: ${data.costSnapshots.length}`);
        console.log('='.repeat(60));

        // Show sample repository
        if (data.repositories.length > 0) {
            console.log('\n📋 Sample Repository:');
            console.log(JSON.stringify(data.repositories[0], null, 2));
        }
    })
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
