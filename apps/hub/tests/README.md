# Profile App Unit Tests

This directory contains the unit tests for the Profile app.

## Test Data

The `test-data.sql` file contains the template for SQL statements needed to seed the database with test data for the unit tests. The setup script dynamically generates `test-data-generated.sql` with proper IDs from Supabase auth users. This includes:

- Test users with different roles (super_admin, masjid_admin, registered)
- User profiles with different completion statuses
- Profile addresses
- Test masjids
- Masjid admin assignments
- Admin applications

## Running Tests

### Setting up the test environment

Before running the tests, you need to set up the test environment by loading the test data into the Supabase database:

```bash
# From the project root directory
./scripts/setup-test-env.sh
```

This script:

1. Resets the Supabase database
2. Creates test auth users in Supabase and gets their IDs
3. Dynamically generates SQL data using those IDs to ensure proper relationships
4. Loads the generated test data
5. Generates a `.env` file with test credentials in the profile app directory

### Running the tests

After setting up the test environment, you can run the tests:

```bash
# From the project root directory
cd app/hub
npm run test
```

## Test Users

The following test users are available for testing:

| Email                   | Password         | Role         | Notes                                           |
| ----------------------- | ---------------- | ------------ | ----------------------------------------------- |
| super.admin@test.com    | TestPassword123! | super_admin  | Complete profile                                |
| masjid.admin@test.com   | TestPassword123! | masjid_admin | Complete profile, admin of Masjid Al-Test       |
| user1@test.com          | TestPassword123! | registered   | Complete profile                                |
| user2@test.com          | TestPassword123! | registered   | Complete profile, has pending admin application |
| user3@test.com          | TestPassword123! | registered   | Complete profile, not email verified            |
| incompleteuser@test.com | TestPassword123! | registered   | Incomplete profile                              |

## Contract Tests

The `contract/` directory contains contract tests that validate the API endpoints according to the API specification. These tests ensure that the API behaves as expected and maintains backward compatibility.

## Modifying Test Data

If you need to modify the test data:

1. Edit the `test-data.sql` template file or modify the SQL generation in the `seed-supabase.sh` script
2. Run `./scripts/setup-test-env.sh` again to regenerate and reload the data
3. Run the tests

Note: The actual SQL executed is stored in `test-data-generated.sql` and contains the dynamically generated user IDs. You can review this file to understand what SQL was actually executed.

## Using Test Data for Development

You can also use the test data for development purposes by running the `setup-test-env.sh` script. This can be helpful when working on features that require specific user roles or data scenarios.
