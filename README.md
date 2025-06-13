# ContentFlowAI-CDK

Infrastructure-as-Code for the ContentFlowAI application, built using [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) in TypeScript.

This project defines and deploys the cloud infrastructure powering **ContentFlowAI**, a serverless web application for social media content generation using Large Language Models (LLMs).

---

## 🧱 Stacks Overview

The infrastructure is modular and organized into the following stacks:

- **ApiStack** – Configures Amazon API Gateway.
- **LambdaStack** – Deploys backend Lambda functions.
- **WebsiteStack** – Provisions an S3 bucket and CloudFront distribution for the frontend.
- **DynamoDbStack** – Creates the DynamoDB table for storing user content and metadata.
- **ApiCertificateStack** – Issues and manages certificates via AWS Certificate Manager (ACM).
- **CognitoStack** – Sets up a Cognito User Pool and configures it as an API Gateway authorizer.
- **KmsStack** – Generates a KMS key for encryption needs.
- **SqsStack** – Defines multiple SQS queues for asynchronous backend processing.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) (configured with your AWS account)
- [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/home.html)

---

### 📁 Project Structure

```text
ContentFlowAI-CDK/
├── bin/                       # CDK app entry point
├── lib/
│   ├── config/
│   │   └── config.ts          # AWS account/region configuration
│   └── stacks/                # All stack definitions
├── package.json
├── tsconfig.json
└── README.md
```

---

### 🔧 Setup

1. **Install dependencies**

```bash
npm install
```

2. **Bootstrap your AWS environment**  
(Only required once per environment/account)

```bash
cdk bootstrap
```

3. **Configure your AWS account and region**

Edit `/lib/config/config.ts`

4. **Deploy the CDK stacks**

```bash
cdk deploy
```

---

## 📚 CDK Modules Used

This project uses core AWS CDK libraries:

- `aws-cdk-lib/aws-apigateway`
- `aws-cdk-lib/aws-lambda`
- `aws-cdk-lib/aws-s3`
- `aws-cdk-lib/aws-cloudfront`
- `aws-cdk-lib/aws-dynamodb`
- `aws-cdk-lib/aws-certificatemanager`
- `aws-cdk-lib/aws-cognito`
- `aws-cdk-lib/aws-kms`
- `aws-cdk-lib/aws-sqs`

---

## 🛠 Maintainer

Built and maintained by Iulius Urieșu.

---
