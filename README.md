# GraphQL Profile Page Project

## Objectives

The objective of this project is to learn the GraphQL query language by creating a personalized profile page. You will use the GraphQL endpoint provided by the platform at [https://((DOMAIN))/api/graphql-engine/v1/graphql](https://((DOMAIN))/api/graphql-engine/v1/graphql) to query your own data and populate your profile page.

To access your data, a login page needs to be created. The profile page must display basic user identification, XP amount, grades, audits, and skills. Additionally, a mandatory section for generating statistical graphs using SVG should be included.

## Instructions

### Profile UI

- Create a profile UI to display your own school information using data from the GraphQL endpoint.
- The UI design is flexible, but it must include a statistical section with at least two SVG graphs illustrating different aspects of your journey and achievements at the school.
- Possible graph combinations include XP earned over time, XP earned by project, audit ratio, projects pass/fail ratio, piscine (JS/Go) stats, attempts for each exercise, and more.
- Consider principles of good UI design while creating the interface.

### Login Page

- Obtain a JWT to access the GraphQL API from the signin endpoint at [https://((DOMAIN))/api/auth/signin](https://((DOMAIN))/api/auth/signin).
- Make a POST request to the signin endpoint using Basic authentication with base64 encoding for credentials (username:password or email:password).
- The login page must support both username:password and email:password combinations, displaying appropriate error messages for invalid credentials.
- Provide a method for logging out.
- When making GraphQL queries, use Bearer authentication with the obtained JWT to access data specific to the authenticated user. Extract the user ID from the JWT.

### Hosting

- Host your profile using platforms such as GitHub Pages, Netlify, or any other of your choice.

### GraphQL Tables and Columns

#### User Table

- Contains information about the user.

```graphql
user {
  id
  login
}
```

#### Transaction Table

- Provides access to XP, and through the user table, audits ratio.

```graphql
transaction {
  id
  type
  amount
  objectId
  userId
  createdAt
  path
}
```

#### Progress Table

- Includes user progression information.

```graphql
progress {
  id
  userId
  objectId
  grade
  createdAt
  updatedAt
  path
}
```

#### Result Table

- Gives information about student progression.

```graphql
result {
  id
  objectId
  userId
  grade
  type
  createdAt
  updatedAt
  path
}
```

#### Object Table

- Provides information about all objects (exercies/projects).

```graphql
object {
  id
  name
  type
  attrs
}
```

For more details on tables and their columns, refer to the [database-structure](database-structure) and [database-relations](database-relations) documentation.

## Examples

### Query the user table:

```graphql
{
  user {
    id
    login
  }
}
```

### Query the object table with arguments:
```graphql
{
  object(where: { id: { _eq: 3323 }}) {
    name
    type
  }
}
```

### Nesting using the result and user table:
```graphql
{
  result {
    id
    user {
      id
      login
    }
  }
}
```

## Things to learn about this project:
- GraphQL
- GraphiQL
- Hosting
- JWT
- Authentication
- Authorization
- UI/UX

live website: https://heroic-fairy-f81aab.netlify.app/
