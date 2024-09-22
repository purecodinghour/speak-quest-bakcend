## 1. Clone the Git Repository
Open your terminal and run the following command to clone the repository:
```
git clone https://github.com/purecodinghour/speak-quest-bakcend.git
```
## 2. Log in to Docker
Log in to Docker to ensure access to the Docker. Run the following command:
```
docker login
```
## 3. Switch to the DockerLocal Branch
Switch to the DockerLocal branch with the following command:
```
git checkout DockerLocal
```

## 4. Install Docker Compose using Homebrew (if not already installed)
If Docker Compose is not installed, you can install it using Homebrew:
```
brew install docker-compose
```

## 5. Run Docker Compose to start the services
Run the following command to start the services:
```
docker compose up || docker-compose up
```

## 6. Test the API using local port 4000 (refer to the common API documentation)
Test the API using the following base URL:
## http://localhost:4000
#Example:
Open Postman or your preferred API testing tool and use the following base URL:

