### TypeORM migration
Adapted from: https://github.com/ambroiseRabier/typeorm-nestjs-migration-example/

#### Objectives
Generate and use migrations instead of syncing database.
This is the recommended method by TypeORM once you have data on production, to avoid any loss.

#### Usage
In `/server` folder:
1. Generate migration: `npm run typeorm:migration:generate <myEntity-migration>`
2. Check your migration queries in `src/migration`
3. Apply migrations: `npm run typeorm:migration:run`

If everything went well, you have up to date entites and a `migrations` table listing applied migrations.
