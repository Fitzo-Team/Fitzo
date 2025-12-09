# 🥑 Fitzo - Smart Meal Planning System

Fitzo is a backend REST API application designed to help users organize their diet, plan meals, and manage recipes efficiently. The system is built with **.NET 8**, **PostgreSQL**, and follows a strict **Clean Architecture** approach utilizing GoF Design Patterns.

---

## 📖 Introduction
Fitzo allows users to:
- Create complex recipes with ingredients and tags.
- Calculate BMR and caloric needs based on biometrics.
- Plan meals for specific days and times.
- Generate shopping lists automatically.

The goal of this project is to demonstrate a robust, scalable architecture using modern DevOps practices and Design Patterns.

---

## 🛠️ Infrastructure & DevOps (In Progress)

This section outlines the environment setup and CI/CD strategies used in Fitzo.

### 🐳 Docker Compose (Test Environment)
To ensure a consistent development environment across the team, we use **Docker Compose**. It spins up the necessary infrastructure locally without polluting the host machine.

1.  **Start Environment:**
    ```bash
    docker-compose up -d
    ```
2.  **Access Services:**

| Service | URL / Host | Credentials | Description |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `localhost:5432` | User: `fitzouser`<br>Pass: `fitzopassword`<br>DB: `fitzo_db` | Main database for the API. |
| **PgAdmin 4** | [http://localhost:5050](http://localhost:5050) | Email: `admin@fitzo.com`<br>Pass: `admin` | Web GUI for managing PostgreSQL. |
| **Azurite** | `localhost:10000` | String: `UseDevelopmentStorage=true` | Emulator for Azure Blob Storage. |

> **⚠️ Important Note for PgAdmin:**
> When adding a new server inside PgAdmin, use **`db`** as the Host name/address (instead of `localhost`), because PgAdmin runs inside the Docker network.

### 🚀 Backend Pipeline (CI/CD)
We utilize **GitHub Actions** to automate our delivery process.
* **Workflow file:** `.github/workflows/backend-pipeline.yml`
* **Triggers:** Push to `main`, Pull Requests.
* **Steps:**
    1.  **Build & Test:** Compiles the .NET solution and runs Unit/Integration tests.
    2.  **Quality Gate:** Analyzes code with **SonarCloud** (Static Code Analysis).
    3.  **Security Scan:** Scans the Docker image with **Trivy** for vulnerabilities.
    4.  **Publish:** Pushes the Docker image to **GitHub Container Registry (GHCR)**.
    5.  **Deploy:** Automatically deploys the API to **Azure App Service**.

### 📐 UML Architecture
<img width="4096" height="1257" alt="image" src="https://github.com/user-attachments/assets/7244820b-68f6-4c52-a2c4-2ab0cb4fab20" />

> The system architecture is visualized using PlantUML, highlighting the relationships between the API Layer, Business Logic (Patterns), and Data Layer.

---

## 🧩 Core Modules & Design Patterns (Ready)

The application logic is driven by 5 key Design Patterns implemented in the core domain.

### 1. Recipe Creation Module
* **Pattern:** **Builder**
* **Description:** Managing the complexity of creating a `Recipe` object (handling ingredients, photos, tags, and stats).
* **Implementation:** A Dynamic **Director** controls the construction process based on input DTOs, ensuring that every recipe created via the API is valid and complete.

### 2. External Data Integration
* **Pattern:** **Adapter**
* **Description:** The system fetches nutritional data from external providers (e.g., OpenFoodFacts, USDA).
* **Implementation:** Adapters translate disparate JSON formats from external APIs into our internal `ProductDto` format, decoupling our core logic from 3rd party changes.

### 3. Optimization & Security
* **Pattern:** **Proxy (Caching & Protection)**
* **Description:**
    * **Caching Proxy:** Stores responses from external APIs in memory to reduce latency and API calls.
    * **Protection Proxy:** Acts as a gatekeeper for the `RecipeManager`, checking user permissions (Authorization) before executing sensitive operations like deleting a recipe.

### 4. Validation Module
* **Pattern:** **Chain of Responsibility**
* **Description:** Validating recipe integrity before saving to the database.
* **Implementation:** A chain of validators (`DataIntegrityValidator` -> `IngredientsCountValidator` -> `ImageValidator`) processes the recipe. If any link in the chain fails, the process stops and returns an error.

### 5. Metrics & Personalization
* **Pattern:** **Strategy**
* **Description:** Calculating user caloric needs (BMR) based on different mathematical models.
* **Implementation:** The system can switch between strategies (e.g., `MifflinStJeorStrategy` vs `HarrisBenedictStrategy`) dynamically based on user preference or profile settings.

---

## 🚦 Roadmap

### Phase 1: Foundation & Infrastructure 🏗️
- [x] Setup .NET 8 Web API Project with Layered Architecture.
- [x] Configure **Docker Compose** environment (PostgreSQL, PgAdmin, Azurite).
- [x] Setup **CI/CD Pipeline** with GitHub Actions (Build, Test, Analyze, Deploy).
- [ ] Configure **Entity Framework Core** and apply initial Migrations.
- [ ] Implement **Authentication & Authorization** (ASP.NET Identity + JWT).

### Phase 2: Core Domain Implementation (Design Patterns) 🧠
- [ ] **Builder Pattern:** Implement `RecipeDirector` and `RecipeBuilder` for creating complex recipes.
- [ ] **Chain of Responsibility:** Implement Validation Handlers (`DataIntegrity`, `IngredientsCount`).
- [ ] **Strategy Pattern:** Implement `BmrCalculator` with `MifflinStJeor` and `HarrisBenedict` algorithms.
- [ ] **Adapter Pattern:** Create HTTP Clients for OpenFoodFacts API and map responses to `ProductDto`.
- [ ] **Proxy Pattern:** Implement Caching for external API calls using `IMemoryCache`.

### Phase 3: Business Logic & Features 💼
- [ ] Implement **Protection Proxy** for secure operations (Delete/Edit Recipes).
- [ ] **Calendar Module:** Create `CalendarService` to manage `MealPlanEntry` (assigning recipes to dates).
- [ ] **Shopping List:** Implement `ShoppingListGenerator` to aggregate ingredients from the weekly plan.
- [ ] **Statistics:** Add logic for tracking recipe usage counts and generating user reports.
- [ ] **Data Export:** Implement JSON export/import functionality for user data.

### Phase 4: Client & Quality Assurance 📱
- [ ] **Unit Testing:** Achieve >50% code coverage for Core Logic (xUnit + Moq).
- [ ] **Documentation:** Create API documentation.
- [ ] **Mobile App MVP:** Initialize React Native/Expo project.
- [ ] **Mobile Integration:** Connect mobile app to the Backend API (Login, Fetch Recipes).

---

## 🏃 How to Run
1.  Clone the repository.
2.  Run `docker-compose up -d`.
3.  Open solution in Visual Studio.
4.  Run the **Fitzo.API** project.
