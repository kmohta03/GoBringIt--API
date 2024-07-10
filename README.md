<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# File Structure
```sh
.
├── package.json          // Project metadata and dependencies
├── serverless.yml        // API route definitions, DB connection, configuration
└── src
    ├── functions         // Lambda functions directory
    │   ├── buildRestaurants.js   // Create all resteruant menus
    │   ├── categories.js      // CRUD operations/logic for categories 
    │   ├── items.js           // CRUD operations/logic for categories  items
    │   ├── modifierGroupItems.js  // CRUD operations/logic for categories  group items
    │   ├── modifierGroups.js  // CRUD operations/logic for categories  modifier groups
    │   └── buildRestaurants.js    // Utility to build restaurant menus
    │   └── restaurants.js     // CRUD operations/logic for categories  restaurants
    ├── utils               // Utility directory
    │   └── db.js          // Lambda layer to connect to AWS RDS Postgres instance

```
# Routes & Lambdas

## Restaurants
- **List Restaurants**
  - Endpoint: `GET /restaurants`
  - Lambda: `gobringitserverless-dev-listRestaurants`
- **Get Restaurant**
  - Endpoint: `GET /restaurants/{id}`
  - Lambda: `gobringitserverless-dev-getRestaurant`
- **Create Restaurant**
  - Endpoint: `POST /restaurants`
  - Lambda: `gobringitserverless-dev-createRestaurant`
- **Update Restaurant**
  - Endpoint: `PUT /restaurants/{id}`
  - Lambda: `gobringitserverless-dev-updateRestaurant`
- **Delete Restaurant**
  - Endpoint: `DELETE /restaurants/{id}`
  - Lambda: `gobringitserverless-dev-deleteRestaurant`

## Categories
- **List Categories**
  - Endpoint: `GET /categories`
  - Lambda: `gobringitserverless-dev-listCategories`
- **List Categories by Restaurant**
  - Endpoint: `GET /restaurants/{id}/categories`
  - Lambda: `gobringitserverless-dev-listCategoriesByRestaurant`
- **Create Category**
  - Endpoint: `POST /categories`
  - Lambda: `gobringitserverless-dev-createCategory`
- **Update Category**
  - Endpoint: `PUT /categories/{id}`
  - Lambda: `gobringitserverless-dev-updateCategory`
- **Delete Category**
  - Endpoint: `DELETE /categories/{id}`
  - Lambda: `gobringitserverless-dev-deleteCategory`

## Items
- **Create Item**
  - Endpoint: `POST /items`
  - Lambda: `gobringitserverless-dev-createItem`
- **List Items by Restaurant**
  - Endpoint: `GET /restaurants/{id}/items`
  - Lambda: `gobringitserverless-dev-listItemsByRestaurant`
- **List Items by Category**
  - Endpoint: `GET /categories/{id}/items`
  - Lambda: `gobringitserverless-dev-listItemByCategory`
- **Update Item**
  - Endpoint: `PUT /items/{id}`
  - Lambda: `gobringitserverless-dev-updateItem`
- **Delete Item**
  - Endpoint: `DELETE /items/{id}`
  - Lambda: `gobringitserverless-dev-deleteItem`

## Modifier Groups
- **List Modifier Groups by Restaurant**
  - Endpoint: `GET /restaurants/{id}/modifierGroups`
  - Lambda: `gobringitserverless-dev-listModifierGroupsByRestaurant`
- **Create Modifier Group**
  - Endpoint: `POST /modifierGroups`
  - Lambda: `gobringitserverless-dev-createModifierGroup`
- **Update Modifier Group**
  - Endpoint: `PUT /modifierGroups/{id}`
  - Lambda: `gobringitserverless-dev-updateModifierGroup`
- **Delete Modifier Group**
  - Endpoint: `DELETE /modifierGroups/{id}`
  - Lambda: `gobringitserverless-dev-deleteModifierGroup`

## Modifier Group Items
- **Create Modifier Group Item**
  - Endpoint: `POST /modifierGroupItems`
  - Lambda: `gobringitserverless-dev-createModifierGroupItem`
