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


#### Thank you for using this workflow to streamline the development and deployment process! 🚀

**Happy coding!**







  





