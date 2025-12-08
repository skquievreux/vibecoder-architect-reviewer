
const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('portfolio.json', 'utf8'));
    const portfolio = data.portfolio;

    let foundIssue = false;

    Object.values(portfolio).forEach(category => {
        Object.values(category).forEach(repos => {
            repos.forEach(repo => {
                if (repo.canvas && repo.canvas.customerSegments) {
                    try {
                        const customers = JSON.parse(repo.canvas.customerSegments);
                        if (Array.isArray(customers)) {
                            customers.forEach(c => {
                                if (c.pain_points && Array.isArray(c.pain_points) && c.pain_points.length > 0) {
                                    if (typeof c.pain_points[0] === 'object') {
                                        console.log(`FOUND ISSUE in Repo: ${repo.repoName}`);
                                        console.log(`Pain Point:`, JSON.stringify(c.pain_points[0], null, 2));
                                        foundIssue = true;
                                    }
                                }
                            });
                        }
                    } catch (e) { }
                }
            });
        });
    });

    if (!foundIssue) {
        console.log("No issues found in pain_points.");
    }

} catch (e) {
    console.error(e);
}
