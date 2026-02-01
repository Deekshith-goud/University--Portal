# Project File Structure

```text
STAMP/
├── .gitignore
├── README.md
├── LICENSE
├── .env.example
├── docker-compose.yml
├── Makefile
│
├── docs/
│   ├── architecture.md
│   ├── api_contracts.md
│   ├── database_schema.md
│   ├── implementation_plan.md
│   └── deployment_guide.md
│
├── scripts/
│   ├── diagnostics/
│   │   ├── check_database.py
│   │   ├── verify_data_integrity.py
│   │   └── reproduce_status.py
│   │
│   ├── migrations/
│   │   ├── versions/
│   │   │   ├── 001_init_schema.py
│   │   │   ├── 002_semester_to_year.py
│   │   │   └── 003_event_refactor.py
│   │   └── migrate.py
│   │
│   ├── seeds/
│   │   ├── seed_database.py
│   │   ├── seed_roles.py
│   │   └── seed_test_users.py
│   │
│   └── maintenance/
│       ├── assign_registration_numbers.py
│       ├── cleanup_orphan_records.py
│       └── fix_event_records.py
│
├── backend/
│   ├── README.md
│   ├── requirements.txt
│   ├── run_server.bat
│   ├── Dockerfile
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── __init__.py
│   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── migrations.py
│   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       ├── auth/
│   │   │       ├── users/
│   │   │       ├── academics/
│   │   │       ├── campus/
│   │   │       └── uploads/
│   │
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   └── policies/
│   │
│   │   ├── services/
│   │   ├── dependencies/
│   │   └── storage/
│   │
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── conftest.py
│
├── frontend/
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── public/
│   │   └── assets/
│   │       ├── images/
│   │       └── icons/
│   │
│   └── src/
│       ├── app/
│       ├── features/
│       ├── components/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── styles/
│
└── .github/
    └── workflows/
        └── ci.yml
 

