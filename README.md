# Arba Social Project

This project includes a Python backend and a static frontend. The backend and frontend are containerized using Docker for easy setup and deployment.

## Prerequisites

- **Docker**: Ensure to have Docker installed on your system. You can download it from [docker.com](https://www.docker.com).
- **Docker Compose**: Make sure Docker Compose is installed and available from the command line.

## Project Structure

- **`backend/`**: Contains the Python backend code.
- **`frontend/`**: Contains the HTML, CSS, and JavaScript files for the frontend.
- **`docker-compose.yml`**: A Docker Compose file to orchestrate the backend and frontend services.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/huzaifah-s/arba-social.git
   cd arba-social
   ```

2. **Build and start the Docker containers**:

   ```bash
   docker compose up --build
   ```

## Usage

- The frontend should be accessible from your web browser at `http://localhost:5001` (or another port specified in the `docker-compose.yml`).
- The backend API is typically accessible at `http://localhost:8642` (or another port specified in the `docker-compose.yml`).