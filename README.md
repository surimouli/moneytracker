<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">💸 MoneyTracker</h3>

  <p align="center">
    A clean personal finance tracker to log income, spending, and stay aware of your money.
    <br />
    Built to be simple, aesthetic, and actually usable.
    <br />
    <br />
    <a href="#about-the-project"><strong>Explore the project »</strong></a>
    <br />
    <br />
    <a href="#features">View Features</a>
    &middot;
    <a href="https://github.com/surimouli/moneytracker/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/surimouli/moneytracker/issues">Request Feature</a>
  </p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#features">Features</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

---

## About The Project

**MoneyTracker** is a full-stack web application that helps users track their personal finances without unnecessary complexity.

The goal of this project was to build a tool that:
- feels **lightweight and friendly**, not overwhelming
- supports **real-world habits** (like logging transactions late)
- works smoothly on **both desktop and mobile**
- keeps user data **secure and persistent**

Users can:
- log income and spending
- organize transactions by custom categories
- view a complete transaction history
- see summaries like total earned, total spent, and current balance
- export their data for external use

This project was built from scratch using Flask and deployed to the cloud.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Built With

* **Python (Flask)** — backend web framework  
* **Flask-SQLAlchemy** — ORM and database management  
* **PostgreSQL** — persistent production database  
* **HTML / Jinja2** — server-rendered frontend  
* **CSS (custom)** — responsive, glass-style UI  
* **Bootstrap 5** — layout and components  
* **Render** — cloud deployment  
* **Gunicorn** — production WSGI server  

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Features

- 🔐 **User Authentication**
  - Register, login, logout
  - Passwords securely hashed

- 💵 **Transactions**
  - Income (positive) and spending (negative)
  - Optional custom date (for late entries)
  - Notes for context
  - Edit and delete existing transactions

- 🏷️ **Categories**
  - User-defined categories
  - Used across all transactions

- 📊 **History & Insights**
  - Full transaction history
  - Summary cards:
    - Current balance
    - Total earned
    - Total spent
  - Time-based views (today, week, month, etc.)

- 📤 **Export**
  - Download transaction history as an Excel file

- 📱 **Responsive Design**
  - Desktop and mobile layouts
  - Optimized navigation for small screens

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

You can run MoneyTracker locally or deploy it to the cloud.

### Prerequisites

* Python 3.10+
* pip
* Git
* (Optional) PostgreSQL for production

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Installation

1. **Clone the repository**
   
   ```sh
   git clone https://github.com/surimouli/moneytracker.git
   cd moneytracker

3. **Create and activate a virtual environment**
   
   ```sh
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   
4. **Install dependencies**
   
   ```sh
   pip install -r requirements.txt
   Run the app locally
   
   ```sh
   flask run
   The app will be available at:
   http://127.0.0.1:5000
  
<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Usage
- Create an account or log in
- Add income and spending transactions
- Assign categories and notes
- View summaries and transaction history
- Export your data when needed

The app supports custom dates, so you can log transactions even if you forgot to enter them earlier.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Deployment

MoneyTracker is deployed on Render using:
- Gunicorn for serving the app
- PostgreSQL for persistent storage
- Environment variables for secrets and database credentials
All user data is stored safely in the database and persists across deployments.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Roadmap
- Monthly budget limits
- Category-level analytics
- Charts and visual trends
- CSV export option
- Multi-currency support

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

### Contact
Mouli Suri

- LinkedIn: https://www.linkedin.com/in/moulisuri/
- GitHub: https://github.com/surimouli
- Project Link: https://github.com/surimouli/moneytracker

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---
