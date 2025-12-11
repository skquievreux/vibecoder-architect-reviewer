#!/usr/bin/env python3
"""
GitHub Repository Analyzer
Analyzes GitHub repositories and generates analysis_results.json
"""

import os
import json
import sys
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: requests module not found. Install with: pip install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("Error: python-dotenv module not found. Install with: pip install python-dotenv")
    sys.exit(1)

# Load environment variables from .env.local and .env
env_local_path = Path(__file__).parent.parent / '.env.local'
env_path = Path(__file__).parent.parent / '.env'

if env_local_path.exists():
    load_dotenv(env_local_path)
    print(f"Loaded environment from: {env_local_path}")
elif env_path.exists():
    load_dotenv(env_path)
    print(f"Loaded environment from: {env_path}")
else:
    print("Warning: No .env.local or .env file found")


class GitHubAnalyzer:
    def __init__(self, token: str, owner: str):
        self.token = token
        self.owner = owner
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        self.base_url = 'https://api.github.com'

    def get_repositories(self) -> List[Dict[str, Any]]:
        """Fetch all repositories for the owner (including private repos)"""
        print(f"Fetching repositories for {self.owner}...")
        
        repos = []
        page = 1
        per_page = 100
        
        # First, check if we're fetching for the authenticated user
        user_response = requests.get(f"{self.base_url}/user", headers=self.headers)
        
        if user_response.status_code == 200:
            authenticated_user = user_response.json()['login']
            is_own_repos = authenticated_user.lower() == self.owner.lower()
        else:
            is_own_repos = False
            print(f"Warning: Could not verify authenticated user. Status: {user_response.status_code}")
        
        while True:
            # Use /user/repos for authenticated user (includes private repos)
            # Use /users/{owner}/repos for other users (public only)
            if is_own_repos:
                url = f"{self.base_url}/user/repos"
                params = {
                    'per_page': per_page,
                    'page': page,
                    'sort': 'updated',
                    'direction': 'desc',
                    'affiliation': 'owner,collaborator,organization_member'
                }
            else:
                url = f"{self.base_url}/users/{self.owner}/repos"
                params = {
                    'per_page': per_page,
                    'page': page,
                    'sort': 'updated',
                    'direction': 'desc',
                    'type': 'all'
                }
            
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code != 200:
                print(f"Error fetching repositories: {response.status_code}")
                print(response.text)
                break
            
            batch = response.json()
            if not batch:
                break
            
            # Filter by owner if using /user/repos endpoint
            if is_own_repos:
                batch = [repo for repo in batch if repo['owner']['login'].lower() == self.owner.lower()]
            
            repos.extend(batch)
            page += 1
            
            # Limit to avoid rate limits in development
            if len(repos) >= 100:
                break
        
        # Count private vs public
        private_count = sum(1 for repo in repos if repo.get('private', False))
        public_count = len(repos) - private_count
        
        print(f"Found {len(repos)} repositories ({public_count} public, {private_count} private)")
        return repos

    def get_languages(self, repo_full_name: str) -> List[Dict[str, Any]]:
        """Get languages used in a repository"""
        url = f"{self.base_url}/repos/{repo_full_name}/languages"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            languages = response.json()
            return [
                {"node": {"name": lang}} 
                for lang in languages.keys()
            ]
        return []

    def detect_technologies(self, repo_full_name: str, languages: List[str]) -> List[Dict[str, Any]]:
        """Detect technologies used in the repository"""
        technologies = []
        
        # Add languages as technologies
        for lang in languages:
            technologies.append({
                "name": lang["node"]["name"],
                "category": "language",
                "version": None
            })
        
        # Try to detect package.json for Node.js projects
        if any(l["node"]["name"].lower() in ["javascript", "typescript"] for l in languages):
            url = f"{self.base_url}/repos/{repo_full_name}/contents/package.json"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                technologies.append({
                    "name": "Node.js",
                    "category": "runtime",
                    "version": None
                })
                
                # Check for common frameworks
                try:
                    import base64
                    content = response.json().get('content', '')
                    decoded = base64.b64decode(content).decode('utf-8')
                    package_json = json.loads(decoded)
                    
                    deps = {**package_json.get('dependencies', {}), **package_json.get('devDependencies', {})}
                    
                    if 'next' in deps:
                        technologies.append({"name": "Next.js", "category": "framework", "version": deps['next']})
                    if 'react' in deps:
                        technologies.append({"name": "React", "category": "framework", "version": deps['react']})
                    if 'vue' in deps:
                        technologies.append({"name": "Vue", "category": "framework", "version": deps['vue']})
                    if 'express' in deps:
                        technologies.append({"name": "Express", "category": "framework", "version": deps['express']})
                    if '@prisma/client' in deps:
                        technologies.append({"name": "Prisma", "category": "database", "version": deps['@prisma/client']})
                except Exception as e:
                    print(f"Warning: Could not parse package.json for {repo_full_name}: {e}")
        
        return technologies

    def detect_interfaces(self, repo_full_name: str, technologies: List[Dict]) -> List[Dict[str, Any]]:
        """Detect interfaces (APIs, webhooks, etc.)"""
        interfaces = []
        
        # Check for common API patterns
        tech_names = [t["name"].lower() for t in technologies]
        
        if "next.js" in tech_names or "express" in tech_names:
            interfaces.append({
                "type": "REST API",
                "direction": "PROVIDES",
                "details": {"framework": "Next.js" if "next.js" in tech_names else "Express"}
            })
        
        if "prisma" in tech_names:
            interfaces.append({
                "type": "Database",
                "direction": "CONSUMES",
                "details": {"orm": "Prisma"}
            })
        
        return interfaces

    def analyze_repository(self, repo: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a single repository"""
        print(f"Analyzing {repo['full_name']}...")
        
        languages = self.get_languages(repo['full_name'])
        technologies = self.detect_technologies(repo['full_name'], languages)
        interfaces = self.detect_interfaces(repo['full_name'], technologies)
        
        return {
            "repo": {
                "id": repo['id'],
                "name": repo['name'],
                "fullName": repo['full_name'],
                "nameWithOwner": repo['full_name'],
                "url": repo['html_url'],
                "description": repo['description'],
                "isPrivate": repo['private'],
                "createdAt": repo['created_at'],
                "updatedAt": repo['updated_at'],
                "pushedAt": repo['pushed_at'],
                "languages": languages,
                "defaultBranchRef": {
                    "name": repo['default_branch']
                }
            },
            "technologies": technologies,
            "interfaces": interfaces
        }

    def analyze_all(self) -> List[Dict[str, Any]]:
        """Analyze all repositories"""
        repos = self.get_repositories()
        results = []
        
        for repo in repos:
            try:
                result = self.analyze_repository(repo)
                results.append(result)
            except Exception as e:
                print(f"Error analyzing {repo['full_name']}: {e}")
                continue
        
        return results


def main():
    # Get environment variables
    github_token = os.getenv('GITHUB_TOKEN')
    github_owner = os.getenv('GITHUB_OWNER')
    
    if not github_token:
        print("Error: GITHUB_TOKEN environment variable not set")
        sys.exit(1)
    
    if not github_owner:
        print("Error: GITHUB_OWNER environment variable not set")
        sys.exit(1)
    
    # Initialize analyzer
    analyzer = GitHubAnalyzer(github_token, github_owner)
    
    # Analyze repositories
    results = analyzer.analyze_all()
    
    # Save results
    output_file = os.path.join(os.path.dirname(__file__), '..', 'analysis_results.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\nAnalysis complete! Results saved to {output_file}")
    print(f"Analyzed {len(results)} repositories")


if __name__ == '__main__':
    main()
