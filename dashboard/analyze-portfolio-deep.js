
const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('portfolio.json', 'utf8'));
    const portfolio = data.portfolio;

    let foundIssue = false;

    Object.values(portfolio).forEach(category => {
        Object.values(category).forEach(repos => {
            repos.forEach(repo => {
                if (repo.canvas && repo.canvas.valueProposition) {
                    try {
                        const vp = JSON.parse(repo.canvas.valueProposition);
                        if (Array.isArray(vp)) {
                            vp.forEach((item, index) => {
                                if (typeof item === 'object') {
                                    console.log(`FOUND ISSUE in Repo: ${repo.repoName} at index ${index}`);
                                    console.log(`Item:`, JSON.stringify(item, null, 2));
                                    foundIssue = true;
                                }
                            });
                        }
                    } catch (e) { }
                }
            });
        });
    });

    if (!foundIssue) {
        console.log("No issues found in API response.");
    }

} catch (e) {
    console.error(e);
}
