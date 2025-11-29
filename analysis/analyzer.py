import os
import json
import subprocess
import shutil
from datetime import datetime

# Configuration
GITHUB_USER = "skquievreux"
OUTPUT_FILE = "analysis_results.json"
TEMP_DIR = "temp_repos"

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command '{command}': {e}")
        print(f"Stderr: {e.stderr}")
        return None

def get_repositories():
    print("Fetching repositories...")
    # Use gh cli to get repos
    # Removed username to default to authenticated user
    # Fixed field name: fullName -> nameWithOwner, removed defaultBranch, added id
    json_str = run_command(f"gh repo list --limit 100 --json id,name,nameWithOwner,url,description,isPrivate,updatedAt,pushedAt,languages")
    if json_str:
        return json.loads(json_str)
    return []

def analyze_repo(repo):
    print(f"Analyzing {repo['name']}...")
    repo_path = os.path.join(TEMP_DIR, repo['name'])
    
    # Clone (shallow)
    if os.path.exists(repo_path):
        shutil.rmtree(repo_path)
    
    # Use the token from gh cli if possible, or just https if public. 
    # For private repos, gh cli handles auth automatically if we use 'gh repo clone'
    run_command(f"gh repo clone {repo['nameWithOwner']} {repo_path} -- --depth 1")

    technologies = []
    interfaces = []
    
    if not os.path.exists(repo_path):
        print(f"Failed to clone {repo['name']}")
        return None

    # Detect Technologies
    # 1. Node.js / JS
    node_version = None
    if os.path.exists(os.path.join(repo_path, 'package.json')):
        try:
            with open(os.path.join(repo_path, 'package.json')) as f:
                pkg = json.load(f)
                node_version = pkg.get('engines', {}).get('node')
                
                deps = {**pkg.get('dependencies', {}), **pkg.get('devDependencies', {})}
                
                if 'react' in deps:
                    technologies.append({'name': 'React', 'category': 'framework', 'version': deps['react']})
                if 'next' in deps:
                    technologies.append({'name': 'Next.js', 'category': 'framework', 'version': deps['next']})
                if 'typescript' in deps:
                    technologies.append({'name': 'TypeScript', 'category': 'language', 'version': deps['typescript']})
                if 'tailwindcss' in deps:
                    technologies.append({'name': 'Tailwind CSS', 'category': 'tool', 'version': deps['tailwindcss']})
                if '@supabase/supabase-js' in deps:
                    technologies.append({'name': 'Supabase', 'category': 'database', 'version': deps['@supabase/supabase-js']})
                    interfaces.append({'type': 'database_connection', 'direction': 'outbound', 'details': {'service': 'Supabase'}})
        except Exception as e:
            print(f"Error parsing package.json: {e}")

    # Check .nvmrc if node_version is still None
    if not node_version and os.path.exists(os.path.join(repo_path, '.nvmrc')):
        try:
            with open(os.path.join(repo_path, '.nvmrc')) as f:
                node_version = f.read().strip()
        except Exception as e:
            print(f"Error reading .nvmrc: {e}")

    # Only add Node.js if we found evidence of it (package.json or .nvmrc)
    if node_version is not None or os.path.exists(os.path.join(repo_path, 'package.json')):
        technologies.append({'name': 'Node.js', 'category': 'language', 'version': node_version})


    # 2. Python
    if os.path.exists(os.path.join(repo_path, 'requirements.txt')):
        technologies.append({'name': 'Python', 'category': 'language', 'version': None})
        # Simple check for frameworks
        with open(os.path.join(repo_path, 'requirements.txt')) as f:
            content = f.read().lower()
            if 'django' in content:
                technologies.append({'name': 'Django', 'category': 'framework', 'version': None})
            if 'flask' in content:
                technologies.append({'name': 'Flask', 'category': 'framework', 'version': None})
            if 'fastapi' in content:
                technologies.append({'name': 'FastAPI', 'category': 'framework', 'version': None})
            if 'supabase' in content:
                technologies.append({'name': 'Supabase', 'category': 'database', 'version': None})

    # 3. Docker
    if os.path.exists(os.path.join(repo_path, 'Dockerfile')):
        technologies.append({'name': 'Docker', 'category': 'tool', 'version': None})

    # 4. Detect Hosting & Infrastructure via Config Files
    hosting_configs = {
        "vercel.json": "Vercel",
        "fly.toml": "Fly.io",
        "netlify.toml": "Netlify",
        "firebase.json": "Firebase"
    }

    for config_file, service_name in hosting_configs.items():
        if os.path.exists(os.path.join(repo_path, config_file)):
            interfaces.append({
                "type": "cloud_service",
                "direction": "hosting",
                "details": {"service": service_name, "variable": config_file}
            })

    # 5. Detect Interfaces (Simple heuristic)
    # Search for "fetch(" or "axios"
    try:
        grep_fetch = run_command(f"grep -r 'fetch(' {repo_path} | head -n 5")
        if grep_fetch:
            interfaces.append({'type': 'rest_api', 'direction': 'outbound', 'details': {'snippet': 'fetch() calls detected'}})
    except:
        pass

    # 4. Environment Variables & Secrets Detection
    # Scan for common patterns in code and config files
    env_vars = set()
    
    # Regex patterns for interesting variables
    # We look for assignments or usages
    patterns = [
        r'([A-Z0-9_]+_URL)',
        r'([A-Z0-9_]+_KEY)',
        r'([A-Z0-9_]+_TOKEN)',
        r'([A-Z0-9_]+_SECRET)',
        r'(STRIPE)', r'(AWS)', r'(S3)', r'(REDIS)', r'(OPENAI)', r'(SUPABASE)', r'(FIREBASE)'
    ]
    
    # Grep for these patterns
    # We use -rI to ignore binary files, -o to only output matching part, -h to suppress filenames (for now, or maybe we want them)
    # Let's just get the names
    try:
        # Construct a big grep OR pattern
        grep_pattern = "|".join(patterns)
        # grep -rE "PATTERN" .
        cmd = f"grep -rEoh \"{grep_pattern}\" {repo_path} | sort | uniq | head -n 20"
        grep_out = run_command(cmd)
        
        if grep_out:
            found_vars = grep_out.split('\n')
            for var in found_vars:
                var = var.strip()
                if not var: continue
                
                # Filter out some common false positives or generic names if needed
                if var in ['URL', 'KEY', 'TOKEN', 'SECRET']: continue
                
                env_vars.add(var)
                
                # Infer interface from variable name
                if 'SUPABASE' in var:
                    interfaces.append({'type': 'database_connection', 'direction': 'outbound', 'details': {'service': 'Supabase', 'variable': var}})
                elif 'OPENAI' in var:
                    interfaces.append({'type': 'api_integration', 'direction': 'outbound', 'details': {'service': 'OpenAI', 'variable': var}})
                elif 'AWS' in var or 'S3' in var:
                    interfaces.append({'type': 'cloud_service', 'direction': 'outbound', 'details': {'service': 'AWS', 'variable': var}})
                elif 'STRIPE' in var:
                    interfaces.append({'type': 'payment_gateway', 'direction': 'outbound', 'details': {'service': 'Stripe', 'variable': var}})
                elif 'REDIS' in var:
                    interfaces.append({'type': 'cache', 'direction': 'outbound', 'details': {'service': 'Redis', 'variable': var}})
                elif 'DATABASE_URL' in var:
                     interfaces.append({'type': 'database_connection', 'direction': 'outbound', 'details': {'service': 'Database', 'variable': var}})

    except Exception as e:
        print(f"Error scanning for env vars: {e}")

    # Deduplicate interfaces based on service/type
    unique_interfaces = []
    seen_interfaces = set()
    for i in interfaces:
        # Create a key for deduplication
        key = f"{i['type']}-{i.get('details', {}).get('service', 'unknown')}"
        if key not in seen_interfaces:
            unique_interfaces.append(i)
            seen_interfaces.add(key)

    # Cleanup
    shutil.rmtree(repo_path)

    return {
        'repo': repo,
        'technologies': technologies,
        'interfaces': unique_interfaces,
        'env_vars': list(env_vars) # Store raw vars too if we want
    }

def main():
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

    repos = get_repositories()
    results = []

    # Limit to 5 for testing if needed, but user asked for all. 
    # Let's do all but handle errors gracefully.
    for repo in repos:
        # Skip if archived? User didn't specify, but usually good practice.
        # if repo.get('isArchived'): continue
        
        data = analyze_repo(repo)
        if data:
            results.append(data)

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"Analysis complete. Saved to {OUTPUT_FILE}")
    
    # Cleanup temp dir
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)

if __name__ == "__main__":
    main()
