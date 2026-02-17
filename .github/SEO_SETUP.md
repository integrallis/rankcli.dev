# Required GitHub Secrets

Go to your repository Settings > Secrets and variables > Actions


## Google Search Console (Required for tracking)

1. `GSC_SERVICE_ACCOUNT_EMAIL`
   - Your Google Cloud service account email
   - Example: seo-bot@my-project.iam.gserviceaccount.com

2. `GSC_PRIVATE_KEY`
   - The private key from your service account JSON
   - Include the full key with -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----

### Setup Instructions:
1. Go to https://console.cloud.google.com
2. Create a project and enable "Search Console API"
3. Create a service account and download JSON key
4. In Search Console, add the service account email as a user
5. Copy email and private_key to GitHub Secrets