- **List Modifier Group Items by Modifier Group**
  - Endpoint: `GET /modifierGroups/{id}/modifierGroupItems`
  - Lambda: `gobringitserverless-dev-listModifierGroupItemsByModifierGroup`
- **List Modifier Group Items by Item**
  - Endpoint: `GET /items/{id}/modifierGroupItems`
  - Lambda: `gobringitserverless-dev-listModifierGroupItemsByItem`
- **Update Modifier Group Item**
  - Endpoint: `PUT /modifierGroupItems`
  - Lambda: `gobringitserverless-dev-updateModifierGroupItem`
- **Delete Modifier Group Item**
  - Endpoint: `DELETE /modifierGroupItems/{modifier_group_id}/{item_id}`
  - Lambda: `gobringitserverless-dev-deleteModifierGroupItem`

## Users
- **Check NetID**
  - Endpoint: `GET /checkNetID/{netID}`
  - Lambda: `gobringitserverless-dev-checkNetID`
-- **dukeBasedNetID**
  - Endpoint: `GET /dukeBasedNetID/{netID}`
  - Lambda: `gobringitserverless-dev-dukeBaedNetID`
- **Create User**
  - Endpoint: `POST /createAccount`
  - Lambda: `gobringitserverless-dev-createUser`
- **Get User**
  - Endpoint: `GET /users/{id}`
  - Lambda: `gobringitserverless-dev-getUser`
- **Update User**
  - Endpoint: `PUT /users/{id}`
  - Lambda: `gobringitserverless-dev-updateUser`
- **Delete User**
  - Endpoint: `DELETE /users/{id}`
  - Lambda: `gobringitserverless-dev-deleteUser`

## Orders
- **List Orders by User**
  - Endpoint: `GET /orders/{userId}`
  - Lambda: `gobringitserverless-dev-ordersByUser`
- **Create Order**
  - Endpoint: `POST /orders/{userId}`
  - Lambda: `gobringitserverless-dev-createOrder`

## Tags
- **Create Tag**
  - Endpoint: `POST /tags`
  - Lambda: `gobringitserverless-dev-createTag`
- **Delete Tag**
  - Endpoint: `DELETE /tags/{id}`
  - Lambda: `gobringitserverless-dev-deleteTag`

## Restaurant Tags
- **Create Restaurant Tag**
  - Endpoint: `POST /restaurantTags`
  - Lambda: `gobringitserverless-dev-createRestaurantTag`
- **Get Restaurant Tags**
  - Endpoint: `GET /restaurantTags/{restaurant_id}`
  - Lambda: `gobringitserverless-dev-getRestaurantTags`
- **Delete Restaurant Tag**
  - Endpoint: `DELETE /restaurantTags/{restaurant_id}/{tag_id}`
  - Lambda: `gobringitserverless-dev-deleteRestaurantTag`

## Menus
- **Build Menus**
  - Endpoint: `GET /buildMenus`
  - Lambda: `gobringitserverless-dev-buildMenus`

## Payment Methods
- **Create Payment Method**
  - Endpoint: `POST /paymentMethods`
  - Lambda: `gobringitserverless-dev-createPaymentMethod`
- 
- **Update Payment Method**
  - Endpoint: `PUT /paymentMethods`
  - Lambda: `gobringitserverless-dev-confirmPaymentMethod`
- **List Payment Methods by Customer**
  - Endpoint: `GET /paymentMethods/{customerId}`
  - Lambda: `gobringitserverless-dev-listCustomerCards`

## Test Routes (ignore)
- **Allow Internet Access**
  - Endpoint: `GET /allowInternet`
  - Lambda: `gobringitserverless-dev-allowInternet`

# Serverless Framework Node HTTP API on AWS


## Usage

### Deployment

```
$ serverless deploy
```

After deploying, you should see output similar to:

```bash
Deploying aws-node-http-api-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-http-api-project-dev (152s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: aws-node-http-api-project-dev-hello (1.9 kB)
```


### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following (removed `input` content for brevity):

```json
{
  "message": "Go Serverless v2.0! Your function executed successfully!",
  "input": {
    ...
  }
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
  "statusCode": 200,
  "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```


Alternatively, it is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
