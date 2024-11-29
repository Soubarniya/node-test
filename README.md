# Workflow Overview  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)


### Workflow Name: Node.js CI/CD Workflow
This workflow is triggered on the following events:

- **Push** to main or devops branches.                             
- **Pull requests** targeting the development branch.
## Jobs in the Workflow
1. **Code-Build**

  This job is responsible for:

- Checking out the code from the repository.
- Setting up Node.js and caching dependencies to improve performance.
- Installing the dependencies using npm install.
- Building the project using npm run build.
- Saving the build artifacts (e.g., output files in the dist/ directory) for downstream jobs.
2. **Docker-Build-Push**

  This job depends on the Code-Build job and is responsible for:
- Checking out the code.
- Setting up Docker Buildx for multi-platform builds.
- Logging in to Docker Hub using GitHub secrets.
- Reading the service version from a VERSION file.
- Building a Docker image tagged with the extracted version (e.g., soubarniya/mynode:<version>).
- Pushing the Docker image to Docker Hub (only for the main branch).

3. **K8s-Manifest-Update**

This job depends on the Docker-Build-Push job and only runs on the main branch. It is responsible for:

- Checking out the repository.
- Reading the service version from the VERSION file.
- Verifying the Docker image for the given version exists.
- Updating the Kubernetes manifest (node.yaml) with the new image version.
- Committing and pushing the changes to a dedicated branch in the argocd repository.

## Configuration Details 
### Secrets Required
- **DOCKER_USERNAME:** Docker Hub username.
- **DOCKER_PASSWORD:** Docker Hub password.
- **PERSONAL_ACCESS_TOKEN:** GitHub Personal Access Token with repository write permissions
### Environment Variables

- **VERSION**: Extracted from the VERSION file in the repository.
### File Structure
The workflow assumes the following files and directories:

- **VERSION:** Contains the version string of the Node.js service.
- **dist/:** Directory containing build output. (Replace if your build output is in a different location.)
- **node.yaml:** Kubernetes manifest file to be updated with the new Docker image version.
### External Repositories (K8s Yaml)
- **argocd:** Stores Kubernetes manifests for deployment.

## How to Use
- Clone this repository and set up the required secrets.
- Push changes to the `main`, `devops`, or `development` branches to trigger the workflow.
- Ensure the `VERSION` file is updated with the correct version number before pushing.

## Example Workflow File

Below is the actual GitHub Actions YAML configuration for the pipeline:

```
name: Node.js CI/CD Workflow

on:
  push:
    branches:
      - main
      - devops

  pull_request:
    branches:
      - development
  
jobs:
  Code-Build:
    runs-on: ubuntu-latest

    steps:

      - name: Check out code
        uses: actions/checkout@v4
      

      # Step 2: Set up Node.js with caching for dependencies
      - name: Set up Node.js with cache
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      # Step 3: Install dependencies and build code
      - name: Install dependencies
        run: npm install

      - name: Build code
        run: npm run build
  
      # Step 4: Save the build output as an artifact
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: artifact
          path: dist # Replace 'dist/' with the correct output directory

  Docker-Build-Push:
    runs-on: ubuntu-latest
    needs: Code-Build

    steps:  
      - name: Check out code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Read version from VERSION file
        id: read_version
        run: |
          # Read the entire content of the VERSION file and trim any surrounding whitespace
          VERSION=$(cat VERSION)
          echo "VERSION=$VERSION" >> $GITHUB_ENV
          echo "Version extracted: $VERSION"

      - name: Build Docker image with extracted version
        run: |
          docker build -t soubarniya/mynode:${{ env.VERSION }} .
          docker images

      - name: Push Docker image with extracted version
        if: github.ref == 'refs/heads/main'
        run: |

          docker push soubarniya/mynode:${{ env.VERSION }}

  K8s-Manifest-Update:
    runs-on: ubuntu-latest
    needs: Docker-Build-Push
    if: github.ref == 'refs/heads/main' # Only run this job if the branch is main

    steps: 
      - name: Check out code
        uses: actions/checkout@v4
      - name: Read version from VERSION file
        id: read_version
        run: |
          # Read the entire content of the VERSION file and trim any surrounding whitespace
          VERSION=$(cat VERSION)
          echo "VERSION=$VERSION" >> $GITHUB_ENV
          echo "Version extracted: $VERSION"
      - name: Check for docker image
        run: |
          docker pull soubarniya/mynode:${{ env.VERSION }}
          docker images
      - name: Update Kubernetes manifest
        run: |
          pwd
          ls -la
          git clone https://github.com/Soubarniya/argocd.git
          ls -la
          cd argocd
          ls -la
          # Create a new branch with a unique name (e.g., "update-node-version-${{ env.VERSION }}")
          git checkout -b node-version-${{ env.VERSION }}
          sed -i "s|image: soubarniya/mynode:.*|image: soubarniya/mynode:${{ env.VERSION }}|" node.yaml
          git status
          git diff
          cat node.yaml
          # Configure Git
          # git init .
          git config --global user.email "leosphere2001@gmail.com"
          git config --global user.name "Soubarniya"
          
          # Commit and push changes if there’s an update
          if git diff --exit-code --quiet; then
            echo "No changes to commit."
          else
            git add node.yaml
            git commit -m "Updated node.yaml with version ${{ env.VERSION }} | GitHub Actions Pipeline"
            git pull --rebase origin node-version-${{ env.VERSION }} || echo "Branch doesn't exist remotely, continuing."

            # git push https://x-access-token:${{ secrets.PERSONAL_ACCESS_TOKEN}}@github.com/Soubarniya/argocd.git
            git push https://x-access-token:${{ secrets.PERSONAL_ACCESS_TOKEN}}@github.com/Soubarniya/argocd.git node-version-${{ env.VERSION }}
          fi
```

#### Thank you for using this workflow to streamline the development and deployment process! 🚀

**Happy coding!**







  





